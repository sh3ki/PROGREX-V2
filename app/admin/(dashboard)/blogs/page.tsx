import { revalidatePath } from 'next/cache'
import { createHash, randomBytes } from 'node:crypto'
import { requirePermission } from '@/lib/server/admin-permission'
import { sql } from '@/lib/server/db'
import AdminBlogsTemplateView from '@/components/admin/blogs/AdminBlogsTemplateView'

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2)
}

function normalizeRoleWithProgrex(role: string) {
  const value = role.trim()
  if (!value) return 'PROGREX'
  return value.toLowerCase().includes('progrex') ? value : `${value}, PROGREX`
}

function pickRelatedByTitleFallback(inputTitle: string, candidates: Array<{ slug: string; title: string }>, limit = 2) {
  const source = new Set(tokenize(inputTitle))

  return candidates
    .map((candidate) => {
      const candidateTokens = tokenize(candidate.title)
      const overlap = candidateTokens.filter((token) => source.has(token)).length
      const startsWithBoost = candidate.title.toLowerCase().startsWith(inputTitle.toLowerCase().slice(0, 8)) ? 1 : 0
      return { slug: candidate.slug, score: overlap * 3 + startsWithBoost }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.slug)
}

async function pickRelatedByGroq(inputTitle: string, category: string, candidates: Array<{ slug: string; title: string }>, limit = 2) {
  if (candidates.length === 0) return []

  const fallback = pickRelatedByTitleFallback(inputTitle, candidates, limit)
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return fallback

  const promptCandidates = candidates.map((item) => `- slug: ${item.slug}\n  title: ${item.title}`).join('\n')

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: 'You are a strict JSON generator. Return only valid JSON.',
          },
          {
            role: 'user',
            content: `Pick the 2 most related blog posts by title similarity within the same category.\nCategory: ${category}\nNew blog title: ${inputTitle}\nCandidates:\n${promptCandidates}\n\nReturn exactly this JSON shape: {"relatedSlugs":["slug-1","slug-2"]}`,
          },
        ],
      }),
    })

    if (!response.ok) return fallback

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }

    const content = payload.choices?.[0]?.message?.content?.trim() || ''
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return fallback

    const parsed = JSON.parse(jsonMatch[0]) as { relatedSlugs?: string[] }
    const allowed = new Set(candidates.map((item) => item.slug))
    const slugs = (parsed.relatedSlugs || []).filter((slug) => allowed.has(slug)).slice(0, limit)
    if (slugs.length === 0) return fallback

    if (slugs.length < limit) {
      const fill = fallback.filter((slug) => !slugs.includes(slug)).slice(0, limit - slugs.length)
      return [...slugs, ...fill]
    }

    return slugs
  } catch {
    return fallback
  }
}

async function ensureBlogColumns() {
  await sql('alter table blogs add column if not exists team_member_id uuid')
  await sql('alter table blogs add column if not exists is_published boolean not null default true')
  await sql('alter table blogs add column if not exists related_posts text[] default array[]::text[]')
  await sql('alter table blogs add column if not exists keywords text[] default array[]::text[]')
  await sql('alter table blogs add column if not exists tags text[] default array[]::text[]')

  await sql(`
    do $$
    begin
      if not exists (
        select 1
        from pg_constraint
        where conname = 'blogs_team_member_id_fkey'
      ) then
        alter table blogs
          add constraint blogs_team_member_id_fkey
          foreign key (team_member_id)
          references team_members(id)
          on delete set null;
      end if;
    end $$;
  `)

  // Backfill missing team member IDs for older records using author identity.
  await sql(`
    update blogs b
    set team_member_id = tm.id
    from team_members tm
    where b.team_member_id is null
      and lower(trim(coalesce(b.author_name, ''))) = lower(trim(tm.name));
  `)

  await sql(`
    update blogs
    set published_at = to_char(coalesce(created_at, now())::date, 'YYYY-MM-DD')
    where coalesce(trim(published_at), '') = '';
  `)
}

