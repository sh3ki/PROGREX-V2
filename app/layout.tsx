import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CustomCursor from '@/components/CustomCursor'
import Chatbot from '@/components/Chatbot'

export const metadata: Metadata = {
  title: {
    default: 'PROGREX — Technology Solutions That Drives Success',
    template: '%s | PROGREX',
  },
  description:
    'PROGREX delivers cutting-edge custom software development, web & mobile apps, system integration, and IT consulting. Build faster. Scale smarter. Win with PROGREX.',
  keywords: [
    'custom software development',
    'web development',
    'mobile app development',
    'IT consulting',
    'system integration',
    'PROGREX',
  ],
  authors: [{ name: 'PROGREX' }],
  creator: 'PROGREX',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://progrex.com',
    siteName: 'PROGREX',
    title: 'PROGREX — Technology Solutions That Drives Success',
    description:
      'Build faster. Scale smarter. Win with PROGREX — your technology partner for custom software, web, mobile, and enterprise solutions.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PROGREX — Technology Solutions That Drives Success',
    description: 'Build faster. Scale smarter. Win with PROGREX.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#050510] text-slate-100 antialiased cursor-none-desktop">
        <CustomCursor />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <Chatbot />
      </body>
    </html>
  )
}

