import type { Metadata } from 'next'
import AboutClient from './AboutClient'
import { getPublicTeam } from '@/lib/server/public-data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about PROGREX — our story, mission, values, team, and why hundreds of businesses trust us with their technology solutions.',
}

export default async function AboutPage() {
  const teamData = await getPublicTeam()
  return <AboutClient teamData={teamData} />
}
