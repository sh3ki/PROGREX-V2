import type { Metadata } from 'next'
import ReadyMadeSystemsClient from './ReadyMadeSystemsClient'
import { getPublicSystems } from '@/lib/server/public-data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Ready-Made Systems',
  description: 'Explore PROGREX\'s ready-made business systems — ProSchool, ProInventory, ProHRIS. Production-ready software systems you can deploy in days.',
}

export default async function ReadyMadeSystemsPage() {
  const systemsData = await getPublicSystems()
  return <ReadyMadeSystemsClient systemsData={systemsData} />
}
