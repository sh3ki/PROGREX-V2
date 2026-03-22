import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/server/admin-permission'
import { sql } from '@/lib/server/db'
import {
  ApexButton,
  ApexCard,
  ApexCardBody,
  ApexCardHeader,
  ApexInput,
  ApexPageHeader,
  ApexTextarea,
} from '@/components/admin/apex/AdminPrimitives'

async function saveBlog(formData: FormData) {
  'use server'
  await requirePermission('blogs', 'write')

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

  if (!slug || !title) return

  if (id) {
    await sql(
      `update blogs
       set slug = $2, title = $3, category = $4, author_name = $5, author_role = $6, author_avatar = $7,
           published_at = $8, read_time = $9, image = $10, excerpt = $11, tags = $12::text[],
           keywords = $13::text[], related_posts = $14::text[], content = $15,
           meta_title = $16, meta_description = $17, updated_at = now()
       where id = $1`,
      [id, slug, title, category, authorName, authorRole, authorAvatar, date, readTime, image, excerpt, tags, keywords, relatedPosts, content, metaTitle, metaDescription]
    )
  } else {
    await sql(
      `insert into blogs(slug, title, category, author_name, author_role, author_avatar, published_at, read_time, image, excerpt, tags, keywords, related_posts, content, meta_title, meta_description, is_published)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::text[], $12::text[], $13::text[], $14, $15, $16, true)`,
      [slug, title, category, authorName, authorRole, authorAvatar, date, readTime, image, excerpt, tags, keywords, relatedPosts, content, metaTitle, metaDescription]
    )
  }

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
  }>(
    `select id, slug, title, category, author_name, author_role, author_avatar, published_at, read_time, image,
            excerpt, tags, keywords, related_posts, content, meta_title, meta_description
     from blogs order by created_at desc`
  )

  return (
    <div className="space-y-5">
      <ApexPageHeader title="Blogs" subtitle="Edit content, metadata, and author information." />

      <div className="space-y-3">
        {blogs.map((blog) => (
          <ApexCard key={blog.id}>
            <ApexCardHeader title={blog.title} subtitle={blog.slug} />
            <ApexCardBody>
            <form action={saveBlog} className="grid gap-3 md:grid-cols-2">
              <input type="hidden" name="id" value={blog.id} />
              <ApexInput name="slug" defaultValue={blog.slug} required />
              <ApexInput name="title" defaultValue={blog.title} required />
              <ApexInput name="category" defaultValue={blog.category ?? ''} />
              <ApexInput name="date" defaultValue={blog.published_at ?? ''} />
              <ApexInput name="readTime" defaultValue={blog.read_time ?? ''} />
              <ApexInput name="image" defaultValue={blog.image ?? ''} className="md:col-span-2" />
              <ApexInput name="authorName" defaultValue={blog.author_name ?? ''} />
              <ApexInput name="authorRole" defaultValue={blog.author_role ?? ''} />
              <ApexInput name="authorAvatar" defaultValue={blog.author_avatar ?? ''} className="md:col-span-2" />
              <ApexTextarea name="excerpt" rows={2} defaultValue={blog.excerpt ?? ''} className="md:col-span-2" />
              <ApexInput name="tags" defaultValue={(blog.tags ?? []).join(', ')} />
              <ApexInput name="keywords" defaultValue={(blog.keywords ?? []).join(', ')} />
              <ApexInput name="relatedPosts" defaultValue={(blog.related_posts ?? []).join(', ')} className="md:col-span-2" />
              <ApexTextarea name="content" rows={8} defaultValue={blog.content ?? ''} className="md:col-span-2" />
              <ApexInput name="metaTitle" defaultValue={blog.meta_title ?? ''} />
              <ApexInput name="metaDescription" defaultValue={blog.meta_description ?? ''} />
              <div className="md:col-span-2 flex gap-2">
                <ApexButton variant="outline" type="submit">Update</ApexButton>
                <ApexButton formAction={deleteBlog} variant="danger" type="submit">Delete</ApexButton>
              </div>
            </form>
            </ApexCardBody>
          </ApexCard>
        ))}
      </div>
    </div>
  )
}
