import type { Metadata } from 'next'
import ProjectsClient from './ProjectsClient'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Explore PROGREX\'s portfolio of successful projects â€” custom software, web apps, mobile, enterprise systems, and SaaS platforms.',
}

export default function ProjectsPage() {
  return <ProjectsClient />
}
