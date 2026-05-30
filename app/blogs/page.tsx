import type { Metadata } from 'next'
import BlogsClient from './BlogsClient'
import { getPublicBlogs } from '@/lib/server/public-data'
import type { BlogPost } from '@/lib/blogData'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'PROGREX Blog — Software Development, Web Apps, Mobile Apps & Tech Insights',
  description: 'Expert articles on software development, web development, mobile app development, business automation, freelance development, and tech strategy from the PROGREX engineering team in the Philippines.',
  keywords: [
    'PROGREX', 'PROGREX blog', 'software development blog', 'web development articles',
    'mobile app development', 'programming blog', 'tech company Philippines',
    'custom software', 'React Next.js blog', 'hire developers Philippines',
    'business automation', 'freelance software developer', 'how to build a web app',
    'how to build a mobile app', 'software development company', 'PROGREX tech',
  ],
  openGraph: {
    title: 'PROGREX Blog — Software Development & Tech Insights',
    description: 'Expert articles on custom software, web apps, mobile apps, and business technology from the PROGREX team.',
    type: 'website',
    siteName: 'PROGREX',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PROGREX Blog — Software Development & Tech Insights',
    description: 'Expert articles on custom software, web apps, mobile apps, and business technology from the PROGREX team.',
  },
  alternates: {
    canonical: 'https://progrex.tech/blogs',
  },
}

export default async function BlogsPage() {
  const blogsData = await getPublicBlogs()
  return <BlogsClient blogsData={blogsData as BlogPost[]} />
}
