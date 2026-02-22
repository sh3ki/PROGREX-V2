import type { Metadata } from 'next'
import ContactClient from './ContactClient'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with PROGREX. Start your project, request a quote, or book a free consultation with our technology experts.',
}

export default function ContactPage() {
  return <ContactClient />
}
