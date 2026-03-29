'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CustomCursor from '@/components/CustomCursor'
import Chatbot from '@/components/Chatbot'

export default function RootChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  if (isAdmin) {
    return (
      <>
        <CustomCursor />
        <main>{children}</main>
      </>
    )
  }

  return (
    <>
      <CustomCursor />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <Chatbot />
    </>
  )
}
