import type { Metadata } from 'next'
import ProjectsClient from './ProjectsClient'
import { getPublicProjects } from '@/lib/server/public-data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Explore PROGREX\'s portfolio of successful projects — custom software, web apps, mobile, enterprise systems, and SaaS platforms.',
}

export default async function ProjectsPage() {
  const projectsData = await getPublicProjects()
  return <ProjectsClient projectsData={projectsData} />
}
