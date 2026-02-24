'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Phone, MapPin, Send, CheckCircle, Github, Twitter, Linkedin, Facebook } from 'lucide-react'
import SectionWrapper from '@/components/SectionWrapper'

const serviceOptions = [
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
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden bg-[#0A0A0F]">
        <div className="absolute inset-0 tech-grid opacity-40 pointer-events-none" />
        <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-4 h-[2px] bg-[#7C2AE8]" />
              <span className="sys-label-accent">LET&apos;S WORK TOGETHER</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#F0EEF8] mb-4 leading-tight">
              Start Your <span className="text-[#C4B5FD]">Project</span>
            </h1>
            <p className="text-[#5A5770] text-base max-w-xl leading-relaxed font-light">
              Tell us about your project and we&apos;ll get back to you within 24 hours with a plan.
            </p>
          </motion.div>
        </div>
      </section>

      <SectionWrapper className="bg-[#0A0A0F]">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Form */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="border border-[#1E1E2E] bg-[#0F0F14] p-12 text-center relative"
                >
                  <div className="absolute -top-px -left-px w-5 h-5 border-l-2 border-t-2 border-[#7C2AE8]" />
                  <div className="absolute -bottom-px -right-px w-5 h-5 border-r-2 border-b-2 border-[#7C2AE8]" />
                  <div className="w-12 h-12 border border-[#4C1D95] flex items-center justify-center mx-auto mb-6 bg-[#14141B]">
                    <CheckCircle size={22} className="text-[#7C2AE8]" />
                  </div>
                  <div className="sys-label-accent mb-2 text-center">TRANSMISSION RECEIVED</div>
                  <h2 className="text-xl font-bold text-[#F0EEF8] mb-3">Message Sent!</h2>
                  <p className="text-[#5A5770] text-sm leading-relaxed mb-6">
                    Thank you, <strong className="text-[#C4B5FD]">{form.name}</strong>! We&apos;ve received your message and will get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', company: '', service: '', budget: '', message: '' }) }}
                    className="btn-sys inline-flex"
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
                  className="border border-[#1E1E2E] bg-[#0F0F14] p-6 sm:p-8 space-y-5"
                >
                  <div className="flex items-center justify-between mb-2 pb-4 border-b border-[#1A1A24]">
                    <h2 className="text-base font-semibold text-[#D1CEE8]">Get a Free Quote</h2>
                    <span className="sys-label">ALL FIELDS WITH * ARE REQUIRED</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Full Name *" value={form.name} onChange={(v) => handleChange('name', v)} error={errors.name} placeholder="Your name" />
                    <Field label="Email Address *" type="email" value={form.email} onChange={(v) => handleChange('email', v)} error={errors.email} placeholder="you@company.com" />
                    <Field label="Phone Number" type="tel" value={form.phone} onChange={(v) => handleChange('phone', v)} placeholder="+63 912 345 6789" />
                    <Field label="Company / Organization" value={form.company} onChange={(v) => handleChange('company', v)} placeholder="Your company name" />
                  </div>

                  {/* Service */}
                  <div>
                    <label className="block sys-label mb-2">SERVICE NEEDED</label>
                    <select
                      value={form.service}
                      onChange={(e) => handleChange('service', e.target.value)}
                      className="w-full px-4 py-2.5 border border-[#1E1E2E] bg-[#0A0A0F] text-[#9B98B3] text-xs font-mono focus:outline-none focus:border-[#7C2AE8] transition-colors"
                    >
                      <option value="">Select a service...</option>
                      {serviceOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="block sys-label mb-2">BUDGET RANGE</label>
                    <select
                      value={form.budget}
                      onChange={(e) => handleChange('budget', e.target.value)}
                      className="w-full px-4 py-2.5 border border-[#1E1E2E] bg-[#0A0A0F] text-[#9B98B3] text-xs font-mono focus:outline-none focus:border-[#7C2AE8] transition-colors"
                    >
                      <option value="">Select budget range...</option>
                      <option>Below ?10,000</option>
                      <option>?10,000 â€â€œ ?50,000</option>
                      <option>?50,000 â€â€œ ?150,000</option>
                      <option>?150,000 â€â€œ ?500,000</option>
                      <option>?500,000+</option>
                      <option>Let&apos;s Discuss</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block sys-label mb-2">PROJECT DETAILS *</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      rows={5}
                      placeholder="Describe your project, goals, and any specific requirements..."
                      className={`w-full px-4 py-2.5 border bg-transparent text-[#9B98B3] text-xs font-mono placeholder-[#252538] focus:outline-none transition-colors resize-none ${
                        errors.message ? 'border-red-500/60' : 'border-[#1E1E2E] focus:border-[#7C2AE8]'
                      }`}
                    />
                    {errors.message && <p className="text-red-400 text-[10px] font-mono mt-1">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-sys-filled w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span>{loading ? 'TRANSMITTING...' : 'SEND MESSAGE'}</span>
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <Send size={13} />
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            {/* Contact details panel */}
            <div className="border border-[#1E1E2E] bg-[#0F0F14] p-6">
              <div className="sys-label-accent mb-5">CONTACT INFORMATION</div>
              <div className="space-y-4">
                {[
                  { icon: <Mail size={13} />, label: 'EMAIL', value: 'hello@progrex.com', href: 'mailto:hello@progrex.com' },
                  { icon: <Phone size={13} />, label: 'PHONE', value: '+63 912 345 6789', href: 'tel:+639123456789' },
                  { icon: <MapPin size={13} />, label: 'OFFICE', value: 'Manila, Philippines', href: '#' },
                ].map((item) => (
                  <a key={item.label} href={item.href} className="flex items-start gap-3 group">
                    <div className="w-7 h-7 border border-[#1E1E2E] flex items-center justify-center text-[#4C1D95] group-hover:border-[#4C1D95] group-hover:text-[#7C2AE8] transition-all shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <div className="sys-label mb-0.5">{item.label}</div>
                      <div className="text-xs text-[#9B98B3] group-hover:text-[#C4B5FD] transition-colors font-light">{item.value}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Map placeholder */}
            <div className="border border-[#1E1E2E] bg-[#0F0F14] overflow-hidden">
              <div className="h-40 tech-grid relative flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={20} className="text-[#4C1D95] mx-auto mb-1" />
                  <div className="sys-label">MANILA, PHILIPPINES</div>
                </div>
              </div>
            </div>

            {/* Social */}
            <div className="border border-[#1E1E2E] bg-[#0F0F14] p-5">
              <div className="sys-label mb-4">FOLLOW US</div>
              <div className="flex gap-2">
                {[
                  { icon: <Github size={13} />, label: 'GitHub', href: '#' },
                  { icon: <Twitter size={13} />, label: 'Twitter', href: '#' },
                  { icon: <Linkedin size={13} />, label: 'LinkedIn', href: '#' },
                  { icon: <Facebook size={13} />, label: 'Facebook', href: '#' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-8 h-8 border border-[#1E1E2E] flex items-center justify-center text-[#3A3854] hover:text-[#C4B5FD] hover:border-[#4C1D95] transition-all duration-150"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="border border-[#1E1E2E] bg-[#0F0F14] p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="status-dot-pulse" />
                <span className="sys-label-accent">SYSTEM ONLINE</span>
              </div>
              <p className="text-[#3A3854] text-[10px] font-mono leading-relaxed">
                Monâ€â€œFri, 9AMâ€â€œ6PM PHT. Response within{' '}
                <span className="text-[#9B98B3]">24 hours</span>. Urgent? Call directly.
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </>
  )
}

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
      <label className="block sys-label mb-2">{label.toUpperCase()}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 border bg-transparent text-[#9B98B3] text-xs font-mono placeholder-[#252538] focus:outline-none transition-colors ${
          error ? 'border-red-500/60' : 'border-[#1E1E2E] focus:border-[#7C2AE8]'
        }`}
      />
      {error && <p className="text-red-400 text-[10px] font-mono mt-1">{error}</p>}
    </div>
  )
}
