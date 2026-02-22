import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ServiceDetailClient from './ServiceDetailClient'
import { services } from '@/lib/mockData'

interface Props {
  params: Promise<{ service: string }>
}

export async function generateStaticParams() {
  return services.map((s) => ({ service: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { service: slug } = await params
  const service = services.find((s) => s.slug === slug)
  if (!service) return { title: 'Service Not Found' }
  return {
    title: service.title,
    description: service.description,
  }
}

export default async function ServicePage({ params }: Props) {
  const { service: slug } = await params
  const service = services.find((s) => s.slug === slug)
  if (!service) notFound()
  return <ServiceDetailClient service={service} />
}
