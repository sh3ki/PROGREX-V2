'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Phone, MapPin, Send, CheckCircle, Github, Twitter, Linkedin, Facebook } from 'lucide-react'

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
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    budget: '',
    message: '',
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

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
    await new Promise((res) => setTimeout(res, 1500))
    setLoading(false)
    setSubmitted(true)
  }

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  return (
    <>
      {/* â”€â”€ HERO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="bg-[#0D0F12] pt-32 pb-20 border-b border-[#1F2530] relative overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 bg-grid-fine opacity-40 pointer-events-none" />

        <div className="max-w-350 mx-auto px-6 lg:px-10 relative">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="label text-[#1B6FFF] mb-4 block">LET&apos;S WORK TOGETHER</span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#EEF0F3] tracking-[-0.04em] leading-[1.05] mb-6">
              Start Your<br />
              <span className="text-[#1B6FFF]">Project</span>
            </h1>
            <p className="text-[#8892A4] text-lg max-w-lg leading-relaxed">
              Tell us about your project and we&apos;ll get back to you within 24 hours with a plan.
            </p>
          </motion.div>
        </div>
      </section>

      {/* â”€â”€ CONTACT GRID â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="bg-[#0D0F12]">
        <div className="max-w-350 mx-auto px-6 lg:px-10 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

            {/* â”€â”€ FORM â”€â”€ */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="bg-[#111417] border border-[#1F2530] p-12 text-center relative"
                  >
                    {/* Blue top bar */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#1B6FFF]" />

                    <div className="w-14 h-14 bg-[#1B6FFF] flex items-center justify-center mx-auto mb-6">
                      <CheckCircle size={24} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#EEF0F3] mb-3 tracking-[-0.025em]">Message Sent!</h2>
                    <p className="text-[#8892A4] leading-relaxed mb-8 text-sm">
                      Thank you, <strong className="text-[#EEF0F3]">{form.name}</strong>. We&apos;ve received your message and will get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false)
                        setForm({ name: '', email: '', phone: '', company: '', service: '', budget: '', message: '' })
                      }}
                      className="btn-outline text-sm px-6 py-3 inline-flex"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    onSubmit={handleSubmit}
                    className="bg-[#111417] border border-[#1F2530] p-8 relative"
                  >
                    {/* Blue top accent */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#1B6FFF]" />

                    <h2 className="text-xl font-bold text-[#EEF0F3] mb-6 tracking-[-0.02em]">Get a Free Quote</h2>

                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Field label="Full Name *" value={form.name} onChange={(v) => handleChange('name', v)} error={errors.name} placeholder="Your name" />
                        <Field label="Email Address *" type="email" value={form.email} onChange={(v) => handleChange('email', v)} error={errors.email} placeholder="you@company.com" />
                        <Field label="Phone Number" type="tel" value={form.phone} onChange={(v) => handleChange('phone', v)} placeholder="+63 912 345 6789" />
                        <Field label="Company / Organization" value={form.company} onChange={(v) => handleChange('company', v)} placeholder="Your company name" />
                      </div>

                      {/* Service select */}
                      <div>
                        <label className="block text-xs font-mono text-[#4E5A6E] tracking-widest uppercase mb-2">Service Needed</label>
                        <select
                          value={form.service}
                          onChange={(e) => handleChange('service', e.target.value)}
                          className="w-full px-4 py-3 bg-[#0D0F12] border border-[#1F2530] text-[#EEF0F3] text-sm focus:outline-none focus:border-[#1B6FFF]/60 transition-colors"
                        >
                          <option value="">Select a service...</option>
                          {services.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      {/* Budget select */}
                      <div>
                        <label className="block text-xs font-mono text-[#4E5A6E] tracking-widest uppercase mb-2">Budget Range</label>
                        <select
                          value={form.budget}
                          onChange={(e) => handleChange('budget', e.target.value)}
                          className="w-full px-4 py-3 bg-[#0D0F12] border border-[#1F2530] text-[#EEF0F3] text-sm focus:outline-none focus:border-[#1B6FFF]/60 transition-colors"
                        >
                          <option value="">Select budget range...</option>
                          <option>Below â‚±10,000</option>
                          <option>â‚±10,000 â€“ â‚±50,000</option>
                          <option>â‚±50,000 â€“ â‚±150,000</option>
                          <option>â‚±150,000 â€“ â‚±500,000</option>
                          <option>â‚±500,000+</option>
                          <option>Let&apos;s Discuss</option>
                        </select>
                      </div>

                      {/* Message */}
                      <div>
                        <label className="block text-xs font-mono text-[#4E5A6E] tracking-widest uppercase mb-2">
                          Project Details *
                        </label>
                        <textarea
                          value={form.message}
                          onChange={(e) => handleChange('message', e.target.value)}
                          rows={5}
                          placeholder="Describe your project, goals, and any specific requirements..."
                          className={`w-full px-4 py-3 bg-[#0D0F12] border text-[#EEF0F3] text-sm placeholder-[#4E5A6E] focus:outline-none transition-colors resize-none ${
                            errors.message ? 'border-red-500/60' : 'border-[#1F2530] focus:border-[#1B6FFF]/60'
                          }`}
                        />
                        {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full justify-center py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>{loading ? 'Sending...' : 'Send Message'}</span>
                        {loading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white"
                          />
                        ) : (
                          <Send size={15} />
                        )}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* â”€â”€ SIDEBAR â”€â”€ */}
            <div className="lg:col-span-2 space-y-4">

              {/* Availability */}
              <div className="bg-[#111417] border border-[#1F2530] p-5">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="w-2 h-2 bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-[11px] text-emerald-400 tracking-widest uppercase">We&apos;re Available</span>
                </div>
                <p className="text-[#8892A4] text-xs leading-relaxed">
                  Monâ€“Fri, 9AMâ€“6PM PHT. We typically respond within <strong className="text-[#EEF0F3]">24 hours</strong>. For urgent projects, call us directly.
                </p>
              </div>

              {/* Contact info */}
              <div className="bg-[#111417] border border-[#1F2530] p-6">
                <h3 className="font-mono text-[11px] text-[#4E5A6E] tracking-[0.12em] uppercase mb-5">Contact Information</h3>
                <div className="space-y-4">
                  {[
                    { icon: <Mail size={14} />, label: 'Email', value: 'hello@progrex.com', href: 'mailto:hello@progrex.com' },
                    { icon: <Phone size={14} />, label: 'Phone', value: '+63 912 345 6789', href: 'tel:+639123456789' },
                    { icon: <MapPin size={14} />, label: 'Office', value: 'Manila, Philippines', href: '#' },
                  ].map((item) => (
                    <a key={item.label} href={item.href} className="flex items-start gap-3 group">
                      <div className="w-8 h-8 bg-[#1B6FFF]/10 border border-[#1B6FFF]/20 flex items-center justify-center text-[#1B6FFF] shrink-0 group-hover:bg-[#1B6FFF] group-hover:text-white transition-all">
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-mono text-[10px] text-[#4E5A6E] tracking-widest uppercase">{item.label}</div>
                        <div className="text-sm text-[#8892A4] group-hover:text-[#EEF0F3] transition-colors mt-0.5">{item.value}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Map placeholder */}
              <div className="bg-[#111417] border border-[#1F2530] overflow-hidden">
                <div className="h-44 bg-grid-fine relative flex items-center justify-center">
                  <div className="text-center">
                    <MapPin size={20} className="text-[#1B6FFF] mx-auto mb-2" />
                    <div className="font-mono text-[10px] text-[#4E5A6E] tracking-widest uppercase">Manila, Philippines</div>
                  </div>
                  {/* Corner marks */}
                  <span className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#1B6FFF]/40" />
                  <span className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#1B6FFF]/40" />
                </div>
              </div>

              {/* Social links */}
              <div className="bg-[#111417] border border-[#1F2530] p-5">
                <h4 className="font-mono text-[11px] text-[#4E5A6E] tracking-[0.12em] uppercase mb-4">Follow Us</h4>
                <div className="flex gap-2">
                  {[
                    { icon: <Github size={14} />, label: 'GitHub', href: '#' },
                    { icon: <Twitter size={14} />, label: 'Twitter', href: '#' },
                    { icon: <Linkedin size={14} />, label: 'LinkedIn', href: '#' },
                    { icon: <Facebook size={14} />, label: 'Facebook', href: '#' },
                  ].map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className="w-9 h-9 border border-[#1F2530] flex items-center justify-center text-[#4E5A6E] hover:text-[#1B6FFF] hover:border-[#1B6FFF]/40 transition-all"
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

// Reusable form field
function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = 'text',
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
      <label className="block text-xs font-mono text-[#4E5A6E] tracking-widest uppercase mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 bg-[#0D0F12] border text-[#EEF0F3] text-sm placeholder-[#4E5A6E] focus:outline-none transition-colors ${
          error ? 'border-red-500/60' : 'border-[#1F2530] focus:border-[#1B6FFF]/60'
        }`}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}

