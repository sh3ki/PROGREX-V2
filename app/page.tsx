import type { Metadata } from 'next'
import HomeClient from './HomeClient'
import {
  getFeaturedProjects,
  getHomeFaqs,
  getHomeTestimonials,
  getPublicServices,
  getPublicSystems,
} from '@/lib/server/public-data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'PROGREX — Technology Solutions That Drives Success',
  description:
    'PROGREX delivers cutting-edge technology solutions. Custom software development, web apps, mobile platforms, and enterprise systems. Build faster. Scale smarter. Win with PROGREX.',
}

export default async function HomePage() {
  const [servicesData, systemsData, testimonialsData, faqsData, featuredProjectsData] = await Promise.all([
    getPublicServices(),
    getPublicSystems(),
    getHomeTestimonials(),
    getHomeFaqs(),
    getFeaturedProjects(),
  ])

  return (
    <HomeClient
      servicesData={servicesData}
      systemsData={systemsData}
      testimonialsData={testimonialsData}
      faqsData={faqsData}
      featuredProjectsData={featuredProjectsData}
    />
  )
}

