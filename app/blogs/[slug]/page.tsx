import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import BlogPostClient from './BlogPostClient'
import { blogs } from '@/lib/mockData'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return blogs.map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const blog = blogs.find((b) => b.slug === slug)
  if (!blog) return { title: 'Post Not Found' }
  return {
    title: blog.title,
    description: blog.excerpt,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const blog = blogs.find((b) => b.slug === slug)
  if (!blog) notFound()
  const related = blogs.filter((b) => blog.relatedPosts.includes(b.slug))
  return <BlogPostClient blog={blog} relatedPosts={related} />
}
