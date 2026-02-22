import type { Metadata } from 'next'
import ReadyMadeSystemsClient from './ReadyMadeSystemsClient'

export const metadata: Metadata = {
  title: 'Ready-Made Systems',
  description: 'Explore PROGREX\'s ready-made business systems — ProSchool, ProInventory, ProHRIS. Production-ready software systems you can deploy in days.',
}

export default function ReadyMadeSystemsPage() {
  return <ReadyMadeSystemsClient />
}