async function uploadBlogImage(file: File, opts: { folder: string; filename: string }) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.')
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const signatureBase = `folder=${opts.folder}&public_id=${opts.filename}&timestamp=${timestamp}${apiSecret}`
  const signature = createHash('sha1').update(signatureBase).digest('hex')

  const body = new FormData()
  body.append('file', file)
  body.append('api_key', apiKey)
  body.append('timestamp', String(timestamp))
  body.append('folder', opts.folder)
  body.append('public_id', opts.filename)
  body.append('signature', signature)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body,
  })

  const payload = (await response.json()) as { secure_url?: string; error?: { message?: string } }
  if (!response.ok || !payload.secure_url) {
    throw new Error(payload.error?.message || 'Cloudinary upload failed.')
  }

  return payload.secure_url
}

async function uploadBlogImageFromUrl(imageUrl: string, opts: { folder: string; filename: string }) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.')
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const signatureBase = `folder=${opts.folder}&public_id=${opts.filename}&timestamp=${timestamp}${apiSecret}`
  const signature = createHash('sha1').update(signatureBase).digest('hex')

  const body = new FormData()
  body.append('file', imageUrl)
  body.append('api_key', apiKey)
  body.append('timestamp', String(timestamp))
  body.append('folder', opts.folder)
  body.append('public_id', opts.filename)
  body.append('signature', signature)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body,
  })

  const payload = (await response.json()) as { secure_url?: string; error?: { message?: string } }
  if (!response.ok || !payload.secure_url) {
    throw new Error(payload.error?.message || 'Cloudinary upload failed.')
  }

  return payload.secure_url
}

async function resolveBlogImage(formData: FormData, title: string, fallback: string) {
  const image = formData.get('coverImage')

  if (!(image instanceof File) || image.size <= 0) {
    const isExternalUrl = fallback.startsWith('http') && !fallback.includes('/res.cloudinary.com/')
    if (!isExternalUrl) return fallback

    const base = slugify(title).slice(0, 60) || 'blog'
    const filename = `${base}-${randomBytes(3).toString('hex')}`
    return uploadBlogImageFromUrl(fallback, { folder: 'ProgreX Blogs', filename })
  }

  const base = slugify(title).slice(0, 60) || 'blog'
  const filename = `${base}-${randomBytes(3).toString('hex')}`
  return uploadBlogImage(image, { folder: 'ProgreX Blogs', filename })
}

