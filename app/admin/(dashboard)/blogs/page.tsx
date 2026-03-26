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

function pickRelatedPostsBySimilarity(input: { title: string; excerpt: string; content: string; tags: string[] }, candidates: Array<{ slug: string; title: string; excerpt: string; content: string; tags: string[] }>, limit = 3) {
  const sourceTokens = new Set([...tokenize(input.title), ...tokenize(input.excerpt), ...tokenize(input.content), ...input.tags.map((tag) => tag.toLowerCase())])

  return candidates
    .map((candidate) => {
      const candidateTokens = new Set([...tokenize(candidate.title), ...tokenize(candidate.excerpt), ...tokenize(candidate.content), ...(candidate.tags ?? []).map((tag) => tag.toLowerCase())])
      let overlap = 0
      sourceTokens.forEach((token) => {
        if (candidateTokens.has(token)) overlap += 1
      })

      const titleOverlap = tokenize(candidate.title).filter((token) => sourceTokens.has(token)).length
      const score = overlap + titleOverlap * 2
      return { slug: candidate.slug, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.slug)
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

async function resolveBlogImage(formData: FormData, title: string, fallback: string) {
  const image = formData.get('coverImage')
  if (!(image instanceof File) || image.size <= 0) return fallback

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
  const excerpt = String(formData.get('excerpt') ?? '').trim()
  const tags = String(formData.get('tags') ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  const keywords = String(formData.get('keywords') ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  const content = String(formData.get('content') ?? '').trim()
  const metaTitle = String(formData.get('metaTitle') ?? '').trim()
  const metaDescription = String(formData.get('metaDescription') ?? '').trim()
  const status = String(formData.get('status') ?? 'published')
  const image = await resolveBlogImage(formData, title, existingImage)

  if (!slug || !title) return
  if (!teamMemberId) throw new Error('Please select an author from team members.')

  const members = await sql<{ id: string; name: string; role: string; avatar: string }>('select id, name, role, avatar from team_members where id = $1 limit 1', [teamMemberId])
  const member = members[0]
  if (!member) throw new Error('Selected team member was not found.')

  const candidates = await sql<{ slug: string; title: string; excerpt: string; content: string; tags: string[] }>(
    `select slug, title, excerpt, content, tags
     from blogs
     where ($1::uuid is null or id <> $1::uuid)` ,
    [id || null]
  )
  const relatedPosts = pickRelatedPostsBySimilarity({ title, excerpt, content, tags }, candidates, 3)

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
        member.role,
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
      [slug, title, category, teamMemberId, member.name, member.role, member.avatar, date, readTime, image, excerpt, tags, keywords, relatedPosts, content, metaTitle, metaDescription, status === 'published']
    )
  }

  revalidatePath('/admin/blogs')
  revalidatePath('/blogs')
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
            b.published_at, b.read_time, b.image,
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
      togglePublishAction={toggleBlogPublish}
    />
  )
}
