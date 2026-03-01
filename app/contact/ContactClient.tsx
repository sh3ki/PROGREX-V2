'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Phone, MapPin, Send, CheckCircle, Github, Twitter, Linkedin, Facebook, Instagram, Youtube, ChevronDown, Check, Paperclip, X as XIcon, ExternalLink } from 'lucide-react'

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
import SectionWrapper from '@/components/SectionWrapper'
import ConstellationDecor from '@/components/ConstellationDecor'

const services = [
  'Custom Software Development',
  'Web Development',
  'Mobile App Development',
  'System Integration',
  'Academic / Capstone System',
  'IT Consulting',
  'Ready-Made System',
  'Other',
]

const budgets = [
  'Below ₱10,000',
  '₱10,000 – ₱50,000',
  '₱50,000 – ₱150,000',
  '₱150,000 – ₱500,000',
  '₱500,000+',
  "Let's Discuss",
]

interface FormData {
  name: string
  email: string
  phone: string
  company: string
  service: string
  budget: string
  message: string
}

export default function ContactClient() {
  const [form, setForm] = useState<FormData>({
    name: '', email: '', phone: '', company: '', service: '', budget: '', message: '',
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const MAX_FILE_SIZE = 3 * 1024 * 1024 // 3 MB (base64 ≈ 4.1 MB, under Vercel's 4.5 MB body limit)

  const handleFileSelect = (file: File) => {
    setFileError('')
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File too large (max 3 MB). "${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB.`)
      return
    }
    setAttachedFile(file)
  }

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email'
    if (!form.message.trim()) newErrors.message = 'Message is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setServerError('')
    try {
      // Convert file to base64 if attached
      let attachment: { name: string; data: string; contentType: string } | undefined
      if (attachedFile) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve((reader.result as string).split(',')[1])
          reader.onerror = reject
          reader.readAsDataURL(attachedFile)
        })
        attachment = { name: attachedFile.name, data: base64, contentType: attachedFile.type }
      }

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, attachment }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send')
      setAttachedFile(null)
      setSubmitted(true)
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  return (
    <>
      {/* Hero */}
      <section className="relative pt-28 pb-4 overflow-hidden bg-section-a">
        <div className="absolute inset-0 bg-dot-grid opacity-15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-75 bg-nebula-700/10 rounded-full blur-[100px]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="eyebrow-badge mb-4 justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-nebula-500 animate-pulse" />
              Let&apos;s Work Together
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
              Start Your <span className="text-gradient-nebula">Project</span>
            </h1>
            <p className="text-slate-300 text-lg max-w-xl mx-auto leading-relaxed">
              Tell us about your project and we&apos;ll get back to you within 24 hours with a plan.
            </p>
          </motion.div>
        </div>
      </section>

      <SectionWrapper className="bg-section-a" decoration={<ConstellationDecor name="gemini" side="right" offsetY="15%" />}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Form */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, type: 'spring' }}
                  className="glass-card rounded-2xl p-12 text-center border border-nebula-700/30"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    className="w-16 h-16 rounded-full bg-linear-to-br from-nebula-700 to-aurora-600 flex items-center justify-center mx-auto mb-6 shadow-nebula"
                  >
                    <CheckCircle size={28} className="text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-extrabold text-white mb-3">Message Sent!</h2>
                  <p className="text-slate-400 leading-relaxed mb-6">
                    Thank you, <strong className="text-white">{form.name}</strong>! We&apos;ve received your message and will get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', company: '', service: '', budget: '', message: '' }) }}
                    className="btn-outline text-sm px-6 py-2.5 inline-flex"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  onSubmit={handleSubmit}
                  className="glass-card rounded-2xl p-6 sm:p-8 border border-nebula-700/20 space-y-5"
                >
                  <h2 className="text-xl font-bold text-white mb-2">Get a Free Quote</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Full Name *" value={form.name} onChange={(v) => handleChange('name', v)} error={errors.name} placeholder="Your name" />
                    <Field label="Email Address *" type="email" value={form.email} onChange={(v) => handleChange('email', v)} error={errors.email} placeholder="you@company.com" />
                    <Field label="Phone Number" type="tel" value={form.phone} onChange={(v) => handleChange('phone', v)} placeholder="+63 912 345 6789" />
                    <Field label="Company / Organization" value={form.company} onChange={(v) => handleChange('company', v)} placeholder="Your company name" />
                  </div>

                  {/* Service */}
                  <CustomSelect
                    label="Service Needed"
                    value={form.service}
                    onChange={(v) => handleChange('service', v)}
                    options={services}
                    placeholder="Select a service..."
                  />

                  {/* Budget */}
                  <CustomSelect
                    label="Budget Range"
                    value={form.budget}
                    onChange={(v) => handleChange('budget', v)}
                    options={budgets}
                    placeholder="Select budget range..."
                  />

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Project Details *</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      rows={4}
                      placeholder="Describe your project, goals, and any specific requirements..."
                      className={`w-full px-4 py-2.5 rounded-xl glass border bg-transparent text-slate-200 text-sm placeholder-slate-500 focus:outline-none transition-all resize-none ${
                        errors.message ? 'border-red-500/60' : 'border-nebula-700/20 focus:border-nebula-500/60 focus:shadow-nebula-sm'
                      }`}
                    />
                    {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}

                    {/* File attachment drop zone */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f) }}
                      className={`mt-3 flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed cursor-pointer transition-all duration-200 ${
                        dragOver
                          ? 'border-nebula-400/70 bg-nebula-700/10'
                          : 'border-nebula-700/30 hover:border-nebula-500/50 hover:bg-nebula-700/05'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); e.target.value = '' }}
                      />
                      {attachedFile ? (
                        <>
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Check size={14} className="text-emerald-400 shrink-0" />
                            <span className="text-white/70 text-xs truncate">{attachedFile.name}</span>
                            <span className="text-slate-500 text-xs shrink-0">({(attachedFile.size / 1024).toFixed(0)} KB)</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setAttachedFile(null); setFileError('') }}
                            className="shrink-0 text-slate-500 hover:text-red-400 transition-colors"
                          >
                            <XIcon size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <Paperclip size={14} className="text-nebula-400/60 shrink-0" />
                          <span className="text-slate-500 text-xs">
                            {dragOver ? 'Drop file here...' : 'Attach a file — click or drag & drop (max 3 MB)'}
                          </span>
                        </>
                      )}
                    </div>
                    {fileError && <p className="text-red-400 text-xs mt-1.5">{fileError}</p>}
                  </div>

                  {serverError && (
                    <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{serverError}</p>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary w-full justify-center py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{loading ? 'Sending...' : 'Send Message'}</span>
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <Send size={16} />
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-5">
            <div className="glass-card rounded-2xl p-6 border border-nebula-700/20">
              <h3 className="text-white font-bold mb-5">Contact Information</h3>
              <div className="space-y-4">
                {[
                  { icon: <Mail size={16} />, label: 'Email', value: 'progrex.tech@gmail.com', href: 'mailto:progrex.tech@gmail.com' },
                  { icon: <Phone size={16} />, label: 'Phone', value: '+63 912 345 6789', href: 'tel:+639123456789' },
                  { icon: <MapPin size={16} />, label: 'Office', value: 'Calauan, Laguna', href: 'https://maps.google.com/?q=Calauan,Laguna,Philippines' },
                ].map((item) => (
                  <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 group">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-nebula-700 to-aurora-600 flex items-center justify-center text-white shrink-0 group-hover:shadow-nebula-sm transition-all">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">{item.label}</div>
                      <div className="text-sm text-white/70 group-hover:text-nebula-300 transition-colors">{item.value}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Map — Calauan, Laguna (static-like: pointer events disabled on iframe, click opens Google Maps) */}
            <a
              href="https://maps.google.com/?q=Calauan,Laguna,Philippines"
              target="_blank"
              rel="noopener noreferrer"
              className="block glass-card rounded-2xl p-1 border border-nebula-700/20 overflow-hidden group cursor-pointer"
            >
              <div className="h-48 rounded-xl overflow-hidden relative">
                <iframe
                  title="Calauan, Laguna"
                  src="https://maps.google.com/maps?q=Calauan,+Laguna,+Philippines&t=&z=13&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)', pointerEvents: 'none' }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                {/* hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5 text-white text-xs font-mono bg-black/70 px-3 py-1.5 rounded-lg border border-white/10">
                    <ExternalLink size={11} /> Open in Google Maps
                  </span>
                </div>
              </div>
            </a>

            {/* Social */}
            <div className="glass-card rounded-2xl p-5 border border-nebula-700/20">
              <h4 className="text-white font-bold text-sm mb-4">Follow Us</h4>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: <Facebook size={16} />, label: 'Facebook', href: '#' },
                  { icon: <Instagram size={16} />, label: 'Instagram', href: '#' },
                  { icon: <Twitter size={16} />, label: 'X', href: '#' },
                  { icon: <TikTokIcon size={16} />, label: 'TikTok', href: '#' },
                  { icon: <Linkedin size={16} />, label: 'LinkedIn', href: '#' },
                  { icon: <Youtube size={16} />, label: 'YouTube', href: '#' },
                  { icon: <WhatsAppIcon size={16} />, label: 'WhatsApp', href: '#' },
                  { icon: <Github size={16} />, label: 'GitHub', href: '#' },
                  { icon: <MapPin size={16} />, label: 'Maps', href: 'https://maps.google.com/?q=Calauan,Laguna,Philippines' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-9 h-9 rounded-lg glass border border-nebula-700/20 flex items-center justify-center text-white/40 hover:text-nebula-300 hover:border-nebula-500/50 hover:shadow-nebula-sm transition-all duration-200"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Response time */}
            <div className="glass-card rounded-2xl p-5 border border-nebula-700/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-sm font-mono">{'// ONLINE — Available'}</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Open 24/7. We&apos;re available anytime, day or night, and typically respond within <strong className="text-white">24 hours</strong>. For urgent projects, call us directly for immediate assistance.
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </>
  )
}

// ── Custom Dropdown (Navbar-style) ───────────────────────────────────────────
function CustomSelect({
  label, value, onChange, options, placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all duration-200"
        style={{
          background: open ? 'rgba(14,165,233,0.08)' : 'rgba(103,232,249,0.04)',
          border: `1px solid ${open ? 'rgba(14,165,233,0.45)' : 'rgba(103,232,249,0.18)'}`,
          color: value ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)',
        }}
      >
        <span>{value || placeholder}</span>
        <ChevronDown
          size={14}
          className="shrink-0 text-nebula-400/60 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full mt-2 rounded-xl overflow-hidden z-50"
            style={{
              background: 'rgba(3,3,15,0.97)',
              border: '1px solid rgba(103,232,249,0.15)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(14,165,233,0.08)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Top gradient line */}
            <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, #0EA5E9, #7C3AED, transparent)' }} />
            <div className="py-1.5 max-h-52 overflow-y-auto">
              {options.map((opt) => {
                const isSelected = opt === value
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => { onChange(opt); setOpen(false) }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-all duration-150"
                    style={{
                      background: isSelected ? 'rgba(14,165,233,0.10)' : 'transparent',
                      color: isSelected ? '#93E6FB' : 'rgba(255,255,255,0.6)',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#fff' } }}
                    onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' } }}
                  >
                    <span className="flex-1">{opt}</span>
                    {isSelected && <Check size={13} className="shrink-0 text-nebula-400" />}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Reusable text / email / tel field ────────────────────────────────────────
function Field({
  label, value, onChange, error, placeholder, type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-white/60 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 rounded-xl glass border bg-transparent text-white/80 text-sm placeholder-white/25 focus:outline-none transition-all ${
          error ? 'border-red-500/60' : 'border-nebula-700/20 focus:border-nebula-500/60 focus:shadow-nebula-sm'
        }`}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}
