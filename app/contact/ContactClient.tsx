'use client'

import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Github, Twitter, Facebook, Instagram, Youtube, ExternalLink } from 'lucide-react'
import SectionWrapper from '@/components/SectionWrapper'
import ConstellationDecor from '@/components/ConstellationDecor'
import ContactFormCard from '@/components/contact/ContactFormCard'
import { useTranslation } from '@/components/TranslationProvider'

const TikTokIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.51a8.18 8.18 0 004.78 1.53V7.59a4.85 4.85 0 01-1.01-.9z" />
  </svg>
)

const WhatsAppIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

export default function ContactClient() {
  const { t, translations } = useTranslation()
  const socialLabels = translations.contact.socialLabels as unknown as string[]

  return (
    <>
      <section className="relative overflow-hidden bg-section-a pt-28 pb-4">
        <div className="absolute inset-0 bg-dot-grid opacity-15" />
        <div className="absolute top-1/2 left-1/2 h-75 w-full max-w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-nebula-700/10 blur-[100px] sm:h-100" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="eyebrow-badge mb-4 justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-nebula-500 animate-pulse" />
              {t('contact.badge')}
            </div>
            <h1 className="mb-4 text-4xl leading-tight font-extrabold text-white sm:text-5xl lg:text-6xl">
              {t('contact.title')} <span className="text-gradient-nebula">{t('contact.highlight')}</span>
            </h1>
            <p className="mx-auto max-w-xl text-lg leading-relaxed text-slate-300">{t('contact.subtitle')}</p>
          </motion.div>
        </div>
      </section>

      <SectionWrapper className="bg-section-a" decoration={<ConstellationDecor name="gemini" side="right" offsetY="15%" />}>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ContactFormCard />
          </div>

          <div className="space-y-5 lg:col-span-2">
            <div className="glass-card rounded-2xl border border-nebula-700/20 p-6">
              <h3 className="mb-5 font-bold text-white">{t('contact.infoHeading')}</h3>
              <div className="space-y-4">
                {[
                  { icon: <Mail size={16} />, label: t('contact.generalLabel'), value: 'info@progrex.cloud', href: 'mailto:info@progrex.cloud' },
                  { icon: <Mail size={16} />, label: t('contact.contactLabel'), value: 'contact@progrex.cloud', href: 'mailto:contact@progrex.cloud' },
                  { icon: <Mail size={16} />, label: t('contact.supportLabel'), value: 'support@progrex.cloud', href: 'mailto:support@progrex.cloud' },
                  { icon: <Phone size={16} />, label: t('contact.phoneLabel'), value: '+63 956 593 4460', href: 'tel:+639565934460' },
                  { icon: <MapPin size={16} />, label: t('contact.officeLabel'), value: 'Calauan, Laguna, Philippines', href: 'https://maps.app.goo.gl/obdsRKxLpNnmu2Bd8' },
                ].map((item) => (
                  <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-nebula-700 to-aurora-600 text-white transition-all group-hover:shadow-nebula-sm">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-xs font-medium tracking-wide text-slate-500 uppercase">{item.label}</div>
                      <div className="text-sm text-white/70 transition-colors group-hover:text-nebula-300">{item.value}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <a href="https://maps.app.goo.gl/obdsRKxLpNnmu2Bd8" target="_blank" rel="noopener noreferrer" className="group block overflow-hidden rounded-2xl border border-nebula-700/20 p-1 glass-card cursor-pointer">
              <div className="relative h-48 overflow-hidden rounded-xl">
                <iframe
                  title="Calauan, Laguna, Philippines"
                  src="https://maps.google.com/maps?q=Calauan,+Laguna,+Philippines&t=&z=13&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)', pointerEvents: 'none' }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/30">
                  <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/70 px-3 py-1.5 font-mono text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <ExternalLink size={11} /> {t('contact.openMaps')}
                  </span>
                </div>
              </div>
            </a>

            <div className="glass-card rounded-2xl border border-nebula-700/20 p-5 pr-4">
              <h4 className="mb-4 text-sm font-bold text-white">{t('contact.followUs')}</h4>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: <Facebook size={16} />, label: socialLabels[0], href: 'https://www.facebook.com/progrex.tech' },
                  { icon: <Instagram size={16} />, label: socialLabels[1], href: 'https://www.instagram.com/progrex.tech' },
                  { icon: <Twitter size={16} />, label: socialLabels[2], href: 'https://x.com/progrex_tech' },
                  { icon: <TikTokIcon size={16} />, label: socialLabels[3], href: 'https://www.tiktok.com/@progrex.tech' },
                  { icon: <Youtube size={16} />, label: socialLabels[4], href: 'https://www.youtube.com/@progrex.technologies' },
                  { icon: <WhatsAppIcon size={16} />, label: socialLabels[5], href: 'https://wa.me/639565934460' },
                  { icon: <Github size={16} />, label: socialLabels[6], href: 'https://github.com/progrex-tech' },
                  { icon: <MapPin size={16} />, label: socialLabels[7], href: 'https://maps.app.goo.gl/obdsRKxLpNnmu2Bd8' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-nebula-700/20 text-white/40 transition-all duration-200 hover:border-nebula-500/50 hover:text-nebula-300 hover:shadow-nebula-sm glass"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl border border-nebula-700/20 p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-sm text-emerald-400">{t('contact.responseStatus')}</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                {t('contact.responseMsg')} <strong className="text-white">{t('contact.responseTime')}</strong>{t('contact.responseUrgent')}
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </>
  )
}