async function saveBlog(formData: FormData) {
  'use server'
  await requirePermission('blogs', 'write')
  await ensureBlogColumns()

  const id = String(formData.get('id') ?? '')
  const title = String(formData.get('title') ?? '').trim()
  const slug = slugify(title || String(formData.get('slug') ?? '').trim())
  const category = String(formData.get('category') ?? '').trim()
  const teamMemberId = String(formData.get('teamMemberId') ?? '').trim()
  const date = String(formData.get('date') ?? '').trim()
  const readTime = String(formData.get('readTime') ?? '').trim()
  const existingImage = String(formData.get('existingImage') ?? '').trim()
  const excerpt = String(formData.get('excerpt') ?? '')
  const tags = String(formData.get('tags') ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  const keywords = String(formData.get('keywords') ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  const content = String(formData.get('content') ?? '')
  const metaTitle = String(formData.get('metaTitle') ?? '').trim()
  const metaDescription = String(formData.get('metaDescription') ?? '').trim()
  const status = String(formData.get('status') ?? 'published')
  const image = await resolveBlogImage(formData, title, existingImage)

  if (!slug || !title) return
  if (!teamMemberId) throw new Error('Please select an author from team members.')

  const members = await sql<{ id: string; name: string; role: string; avatar: string }>('select id, name, role, avatar from team_members where id = $1 limit 1', [teamMemberId])
  const member = members[0]
  if (!member) throw new Error('Selected team member was not found.')

  let relatedPosts: string[] = []
  if (id) {
    const existing = await sql<{ related_posts: string[] }>('select related_posts from blogs where id = $1::uuid limit 1', [id])
    relatedPosts = existing[0]?.related_posts || []
  } else {
    const candidates = await sql<{ slug: string; title: string }>(
      `select slug, title
       from blogs
       where category = $1
       order by created_at desc`,
      [category]
    )
    relatedPosts = await pickRelatedByGroq(title, category, candidates, 2)
  }

  const authorRole = normalizeRoleWithProgrex(member.role)

  if (id) {
    await sql(
      `update blogs
       set slug = $2, title = $3, category = $4, team_member_id = $5,
           author_name = $6, author_role = $7, author_avatar = $8,
           published_at = $9, read_time = $10, image = $11, excerpt = $12,
           tags = $13::text[], keywords = $14::text[], related_posts = $15::text[],
           content = $16, meta_title = $17, meta_description = $18,
           is_published = $19, updated_at = now()
       where id = $1`,
      [
        id,
        slug,
        title,
        category,
        teamMemberId,
        member.name,
        authorRole,
        member.avatar,
        date,
        readTime,
        image,
        excerpt,
        tags,
        keywords,
        relatedPosts,
        content,
        metaTitle,
        metaDescription,
        status === 'published',
      ]
    )
  } else {
    await sql(
      `insert into blogs(slug, title, category, team_member_id, author_name, author_role, author_avatar, published_at, read_time, image, excerpt, tags, keywords, related_posts, content, meta_title, meta_description, is_published)
       values ($1, $2, $3, $4::uuid, $5, $6, $7, $8, $9, $10, $11, $12::text[], $13::text[], $14::text[], $15, $16, $17, $18)`,
      [slug, title, category, teamMemberId, member.name, authorRole, member.avatar, date, readTime, image, excerpt, tags, keywords, relatedPosts, content, metaTitle, metaDescription, status === 'published']
    )
  }

  revalidatePath('/admin/blogs')
  revalidatePath('/blogs')
}

async function generateBlogDraft(formData: FormData) {
  'use server'
  await requirePermission('blogs', 'write')

  const category = String(formData.get('category') ?? 'Tech').trim() || 'Tech'
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured.')
  }

  const today = new Date().toISOString().slice(0, 10)
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.35,
      messages: [
        {
          role: 'system',
          content: 'You are an expert SEO content strategist for PROGREX. Return only valid JSON with no markdown fences.',
        },
        {
          role: 'user',
          content:
            `Generate a complete, SEO-focused blog draft for category "${category}".\n` +
            'Target search visibility for Philippine and global business/tech audiences.\n' +
            'Return exactly this JSON shape: ' +
            '{"title":"","slug":"","readTime":"","excerpt":"","tags":[""],"keywords":[""],"content":"","metaTitle":"","metaDescription":"","imageQuery":""}.\n' +
            'Rules: content must use markdown with headings, bullet lists, and **bold** where useful; 900-1400 words; practical and conversion-aware; no code fences.',
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to generate blog draft from GROQ.')
  }

  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> }
  const content = payload.choices?.[0]?.message?.content?.trim() || ''
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('GROQ returned an invalid draft format.')
  }

  const parsed = JSON.parse(jsonMatch[0]) as {
    title?: string
    slug?: string
    readTime?: string
    excerpt?: string
    tags?: string[]
    keywords?: string[]
    content?: string
    metaTitle?: string
    metaDescription?: string
    imageQuery?: string
  }

  const title = (parsed.title || '').trim() || `${category} Guide for Better Search Visibility`
  const slug = slugify(parsed.slug || title)
  const imageQuery = (parsed.imageQuery || `${category} technology business`).trim()
  const generatedImage = `https://source.unsplash.com/1600x900/?${encodeURIComponent(imageQuery)}`

  return {
    title,
    slug,
    category,
    publishedAt: today,
    readTime: (parsed.readTime || '8 min read').trim(),
    excerpt: parsed.excerpt || '',
    tags: (parsed.tags || []).filter(Boolean).join(', '),
    keywords: (parsed.keywords || []).filter(Boolean).join(', '),
    content: parsed.content || '',
    metaTitle: (parsed.metaTitle || title).trim(),
    metaDescription: (parsed.metaDescription || parsed.excerpt || '').trim(),
    image: generatedImage,
  }
}

async function toggleBlogPublish(formData: FormData) {
  'use server'
  await requirePermission('blogs', 'write')

  const id = String(formData.get('id') ?? '').trim()
  if (!id) return

  await sql('update blogs set is_published = not is_published, updated_at = now() where id = $1', [id])
  revalidatePath('/admin/blogs')
  revalidatePath('/blogs')
}

async function deleteBlog(formData: FormData) {
  'use server'
  await requirePermission('blogs', 'delete')
  const id = String(formData.get('id') ?? '')
  await sql('delete from blogs where id = $1', [id])
  revalidatePath('/admin/blogs')
  revalidatePath('/blogs')
}

