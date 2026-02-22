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
    <footer className="bg-[#0A0C0F] border-t border-[#1F2530]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        {/* Top grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-b border-[#1F2530]">
          {/* Brand column */}
          <div className="lg:col-span-4 py-12 pr-0 lg:pr-16 border-b lg:border-b-0 lg:border-r border-[#1F2530]">
            <Link href="/" className="flex items-center gap-3 mb-6 group w-fit">
              <div className="flex items-center gap-0.5">
                <div className="w-4 h-4 bg-[#1B6FFF]" />
                <div className="w-2 h-4 bg-[#1B6FFF]/40" />
              </div>
              <span className="text-[15px] font-bold tracking-[0.08em] text-white uppercase">PROGREX</span>
            </Link>

            <p className="text-[#8892A4] text-sm leading-relaxed mb-8 max-w-xs">
              Technology solutions that drive success. We build custom software, web apps, mobile platforms, and enterprise systems that scale.
            </p>

            <div className="space-y-3">
              <a href="mailto:hello@progrex.com" className="flex items-center gap-3 text-sm text-[#8892A4] hover:text-white transition-colors group">
                <div className="w-6 h-6 border border-[#1F2530] flex items-center justify-center shrink-0 group-hover:border-[#1B6FFF] transition-colors">
                  <Mail size={12} className="text-[#1B6FFF]" />
                </div>
                hello@progrex.com
              </a>
              <a href="tel:+639123456789" className="flex items-center gap-3 text-sm text-[#8892A4] hover:text-white transition-colors group">
                <div className="w-6 h-6 border border-[#1F2530] flex items-center justify-center shrink-0 group-hover:border-[#1B6FFF] transition-colors">
                  <Phone size={12} className="text-[#1B6FFF]" />
                </div>
                +63 912 345 6789
              </a>
              <div className="flex items-center gap-3 text-sm text-[#8892A4]">
                <div className="w-6 h-6 border border-[#1F2530] flex items-center justify-center shrink-0">
                  <MapPin size={12} className="text-[#1B6FFF]" />
                </div>
                Manila, Philippines
              </div>
            </div>
          </div>

          {/* Links columns */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4">
            {Object.entries(footerLinks).map(([category, links], ci) => (
              <div
                key={category}
                className={`py-12 px-6 lg:px-8 ${ci < 3 ? 'border-r border-[#1F2530]' : ''}`}
              >
                <h4 className="font-mono text-[10px] font-medium tracking-[0.14em] text-[#4E5A6E] uppercase mb-5">
                  {category}
                </h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-[#8892A4] hover:text-white transition-colors duration-150"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[11px] text-[#4E5A6E] tracking-wider">
            Â© {new Date().getFullYear()} PROGREX. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-2">
            {[
              { icon: <Github size={14} />, href: '#', label: 'GitHub' },
              { icon: <Twitter size={14} />, href: '#', label: 'Twitter' },
              { icon: <Linkedin size={14} />, href: '#', label: 'LinkedIn' },
              { icon: <Facebook size={14} />, href: '#', label: 'Facebook' },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="w-8 h-8 border border-[#1F2530] flex items-center justify-center text-[#4E5A6E] hover:text-white hover:border-[#293040] transition-all duration-150"
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
