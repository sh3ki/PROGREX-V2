import type { Metadata } from 'next'
import BlogsClient from './BlogsClient'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Tech insights, business strategies, and development best practices from the PROGREX engineering team.',
}

export default function BlogsPage() {
  return <BlogsClient />
}
