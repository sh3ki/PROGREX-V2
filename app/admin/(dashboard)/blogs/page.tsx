import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/server/admin-permission'
import { sql } from '@/lib/server/db'
import AdminBlogsTemplateView from '@/components/admin/blogs/AdminBlogsTemplateView'

async function ensureBlogsStatusColumn() {
  await sql('alter table blogs add column if not exists is_published boolean not null default true')
}

async function saveBlog(formData: FormData) {
  'use server'
  await requirePermission('blogs', 'write')
  await ensureBlogsStatusColumn()

  const id = String(formData.get('id') ?? '')
  const slug = String(formData.get('slug') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim()
  const category = String(formData.get('category') ?? '').trim()
  const authorName = String(formData.get('authorName') ?? '').trim()
  const authorRole = String(formData.get('authorRole') ?? '').trim()
  const authorAvatar = String(formData.get('authorAvatar') ?? '').trim()
  const date = String(formData.get('date') ?? '').trim()
  const readTime = String(formData.get('readTime') ?? '').trim()
  const image = String(formData.get('image') ?? '').trim()
  const excerpt = String(formData.get('excerpt') ?? '').trim()
  const tags = String(formData.get('tags') ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  const keywords = String(formData.get('keywords') ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  const relatedPosts = String(formData.get('relatedPosts') ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  const content = String(formData.get('content') ?? '').trim()
  const metaTitle = String(formData.get('metaTitle') ?? '').trim()
  const metaDescription = String(formData.get('metaDescription') ?? '').trim()
  const status = String(formData.get('status') ?? 'active')
  const isPublished = status !== 'inactive'

  if (!slug || !title) return

  if (id) {
    await sql(
      `update blogs
       set slug = $2, title = $3, category = $4, author_name = $5, author_role = $6, author_avatar = $7,
           published_at = $8, read_time = $9, image = $10, excerpt = $11, tags = $12::text[],
           keywords = $13::text[], related_posts = $14::text[], content = $15,
           meta_title = $16, meta_description = $17, is_published = $18, updated_at = now()
       where id = $1`,
      [id, slug, title, category, authorName, authorRole, authorAvatar, date, readTime, image, excerpt, tags, keywords, relatedPosts, content, metaTitle, metaDescription, isPublished]
    )
  } else {
    await sql(
      `insert into blogs(slug, title, category, author_name, author_role, author_avatar, published_at, read_time, image, excerpt, tags, keywords, related_posts, content, meta_title, meta_description, is_published)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::text[], $12::text[], $13::text[], $14, $15, $16, $17)`,
      [slug, title, category, authorName, authorRole, authorAvatar, date, readTime, image, excerpt, tags, keywords, relatedPosts, content, metaTitle, metaDescription, isPublished]
    )
  }

  revalidatePath('/admin/blogs')
  revalidatePath('/blogs')
}

async function toggleBlogActive(formData: FormData) {
  'use server'
  await requirePermission('blogs', 'write')
  await ensureBlogsStatusColumn()

  const id = String(formData.get('id') ?? '').trim()
  if (!id) return

  await sql('update blogs set is_published = not is_published, updated_at = now() where id = $1', [id])
  revalidatePath('/admin/blogs')
  revalidatePath('/blogs')
}

async function bulkDeleteBlogs(formData: FormData) {
  'use server'
  await requirePermission('blogs', 'delete')
  await ensureBlogsStatusColumn()

  const raw = String(formData.get('ids') ?? '')
  const ids = raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (ids.length === 0) return

  await sql('delete from blogs where id = any($1::uuid[])', [ids])
  revalidatePath('/admin/blogs')
  revalidatePath('/blogs')
}

async function bulkSetInactiveBlogs(formData: FormData) {
  'use server'
  await requirePermission('blogs', 'write')
  await ensureBlogsStatusColumn()

  const raw = String(formData.get('ids') ?? '')
  const ids = raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (ids.length === 0) return

  await sql('update blogs set is_published = false, updated_at = now() where id = any($1::uuid[])', [ids])
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
  await ensureBlogsStatusColumn()

  const blogs = await sql<{
    id: string
    slug: string
    title: string
    category: string
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
    updated_at: string | null
  }>(
    `select id, slug, title, category, author_name, author_role, author_avatar, published_at, read_time, image,
            excerpt, tags, keywords, related_posts, content, meta_title, meta_description, is_published, updated_at::text
     from blogs order by created_at desc`
  )

  return (
    <AdminBlogsTemplateView
      blogs={blogs.map((blog) => ({
        id: blog.id,
        slug: blog.slug,
        title: blog.title,
        category: blog.category ?? '',
        authorName: blog.author_name ?? '',
        authorRole: blog.author_role ?? '',
        authorAvatar: blog.author_avatar ?? '',
        publishedAt: blog.published_at ?? '',
        readTime: blog.read_time ?? '',
        image: blog.image ?? '',
        excerpt: blog.excerpt ?? '',
        tags: blog.tags ?? [],
        keywords: blog.keywords ?? [],
        relatedPosts: blog.related_posts ?? [],
        content: blog.content ?? '',
        metaTitle: blog.meta_title ?? '',
        metaDescription: blog.meta_description ?? '',
        isPublished: blog.is_published,
        updatedAt: blog.updated_at,
      }))}
      createBlogAction={saveBlog}
      updateBlogAction={saveBlog}
      deleteBlogAction={deleteBlog}
      bulkDeleteBlogsAction={bulkDeleteBlogs}
      bulkSetInactiveBlogsAction={bulkSetInactiveBlogs}
      toggleBlogActiveAction={toggleBlogActive}
    />
  )
}
