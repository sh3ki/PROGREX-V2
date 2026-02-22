import type { Metadata } from 'next'
import AboutClient from './AboutClient'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about PROGREX â€” our story, mission, values, team, and why hundreds of businesses trust us with their technology solutions.',
}

export default function AboutPage() {
  return <AboutClient />
}
