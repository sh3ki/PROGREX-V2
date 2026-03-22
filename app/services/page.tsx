import type { Metadata } from 'next'
import ServicesClient from './ServicesClient'
import { getPublicServices } from '@/lib/server/public-data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Explore PROGREX\'s comprehensive technology services — custom software development, web & mobile apps, system integration, academic systems, and IT consulting.',
}

export default async function ServicesPage() {
  const servicesData = await getPublicServices()
  return <ServicesClient servicesData={servicesData} />
}
