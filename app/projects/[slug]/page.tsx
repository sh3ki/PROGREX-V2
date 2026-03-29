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

  function asStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return []
    return value
      .map((item) => String(item ?? '').trim())
      .filter(Boolean)
  }

  function normalizeCaseStudyProject(
    value: (typeof projects)[number]
  ): CaseStudyProps['project'] {
    const details = ((value.details ?? {}) as Record<string, unknown>)
    const tags = asStringArray(value.tags)
    const features = asStringArray(details.features)
    const technologies = asStringArray(details.technologies)

    const rawResults = Array.isArray(details.results) ? details.results : []
    const results = rawResults
      .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
      .map((item) => ({
        metric: String(item.metric ?? '').trim(),
        value: String(item.value ?? '').trim(),
      }))
      .filter((item) => item.metric || item.value)

    const testimonialRaw = (details.testimonial ?? {}) as Record<string, unknown>

    return {
      ...value,
      ...details,
      tags,
      features,
      technologies,
      results,
      testimonial: {
        quote: String(testimonialRaw.quote ?? '').trim(),
        author: String(testimonialRaw.author ?? '').trim(),
        role: String(testimonialRaw.role ?? '').trim(),
      },
      images: asStringArray(details.images),
      category: Array.isArray(value.category) ? value.category : [value.category].filter(Boolean),
    } as CaseStudyProps['project']
  }

  const normalizedProject = normalizeCaseStudyProject(project)
  const normalizedPrev = normalizeCaseStudyProject(previousProject) as CaseStudyProps['previousProject']
  const normalizedNext = normalizeCaseStudyProject(nextProject) as CaseStudyProps['nextProject']

  return (
    <CaseStudyClient
      project={normalizedProject}
      previousProject={normalizedPrev}
      nextProject={normalizedNext}
    />
  )
}
