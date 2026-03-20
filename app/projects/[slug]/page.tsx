import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CaseStudyClient from './CaseStudyClient'
import { projects } from '@/lib/mockData'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = projects.find((p) => p.slug === slug)
  if (!project) return { title: 'Project Not Found' }
  return {
    title: project.title,
    description: project.shortDesc,
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const projectIndex = projects.findIndex((p) => p.slug === slug)
  const project = projectIndex >= 0 ? projects[projectIndex] : undefined
  if (!project) notFound()

  const previousProject = projects[(projectIndex - 1 + projects.length) % projects.length]
  const nextProject = projects[(projectIndex + 1) % projects.length]

  return (
    <CaseStudyClient
      project={project}
      previousProject={previousProject}
      nextProject={nextProject}
    />
  )
}
