import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, Github, Twitter, Linkedin, Facebook, Instagram, Youtube } from 'lucide-react'

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

const TikTokIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.51a8.18 8.18 0 004.78 1.53V7.59a4.85 4.85 0 01-1.01-.9z" />
  </svg>
)

const WhatsAppIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const socials = [
  { icon: <Facebook size={15} />, href: '#', label: 'Facebook' },
  { icon: <Instagram size={15} />, href: '#', label: 'Instagram' },
  { icon: <Twitter size={15} />, href: '#', label: 'X' },
  { icon: <TikTokIcon size={15} />, href: '#', label: 'TikTok' },
  { icon: <Linkedin size={15} />, href: '#', label: 'LinkedIn' },
  { icon: <Youtube size={15} />, href: '#', label: 'YouTube' },
  { icon: <WhatsAppIcon size={15} />, href: '#', label: 'WhatsApp' },
  { icon: <Github size={15} />, href: '#', label: 'GitHub' },
  { icon: <MapPin size={15} />, href: '#', label: 'Maps' },
]

export default function Footer() {
  return (
    <footer
      className="relative overflow-hidden border-t"
      style={{
        background: 'rgba(2,2,10,0.82)',
        borderTopColor: 'rgba(103,232,249,0.1)',
      }}
    >
      {/* Background dot grid */}
      <div className="absolute inset-0 bg-dot-grid opacity-20 pointer-events-none" />
      {/* Bottom nebula glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-125 h-50 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(103,232,249,0.05), transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Top Section */}
        <div className="pt-8 pb-5 flex flex-col lg:flex-row gap-16">
          {/* Brand column */}
          <div className="shrink-0 lg:w-56">
            <Link href="/" className="inline-flex mb-2 group" aria-label="PROGREX">
              <Image
                src="/Progrex Logo White Transparent.png"
                alt="PROGREX"
                width={240}
                height={96}
                className="h-26 w-auto object-contain group-hover:opacity-80 transition-opacity duration-200"
              />
            </Link>
            <p className="text-white/40 text-sm leading-relaxed max-w-55">
              Technology solutions that drive success. Custom software, web apps, and enterprise systems that scale.
            </p>
          </div>

          {/* Right side: link columns + contact info stacked */}
          <div className="flex-1 flex flex-col gap-8">
            {/* Link columns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {Object.entries(footerLinks).map(([category, links]) => (
                <div key={category}>
                  <h4 className="font-mono text-xs text-nebula-400/80 uppercase tracking-[0.18em] mb-4 font-semibold">
                    {category}
                  </h4>
                  <ul className="space-y-2">
                    {links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-white/45 text-sm hover:text-nebula-300 transition-colors duration-200 flex items-center gap-1.5 group"
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

            {/* Contact info — below the columns */}
            <div
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-8 pt-5"
              style={{ borderTop: '1px solid rgba(103,232,249,0.08)' }}
            >
              <a
                href="mailto:hello@progrex.com"
                className="flex items-center gap-2 text-sm text-white/40 hover:text-nebula-300 transition-colors group"
              >
                <Mail size={13} className="text-nebula-400 shrink-0 group-hover:text-nebula-300 transition-colors" />
                hello@progrex.com
              </a>
              <a
                href="tel:+639123456789"
                className="flex items-center gap-2 text-sm text-white/40 hover:text-nebula-300 transition-colors group"
              >
                <Phone size={13} className="text-nebula-400 shrink-0 group-hover:text-nebula-300 transition-colors" />
                +63 912 345 6789
              </a>
              <div className="flex items-center gap-2 text-sm text-white/40">
                <MapPin size={13} className="text-nebula-400 shrink-0" />
                Manila, Philippines
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="py-4 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: '1px solid rgba(103,232,249,0.08)' }}
        >
          <p className="font-mono text-sm text-white/25 tracking-wider">
            © {new Date().getFullYear()} PROGREX — ALL RIGHTS RESERVED
          </p>

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
