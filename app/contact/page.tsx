import { Suspense } from 'react'
import type { Metadata } from 'next'
import ContactClient from './ContactClient'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with PROGREX. Start your project, request a quote, or book a free consultation with our technology experts.',
}

function ContactPageFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-linear-to-br from-slate-900 to-slate-950">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-nebula-500 border-t-transparent" />
        <p className="mt-4 text-slate-400">Loading contact page...</p>
      </div>
    </div>
  )
}

export default function ContactPage() {
  return (
    <Suspense fallback={<ContactPageFallback />}>
      <ContactClient />
    </Suspense>
  )
}
