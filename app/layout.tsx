import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CustomCursor from '@/components/CustomCursor'
import Chatbot from '@/components/Chatbot'

export const metadata: Metadata = {
  title: {
    default: 'PROGREX â€” Technology Solutions That Drives Success',
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
    title: 'PROGREX â€” Technology Solutions That Drives Success',
    description:
      'Build faster. Scale smarter. Win with PROGREX â€” your technology partner for custom software, web, mobile, and enterprise solutions.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PROGREX â€” Technology Solutions That Drives Success',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0D0F12] text-[#EEF0F3] antialiased cursor-none-desktop">
        <CustomCursor />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <Chatbot />
      </body>
    </html>
  )
}

