import type { Metadata } from 'next'
import ServicesClient from './ServicesClient'

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Explore PROGREX\'s comprehensive technology services — custom software development, web & mobile apps, system integration, academic systems, and IT consulting.',
}

export default function ServicesPage() {
  return <ServicesClient />
}