async function bulkDeleteBlogs(formData: FormData) {
  'use server'
  await requirePermission('blogs', 'delete')

  const ids = String(formData.get('ids') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (ids.length === 0) return

  await sql('delete from blogs where id = any($1::uuid[])', [ids])
  revalidatePath('/admin/blogs')
  revalidatePath('/blogs')
}

async function bulkSetBlogsDraft(formData: FormData) {
  'use server'
  await requirePermission('blogs', 'write')

  const ids = String(formData.get('ids') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (ids.length === 0) return

  await sql('update blogs set is_published = false, updated_at = now() where id = any($1::uuid[])', [ids])
  revalidatePath('/admin/blogs')
  revalidatePath('/blogs')
}

export default async function AdminBlogsPage() {
  await requirePermission('blogs', 'read')
  await ensureBlogColumns()

  const blogs = await sql<{
    id: string
    slug: string
    title: string
    category: string
    team_member_id: string | null
    author_name: string
    author_role: string
    author_avatar: string
    published_at: string
    read_time: string
    image: string
    excerpt: string
    tags: string[]
    keywords: string[]
    related_posts: string[]
    content: string
    meta_title: string
    meta_description: string
    is_published: boolean
  }>(
    `select b.id, b.slug, b.title, b.category, b.team_member_id,
            coalesce(tm.name, b.author_name) as author_name,
            coalesce(tm.role, b.author_role) as author_role,
            coalesce(tm.avatar, b.author_avatar) as author_avatar,
            case
              when coalesce(trim(b.published_at), '') = '' then to_char(coalesce(b.created_at, now())::date, 'YYYY-MM-DD')
              when b.published_at ~ '^\\d{4}-\\d{2}-\\d{2}$' then b.published_at
              when b.published_at ~ '^\\d{1,2}/\\d{1,2}/\\d{4}$' then to_char(to_date(b.published_at, 'MM/DD/YYYY'), 'YYYY-MM-DD')
              when b.published_at ~ '^[A-Za-z]+\\s+\\d{1,2},\\s+\\d{4}$' then to_char(to_date(b.published_at, 'FMMonth DD, YYYY'), 'YYYY-MM-DD')
              else to_char(coalesce(b.created_at, now())::date, 'YYYY-MM-DD')
            end as published_at,
            b.read_time, b.image,
            b.excerpt, b.tags, b.keywords, b.related_posts, b.content,
            b.meta_title, b.meta_description, b.is_published
     from blogs b
     left join team_members tm on tm.id = b.team_member_id
     order by b.created_at desc`
  )

  const teamMembers = await sql<{
    id: string
    name: string
    role: string
    avatar: string
    is_active: boolean
  }>('select id, name, role, avatar, is_active from team_members order by sort_order asc, created_at asc')

  return (
    <AdminBlogsTemplateView
      blogs={blogs.map((blog) => ({
        id: blog.id,
        slug: blog.slug,
        title: blog.title,
        category: blog.category,
        teamMemberId: blog.team_member_id,
        authorName: blog.author_name || '',
        authorRole: blog.author_role || '',
        authorAvatar: blog.author_avatar || '',
        publishedAt: blog.published_at || '',
        readTime: blog.read_time || '',
        image: blog.image || '',
        excerpt: blog.excerpt || '',
        tags: blog.tags || [],
        keywords: blog.keywords || [],
        relatedPosts: blog.related_posts || [],
        content: blog.content || '',
        metaTitle: blog.meta_title || '',
        metaDescription: blog.meta_description || '',
        isPublished: blog.is_published,
      }))}
      teamOptions={teamMembers.map((item) => ({
        id: item.id,
        name: item.name,
        role: item.role,
        avatar: item.avatar || '',
        isActive: item.is_active,
      }))}
      createBlogAction={saveBlog}
      updateBlogAction={saveBlog}
      deleteBlogAction={deleteBlog}
      bulkDeleteBlogAction={bulkDeleteBlogs}
      bulkSetDraftBlogAction={bulkSetBlogsDraft}
      togglePublishAction={toggleBlogPublish}
      generateBlogDraftAction={generateBlogDraft}
    />
  )
}
