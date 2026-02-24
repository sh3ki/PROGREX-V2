import Link from 'next/link'
import { Mail, Phone, MapPin, Github, Twitter, Linkedin, Facebook } from 'lucide-react'

const footerLinks = {
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Our Team', href: '/about#team' },
    { label: 'Careers', href: '/contact' },
    { label: 'Contact', href: '/contact' },
  ],
  Services: [
    { label: 'Custom Software', href: '/services/custom-software-development' },
    { label: 'Web Development', href: '/services/web-development' },
    { label: 'Mobile Apps', href: '/services/mobile-app-development' },
    { label: 'IT Consulting', href: '/services/it-consulting-infrastructure' },
  ],
  Products: [
    { label: 'ProSchool', href: '/ready-made-systems' },
    { label: 'ProInventory', href: '/ready-made-systems' },
    { label: 'ProHRIS', href: '/ready-made-systems' },
    { label: 'View All Systems', href: '/ready-made-systems' },
  ],
  Resources: [
    { label: 'Blog', href: '/blogs' },
    { label: 'Case Studies', href: '/projects' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0F] border-t border-[#1A1A24] relative">
      {/* Top accent line */}
      <div className="h-[1px] bg-[#7C2AE8] opacity-60" />

      <div className="max-w-screen-xl mx-auto px-6 lg:px-8">
        {/* Main grid */}
        <div className="py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 border-b border-[#1A1A24]">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="relative w-6 h-6 border border-[#4C1D95] flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-[#7C2AE8]" />
                <div className="absolute -top-px -right-px w-1 h-1 bg-[#7C2AE8]" />
              </div>
              <span className="text-[12px] font-bold tracking-[0.25em] text-[#F0EEF8] uppercase font-mono">
                PROGREX
              </span>
            </Link>
            <p className="text-[#3A3854] text-xs leading-relaxed mb-6 max-w-xs font-light">
              Technology solutions that drive success. We build custom software, web apps, mobile platforms, and enterprise systems that scale.
            </p>
            <div className="space-y-2.5 text-xs text-[#3A3854]">
              <a href="mailto:hello@progrex.com" className="flex items-center gap-2.5 hover:text-[#C4B5FD] transition-colors duration-150">
                <Mail size={11} className="text-[#4C1D95] shrink-0" />
                hello@progrex.com
              </a>
              <a href="tel:+639123456789" className="flex items-center gap-2.5 hover:text-[#C4B5FD] transition-colors duration-150">
                <Phone size={11} className="text-[#4C1D95] shrink-0" />
                +63 912 345 6789
              </a>
              <div className="flex items-center gap-2.5">
                <MapPin size={11} className="text-[#4C1D95] shrink-0" />
                <span>Manila, Philippines</span>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <div className="sys-label mb-5 text-[#4C1D95]">{category}</div>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[#3A3854] text-xs hover:text-[#C4B5FD] transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="sys-label">© {new Date().getFullYear()} PROGREX SYSTEMS.</span>
            <span className="sys-label">ALL RIGHTS RESERVED.</span>
          </div>
          <div className="flex items-center gap-1">
            {[
              { icon: <Github size={13} />, href: '#', label: 'GitHub' },
              { icon: <Twitter size={13} />, href: '#', label: 'Twitter' },
              { icon: <Linkedin size={13} />, href: '#', label: 'LinkedIn' },
              { icon: <Facebook size={13} />, href: '#', label: 'Facebook' },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="w-8 h-8 border border-[#1A1A24] flex items-center justify-center text-[#3A3854] hover:text-[#C4B5FD] hover:border-[#4C1D95] hover:bg-[#14141B] transition-all duration-150"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
