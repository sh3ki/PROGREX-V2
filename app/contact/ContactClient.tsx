'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Phone, MapPin, Send, CheckCircle, Github, Twitter, Linkedin, Facebook } from 'lucide-react'
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
    await new Promise((res) => setTimeout(res, 1500)) // Simulate API call
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
      <section className="relative pt-32 pb-16 overflow-hidden bg-section-a">
        <div className="absolute inset-0 bg-dot-grid opacity-15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-nebula-700/10 rounded-full blur-[100px]" />

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

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[rgba(5,5,16,0.7)] to-transparent" />
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
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-nebula-700 to-aurora-600 flex items-center justify-center mx-auto mb-6 shadow-nebula"
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
                    <Field
                      label="Full Name *"
                      value={form.name}
                      onChange={(v) => handleChange('name', v)}
                      error={errors.name}
                      placeholder="Your name"
                    />
                    <Field
                      label="Email Address *"
                      type="email"
                      value={form.email}
                      onChange={(v) => handleChange('email', v)}
                      error={errors.email}
                      placeholder="you@company.com"
                    />
                    <Field
                      label="Phone Number"
                      type="tel"
                      value={form.phone}
                      onChange={(v) => handleChange('phone', v)}
                      placeholder="+63 912 345 6789"
                    />
                    <Field
                      label="Company / Organization"
                      value={form.company}
                      onChange={(v) => handleChange('company', v)}
                      placeholder="Your company name"
                    />
                  </div>

                  {/* Service */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Service Needed</label>
                    <select
                      value={form.service}
                      onChange={(e) => handleChange('service', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl glass border border-nebula-700/20 bg-[#050510] text-white/80 text-sm focus:outline-none focus:border-nebula-500/60 focus:shadow-nebula-sm transition-all"
                    >
                      <option value="">Select a service...</option>
                      {services.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Budget Range</label>
                    <select
                      value={form.budget}
                      onChange={(e) => handleChange('budget', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl glass border border-nebula-700/20 bg-[#050510] text-white/80 text-sm focus:outline-none focus:border-nebula-500/60 transition-all"
                    >
                      <option value="">Select budget range...</option>
                      <option>Below ₱10,000</option>
                      <option>₱10,000 – ₱50,000</option>
                      <option>₱50,000 – ₱150,000</option>
                      <option>₱150,000 – ₱500,000</option>
                      <option>₱500,000+</option>
                      <option>Let&apos;s Discuss</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Project Details *</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      rows={4}
                      placeholder="Describe your project, goals, and any specific requirements..."
                      className={`w-full px-4 py-2.5 rounded-xl glass border bg-transparent text-slate-200 text-sm placeholder-slate-500 focus:outline-none transition-all resize-none ${
                        errors.message
                          ? 'border-red-500/60'
                          : 'border-nebula-700/20 focus:border-nebula-500/60 focus:shadow-nebula-sm'
                      }`}
                    />
                    {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
                  </div>

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
            <div
              className="glass-card rounded-2xl p-6 border border-nebula-700/20">
              <h3 className="text-white font-bold mb-5">Contact Information</h3>
              <div className="space-y-4">
                {[
                  { icon: <Mail size={16} />, label: 'Email', value: 'hello@progrex.com', href: 'mailto:hello@progrex.com' },
                  { icon: <Phone size={16} />, label: 'Phone', value: '+63 912 345 6789', href: 'tel:+639123456789' },
                  { icon: <MapPin size={16} />, label: 'Office', value: 'Manila, Philippines', href: '#' },
                ].map((item) => (
                  <a key={item.label} href={item.href} className="flex items-start gap-3 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-nebula-700 to-aurora-600 flex items-center justify-center text-white shrink-0 group-hover:shadow-nebula-sm transition-all">
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

            {/* Map Placeholder */}
            <div className="glass-card rounded-2xl p-1 border border-nebula-700/20 overflow-hidden">
              <div className="h-44 rounded-xl bg-space-900 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-dot-grid opacity-20 rounded-xl" />
                <div className="text-center relative">
                  <MapPin size={24} className="text-nebula-500 mx-auto mb-2" />
                  <div className="text-white/40 text-xs font-mono">// Manila, Philippines</div>
                </div>
              </div>
            </div>

            {/* Social */}
            <div
              className="glass-card rounded-2xl p-5 border border-nebula-700/20">
              <h4 className="text-white font-bold text-sm mb-4">Follow Us</h4>
              <div className="flex gap-3">
                {[
                  { icon: <Github size={16} />, label: 'GitHub', href: '#' },
                  { icon: <Twitter size={16} />, label: 'Twitter', href: '#' },
                  { icon: <Linkedin size={16} />, label: 'LinkedIn', href: '#' },
                  { icon: <Facebook size={16} />, label: 'Facebook', href: '#' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-9 h-9 rounded-lg glass border border-nebula-700/20 flex items-center justify-center text-white/40 hover:text-nebula-300 hover:border-nebula-500/50 hover:shadow-nebula-sm transition-all duration-200"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Response time */}
            <div
              className="glass-card rounded-2xl p-5 border border-nebula-700/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-sm font-mono">// ONLINE — Available</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Mon–Fri, 9AM–6PM PHT. We typically respond within <strong className="text-white">24 hours</strong>. For urgent projects, call us directly.
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>
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
      <label className="block text-sm font-medium text-white/60 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 rounded-xl glass border bg-transparent text-white/80 text-sm placeholder-white/25 focus:outline-none transition-all ${
          error
            ? 'border-red-500/60'
            : 'border-nebula-700/20 focus:border-nebula-500/60 focus:shadow-nebula-sm'
        }`}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}
