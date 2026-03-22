import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CaseStudyClient from './CaseStudyClient'
import { getPublicProjects } from '@/lib/server/public-data'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const projects = await getPublicProjects()
  const project = projects.find((p) => p.slug === slug)
  if (!project) return { title: 'Project Not Found' }
  return {
    title: project.title,
    description: project.shortDesc,
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const projects = await getPublicProjects()
  const projectIndex = projects.findIndex((p) => p.slug === slug)
  const project = projectIndex >= 0 ? projects[projectIndex] : undefined
  if (!project) notFound()

  const previousProject = projects[(projectIndex - 1 + projects.length) % projects.length]
  const nextProject = projects[(projectIndex + 1) % projects.length]

  type CaseStudyProps = React.ComponentProps<typeof CaseStudyClient>

  const normalizedProject = {
    ...project,
    ...((project.details ?? {}) as Record<string, unknown>),
  } as unknown as CaseStudyProps['project']

  const normalizedPrev = {
    ...previousProject,
    ...((previousProject.details ?? {}) as Record<string, unknown>),
  } as unknown as CaseStudyProps['previousProject']

  const normalizedNext = {
    ...nextProject,
    ...((nextProject.details ?? {}) as Record<string, unknown>),
  } as unknown as CaseStudyProps['nextProject']

  return (
    <CaseStudyClient
      project={normalizedProject}
      previousProject={normalizedPrev}
      nextProject={normalizedNext}
    />
  )
}
