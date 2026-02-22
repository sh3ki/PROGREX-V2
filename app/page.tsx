import type { Metadata } from 'next'
import HomeClient from './HomeClient'

export const metadata: Metadata = {
  title: 'PROGREX — Technology Solutions That Drives Success',
  description:
    'PROGREX delivers cutting-edge technology solutions. Custom software development, web apps, mobile platforms, and enterprise systems. Build faster. Scale smarter. Win with PROGREX.',
}

export default function HomePage() {
  return <HomeClient />
}

