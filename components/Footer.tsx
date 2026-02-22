import Link from 'next/link'
import { Zap, Mail, Phone, MapPin, Github, Twitter, Linkedin, Facebook } from 'lucide-react'

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
    <footer className="bg-[#030308] border-t border-[#560BAD]/15 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#3A0CA3]/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[#560BAD]/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Top Section */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#560BAD] to-[#4361EE] flex items-center justify-center shadow-[0_0_15px_rgba(86,11,173,0.5)]">
                <Zap size={16} className="text-white" />
              </div>
              <span className="text-xl font-extrabold text-gradient">PROGREX</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              Technology solutions that drive success. We build custom software, web apps, mobile platforms, and enterprise systems that scale.
            </p>
            <div className="space-y-2 text-sm text-slate-400">
              <a href="mailto:hello@progrex.com" className="flex items-center gap-2 hover:text-[#CFA3EA] transition-colors">
                <Mail size={14} className="text-[#831DC6]" />
                hello@progrex.com
              </a>
              <a href="tel:+639123456789" className="flex items-center gap-2 hover:text-[#CFA3EA] transition-colors">
                <Phone size={14} className="text-[#831DC6]" />
                +63 912 345 6789
              </a>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#831DC6] shrink-0" />
                <span>Manila, Philippines</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-400 text-sm hover:text-[#CFA3EA] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} PROGREX. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {[
              { icon: <Github size={16} />, href: '#', label: 'GitHub' },
              { icon: <Twitter size={16} />, href: '#', label: 'Twitter' },
              { icon: <Linkedin size={16} />, href: '#', label: 'LinkedIn' },
              { icon: <Facebook size={16} />, href: '#', label: 'Facebook' },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="w-8 h-8 rounded-lg glass border border-[#560BAD]/20 flex items-center justify-center text-slate-400 hover:text-[#CFA3EA] hover:border-[#831DC6]/50 hover:shadow-[0_0_10px_rgba(131,29,198,0.3)] transition-all duration-200"
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
