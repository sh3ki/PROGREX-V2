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

const socials = [
  { icon: <Github size={15} />, href: '#', label: 'GitHub' },
  { icon: <Twitter size={15} />, href: '#', label: 'Twitter' },
  { icon: <Linkedin size={15} />, href: '#', label: 'LinkedIn' },
  { icon: <Facebook size={15} />, href: '#', label: 'Facebook' },
]

// Small constellation SVG decoration
function FooterConstellation() {
  return (
    <svg width="120" height="60" viewBox="0 0 120 60" className="opacity-30" aria-hidden="true">
      <circle cx="10"  cy="30" r="1.5" fill="#67E8F9"/>
      <circle cx="40"  cy="15" r="1"   fill="#67E8F9"/>
      <circle cx="60"  cy="40" r="1.5" fill="#A78BFA"/>
      <circle cx="90"  cy="20" r="1"   fill="#67E8F9"/>
      <circle cx="110" cy="45" r="1.5" fill="#67E8F9"/>
      <line x1="10" y1="30" x2="40" y2="15"  stroke="rgba(103,232,249,0.25)" strokeWidth="0.6"/>
      <line x1="40" y1="15" x2="60" y2="40"  stroke="rgba(103,232,249,0.25)" strokeWidth="0.6"/>
      <line x1="60" y1="40" x2="90" y2="20"  stroke="rgba(103,232,249,0.25)" strokeWidth="0.6"/>
      <line x1="90" y1="20" x2="110" y2="45" stroke="rgba(103,232,249,0.25)" strokeWidth="0.6"/>
    </svg>
  )
}

export default function Footer() {
  return (
    <footer
      className="relative overflow-hidden border-t"
      style={{
        background: 'rgba(2,2,10,0.95)',
        borderTopColor: 'rgba(103,232,249,0.1)',
      }}
    >
      {/* Background dot grid */}
      <div className="absolute inset-0 bg-dot-grid opacity-20 pointer-events-none" />
      {/* Bottom nebula glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(103,232,249,0.05), transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Top Section */}
        <div className="py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group" aria-label="PROGREX">
              {/* Hex logo */}
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke="rgba(103,232,249,0.7)" strokeWidth="1.2"/>
                <circle cx="14" cy="14" r="2.5" fill="#67E8F9"/>
              </svg>
              <span className="font-display font-bold text-lg tracking-[0.12em] text-white group-hover:text-nebula-300 transition-colors">
                PROGREX
              </span>
            </Link>

            <p className="text-white/45 text-sm leading-relaxed mb-6 max-w-xs">
              Technology solutions that drive success. We build custom software, web apps, mobile platforms, and enterprise systems that scale.
            </p>

            <FooterConstellation />

            <div className="mt-5 space-y-2.5 text-sm text-white/45">
              <a href="mailto:hello@progrex.com" className="flex items-center gap-2.5 hover:text-nebula-300 transition-colors group">
                <Mail size={13} className="text-nebula-400 shrink-0" />
                hello@progrex.com
              </a>
              <a href="tel:+639123456789" className="flex items-center gap-2.5 hover:text-nebula-300 transition-colors">
                <Phone size={13} className="text-nebula-400 shrink-0" />
                +63 912 345 6789
              </a>
              <div className="flex items-center gap-2.5">
                <MapPin size={13} className="text-nebula-400 shrink-0" />
                <span>Manila, Philippines</span>
              </div>
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-mono text-[10px] text-nebula-400/70 uppercase tracking-[0.18em] mb-5">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/45 text-sm hover:text-white transition-colors duration-200 flex items-center gap-1.5 group"
                    >
                      <span className="w-0 group-hover:w-2 h-px bg-nebula-400 transition-all duration-200 overflow-hidden" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Section divider */}
        <div className="section-divider" />

        {/* Bottom Bar */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <p className="font-mono text-[11px] text-white/25 tracking-wider">
              © {new Date().getFullYear()} PROGREX — ALL RIGHTS RESERVED
            </p>
          </div>

          <div className="flex items-center gap-2">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/35 hover:text-nebula-300 transition-all duration-200"
                style={{ border: '1px solid rgba(103,232,249,0.12)' }}
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
