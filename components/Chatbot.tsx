'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Send, Bot, User, Loader2, RotateCcw, Sparkles, ChevronsUp,
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

type FormStep = 'name' | 'email' | 'phone' | 'company' | 'message'

const WELCOME_MESSAGES: Record<string, string> = {
  EN:  "Hi there! 👋 I'm **PROGREX AI**, your intelligent assistant. Ask me anything about our services, tech stack, pricing, or how we can help build your next big idea!",
  FIL: "Kumusta! 👋 Ako si **PROGREX AI**, ang iyong matalinong assistant. Magtanong tungkol sa aming mga serbisyo, tech stack, presyo, o kung paano namin matutulungan ang iyong susunod na proyekto!",
  ZH:  "你好！👋 我是 **PROGREX AI**，您的智能助手。欢迎询问有关我们的服务、技术栈、价格，或我们如何帮您打造下一个大创意！",
  ES:  "¡Hola! 👋 Soy **PROGREX AI**, tu asistente inteligente. ¡Pregúntame sobre nuestros servicios, tecnologías, precios o cómo podemos ayudarte a construir tu próxima gran idea!",
  AR:  "مرحباً! 👋 أنا **PROGREX AI**، مساعدك الذكي. اسألني عن خدماتنا، تقنياتنا، الأسعار، أو كيف يمكننا مساعدتك في بناء مشروعك القادم!",
  HI:  "नमस्ते! 👋 मैं **PROGREX AI** हूँ, आपका बुद्धिमान सहायक। हमारी सेवाओं, टेक स्टैक, मूल्य, या अपनी अगली बड़ी परियोजना के बारे में पूछें!",
  FR:  "Bonjour! 👋 Je suis **PROGREX AI**, votre assistant intelligent. Posez-moi des questions sur nos services, notre stack technique, nos tarifs ou comment nous pouvons vous aider!",
  BN:  "হ্যালো! 👋 আমি **PROGREX AI**, আপনার বুদ্ধিমান সহকারী। আমাদের সেবা, মূল্য বা পরবর্তী প্রজেক্ট সম্পর্কে যেকোনো প্রশ্ন করুন!",
  RU:  "Привет! 👋 Я **PROGREX AI**, ваш умный ассистент. Задавайте вопросы о наших услугах, технологиях, ценах или реализации вашей идеи!",
  PT:  "Olá! 👋 Sou **PROGREX AI**, seu assistente inteligente. Pergunte-me sobre nossos serviços, tecnologias, preços ou como podemos ajudar a sua próxima grande ideia!",
  ID:  "Halo! 👋 Saya **PROGREX AI**, asisten cerdas Anda. Tanyakan tentang layanan kami, teknologi, harga, atau bagaimana kami dapat membantu proyek Anda berikutnya!",
  DE:  "Hallo! 👋 Ich bin **PROGREX AI**, Ihr intelligenter Assistent. Fragen Sie mich zu unseren Dienstleistungen, Technologien, Preisen oder Ihrer nächsten großen Idee!",
  JA:  "こんにちは！👋 私は **PROGREX AI**、あなたのインテリジェントアシスタントです。サービス、技術スタック、料金、または次のプロジェクトについてお気軽にどうぞ！",
  KO:  "안녕하세요! 👋 저는 **PROGREX AI**, 여러분의 지능형 어시스턴트입니다. 서비스, 기술, 가격, 또는 다음 프로젝트에 대해 무엇이든 물어보세요!",
  VI:  "Xin chào! 👋 Tôi là **PROGREX AI**, trợ lý thông minh của bạn. Hãy hỏi tôi về dịch vụ, công nghệ, bảng giá, hoặc dự án tiếp theo của bạn!",
  TR:  "Merhaba! 👋 Ben **PROGREX AI**, akıllı asistanınız. Hizmetlerimiz, teknolojilerimiz, fiyatlarımız veya bir sonraki projeniz hakkında her şeyi sorabilirsiniz!",
  IT:  "Ciao! 👋 Sono **PROGREX AI**, il tuo assistente intelligente. Chiedimi dei nostri servizi, tecnologie, prezzi o come possiamo aiutarti a realizzare la tua prossima idea!",
  TH:  "สวัสดี! 👋 ฉันคือ **PROGREX AI** ผู้ช่วยอัจฉริยะของคุณ ถามฉันเกี่ยวกับบริการ เทคโนโลยี ราคา หรือโปรเจกต์ถัดไปของคุณได้เลย!",
  NL:  "Hallo! 👋 Ik ben **PROGREX AI**, uw intelligente assistent. Stel mij vragen over onze diensten, technologieën, prijzen of uw volgende grote idee!",
  PL:  "Cześć! 👋 Jestem **PROGREX AI**, Twoim inteligentnym asystentem. Zapytaj mnie o nasze usługi, technologie, ceny lub o Twój następny projekt!",
}

function getWelcomeMessage(lang: string): Message {
  return {
    id: 'welcome',
    role: 'assistant',
    content: WELCOME_MESSAGES[lang] ?? WELCOME_MESSAGES['EN'],
    timestamp: new Date(),
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function renderContent(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-nebula-300">{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(() => [getWelcomeMessage(
    typeof window !== 'undefined' ? (localStorage.getItem('progrex-lang') ?? 'EN') : 'EN'
  )])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasNewMessage, setHasNewMessage] = useState(false)
  const [activeLang, setActiveLangState] = useState('EN')

  // Sync language from Navbar via localStorage + custom event
  useEffect(() => {
    const stored = localStorage.getItem('progrex-lang')
    if (stored) setActiveLangState(stored)
    const handler = (e: Event) => {
      const lang = (e as CustomEvent<string>).detail
      setActiveLangState(lang)
      // Update welcome message if chat is still fresh
      setMessages(prev =>
        prev.length === 1 && prev[0].id === 'welcome' ? [getWelcomeMessage(lang)] : prev
      )
    }
    document.addEventListener('progrex-lang-change', handler)
    return () => document.removeEventListener('progrex-lang-change', handler)
  }, [])

  // ── Lead form state ──────────────────────────────────────────────────
  const [formMode, setFormMode] = useState(false)
  const [formStep, setFormStep] = useState<FormStep>('name')
  const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '', company: '', message: '' })
  const [formSubmitting, setFormSubmitting] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Show scroll-to-top only when not at top
  const [showScrollTop, setShowScrollTop] = useState(false)
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 200)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Allow external trigger (e.g. FAQ section "Chat with our AI" button)
  useEffect(() => {
    const handler = () => setIsOpen(true)
    document.addEventListener('open-chatbot', handler)
    return () => document.removeEventListener('open-chatbot', handler)
  }, [])

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      setTimeout(() => inputRef.current?.focus(), 300)
      setHasNewMessage(false)
    }
  }, [isOpen, messages])

  useEffect(() => {
    if (!isOpen && messages.length > 1) {
      setHasNewMessage(true)
    }
  }, [messages, isOpen])

  const sendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading || formSubmitting) return
    setError(null)

    // ── Form mode: route input through the step handler ──
    if (formMode) {
      await handleFormStep(trimmed)
      return
    }
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const history = [...messages, userMessage]
        .filter((m) => m.id !== 'welcome')
        .map(({ role, content }) => ({ role, content }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, lang: activeLang }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Something went wrong.')

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to get a response. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([getWelcomeMessage(activeLang)])
    setError(null)
    setInput('')
    setFormMode(false)
    setFormStep('name')
    setLeadForm({ name: '', email: '', phone: '', company: '', message: '' })
  }

  // ── Lead form helpers ─────────────────────────────────────────────────────
  const addBot = (content: string) => {
    const msg: Message = { id: `bot-${Date.now()}-${Math.random()}`, role: 'assistant', content, timestamp: new Date() }
    setMessages((prev) => [...prev, msg])
  }
  const addUser = (content: string) => {
    const msg: Message = { id: `user-${Date.now()}-${Math.random()}`, role: 'user', content, timestamp: new Date() }
    setMessages((prev) => [...prev, msg])
  }

  const startLeadForm = () => {
    setFormMode(true)
    setFormStep('name')
    setLeadForm({ name: '', email: '', phone: '', company: '', message: '' })
    addBot("Sure! Let's put together a project inquiry. 📝\n\nFirst, **what's your full name?**")
  }

  const handleFormStep = async (value: string) => {
    const skip = value.toLowerCase() === 'skip' || value === '-'

    if (formStep === 'name') {
      if (!value.trim()) { addBot('Please enter your name to continue.'); return }
      addUser(value)
      setLeadForm((p) => ({ ...p, name: value.trim() }))
      setFormStep('email')
      setInput('')
      addBot(`Nice to meet you, **${value.trim()}**! \n\nWhat's your **email address**?`)

    } else if (formStep === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        addUser(value)
        setInput('')
        addBot("Hmm, that doesn't look like a valid email. Please try again.")
        return
      }
      addUser(value)
      setLeadForm((p) => ({ ...p, email: value.trim() }))
      setFormStep('phone')
      setInput('')
      addBot("Got it! What's your **phone number**? *(type 'skip' to skip)*")

    } else if (formStep === 'phone') {
      addUser(skip ? '*(skipped)*' : value)
      setLeadForm((p) => ({ ...p, phone: skip ? '' : value.trim() }))
      setFormStep('company')
      setInput('')
      addBot("What **company or organization** are you from? *(type 'skip' if none)*")

    } else if (formStep === 'company') {
      addUser(skip ? '*(skipped)*' : value)
      setLeadForm((p) => ({ ...p, company: skip ? '' : value.trim() }))
      setFormStep('message')
      setInput('')
      addBot("Almost there! 🚀 Please **describe your project** — what do you need help with, what are your goals, any specific requirements?")

    } else if (formStep === 'message') {
      if (!value.trim()) { addBot('Please describe your project to continue.'); return }
      addUser(value)
      const finalForm = { ...leadForm, message: value.trim() }
      setLeadForm(finalForm)
      setInput('')
      setFormSubmitting(true)
      addBot('Sending your inquiry... ⏳')

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalForm),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to send')
        setFormMode(false)
        addBot(
          `✅ **Inquiry sent successfully!** Thank you, **${finalForm.name}** — we've received your message and will get back to you at **${finalForm.email}** within 24 hours.\n\nIn the meantime, you can also browse our [projects](/projects) or [services](/services). Is there anything else I can help you with?`
        )
      } catch (err: unknown) {
        addBot(`⚠️ Something went wrong: ${err instanceof Error ? err.message : 'Please try again or use the Contact page.'}`)
      } finally {
        setFormSubmitting(false)
      }
    }
  }

  return (
    <>
      {/* ── Floating Toggle Button ── */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
        <AnimatePresence>
          {!isOpen && hasNewMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 8 }}
              className="font-mono text-[10px] text-nebula-300 px-3 py-1.5 rounded whitespace-nowrap"
              style={{ background: 'rgba(103,232,249,0.12)', border: '1px solid rgba(103,232,249,0.3)' }}
            >
              // NEW_MSG
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulsing label — above the button row, hidden when chat is open */}
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              key="chat-label"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: [0.7, 1, 0.7], y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ opacity: { duration: 2.2, repeat: Infinity }, y: { duration: 0.25 } }}
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-1.5 font-mono text-[11px] text-nebula-300 px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer hover:text-white transition-colors"
              style={{ background: 'rgba(103,232,249,0.08)', border: '1px solid rgba(103,232,249,0.22)' }}
            >
              <Sparkles size={11} />
              Chat with our AI
            </motion.button>
          )}
        </AnimatePresence>

        {/* Bottom row: scroll-to-top + chat button */}
        <div className="flex items-center gap-3">
          {/* Scroll to top — only visible when scrolled down */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                key="scroll-top"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.2 }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Scroll to top"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
                style={{
                  background: 'rgba(6,6,22,0.88)',
                  border: '1px solid rgba(103,232,249,0.25)',
                  boxShadow: '0 0 12px rgba(103,232,249,0.1)',
                }}
              >
                <motion.div
                  animate={{ y: [0, -4, 0, -4, 0, -4, 0, 0] }}
                  transition={{
                    duration: 1.6,
                    times: [0, 0.1, 0.2, 0.35, 0.45, 0.6, 0.7, 1],
                    repeat: Infinity,
                    repeatDelay: 1,
                    ease: 'easeInOut',
                  }}
                >
                  <ChevronsUp size={17} className="text-nebula-300" />
                </motion.div>
              </motion.button>
            )}
          </AnimatePresence>

          <div className="relative flex items-center justify-center">
            <motion.button
              onClick={() => setIsOpen((v) => !v)}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.08 }}
              aria-label={isOpen ? 'Close chat' : 'Open chat'}
              className="relative w-14 h-14 rounded-full flex items-center justify-center text-white transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)',
                boxShadow: '0 0 25px rgba(103,232,249,0.35)',
              }}
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={22} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="open"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Bot size={22} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pulse ring */}
              {!isOpen && (
                <span
                  className="absolute inset-0 rounded-full animate-ping pointer-events-none"
                  style={{ background: 'rgba(103,232,249,0.15)' }}
                />
              )}

              {/* Notification dot */}
              {!isOpen && hasNewMessage && (
                <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-[#03030F]" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Chat Window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="fixed bottom-24 right-6 z-[9998] w-[360px] max-w-[calc(100vw-3rem)] flex flex-col rounded-xl overflow-hidden"
            style={{
              height: 'min(560px, calc(100vh - 140px))',
              background: 'rgba(4,4,20,0.97)',
              border: '1px solid rgba(103,232,249,0.2)',
              boxShadow: '0 8px 60px rgba(0,0,0,0.6), 0 0 40px rgba(103,232,249,0.06)',
            }}
          >
            {/* Dot grid background */}
            <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none" />

            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 shrink-0 relative z-10"
              style={{ borderBottom: '1px solid rgba(103,232,249,0.12)', background: 'rgba(2,2,15,0.8)' }}
            >
              {/* AI indicator */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(103,232,249,0.1)', border: '1px solid rgba(103,232,249,0.2)' }}
              >
                <Bot size={16} className="text-nebula-300" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-mono text-[11px] text-nebula-400/70 tracking-widest">// AI ASSISTANT</p>
                <p className="font-display font-bold text-sm text-white leading-tight">PROGREX AI</p>
              </div>

              <div className="flex items-center gap-1">
                {/* Online dot */}
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse mr-2"
                  style={{ background: '#34D399' }}
                />
                <button
                  onClick={clearChat}
                  title="Clear chat"
                  className="p-1.5 rounded text-white/30 hover:text-white/70 transition-colors"
                >
                  <RotateCcw size={13} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close"
                  className="p-1.5 rounded text-white/30 hover:text-white/70 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4 relative z-10"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(103,232,249,0.2) transparent' }}
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={
                      msg.role === 'assistant'
                        ? { background: 'rgba(103,232,249,0.1)', border: '1px solid rgba(103,232,249,0.2)' }
                        : { background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }
                    }
                  >
                    {msg.role === 'assistant' ? (
                      <Bot size={13} className="text-nebula-300" />
                    ) : (
                      <User size={13} className="text-white" />
                    )}
                  </div>

                  {/* Bubble */}
                  <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className="px-3.5 py-2.5 rounded-xl text-sm leading-relaxed"
                      style={
                        msg.role === 'assistant'
                          ? {
                              background: 'rgba(10,10,35,0.9)',
                              border: '1px solid rgba(103,232,249,0.12)',
                              color: 'rgba(255,255,255,0.8)',
                            }
                          : {
                              background: 'linear-gradient(135deg, rgba(14,165,233,0.9), rgba(124,58,237,0.9))',
                              color: '#fff',
                            }
                      }
                    >
                      {renderContent(msg.content)}
                    </div>
                    <span className="font-mono text-[9px] text-white/20 px-1">{formatTime(msg.timestamp)}</span>
                  </div>
                </motion.div>
              ))}

              {/* Loading dots */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2.5"
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'rgba(103,232,249,0.1)', border: '1px solid rgba(103,232,249,0.2)' }}
                  >
                    <Bot size={13} className="text-nebula-300" />
                  </div>
                  <div
                    className="px-4 py-3 rounded-xl flex items-center gap-1.5"
                    style={{ background: 'rgba(10,10,35,0.9)', border: '1px solid rgba(103,232,249,0.12)' }}
                  >
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{
                          background: '#67E8F9',
                          animationDelay: `${delay}ms`,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 rounded-xl px-3 py-2 flex items-start gap-2"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  <span className="shrink-0 mt-0.5">⚠</span>
                  <span>{error}</span>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick-action: Get a Quote (shown when not in form mode and chat is fresh) */}
            {!formMode && messages.length <= 2 && !isLoading && (
              <div className="px-4 pb-2 relative z-10">
                <button
                  onClick={startLeadForm}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'rgba(14,165,233,0.08)',
                    border: '1px solid rgba(14,165,233,0.25)',
                    color: 'rgba(103,232,249,0.85)',
                  }}
                >
                  📝 Start a Project Inquiry
                </button>
              </div>
            )}

            {/* Input area */}
            <div
              className="px-3 py-3 shrink-0 relative z-10"
              style={{ borderTop: '1px solid rgba(103,232,249,0.1)', background: 'rgba(2,2,12,0.9)' }}
            >
              {/* Skip button for optional steps */}
              {formMode && (formStep === 'phone' || formStep === 'company') && (
                <button
                  onClick={() => handleFormStep('skip')}
                  className="w-full mb-2 py-1.5 rounded-lg text-xs font-mono transition-all duration-150 hover:opacity-80"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}
                >
                  Skip (optional)
                </button>
              )}
              <div
                className="flex items-end gap-2 px-3 py-2 rounded-lg transition-all duration-200"
                style={{
                  background: 'rgba(10,10,30,0.8)',
                  border: '1px solid rgba(103,232,249,0.15)',
                }}
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                    e.target.style.height = 'auto'
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    formMode
                      ? formStep === 'name' ? 'Your full name...'
                      : formStep === 'email' ? 'you@example.com'
                      : formStep === 'phone' ? 'Your phone number...'
                      : formStep === 'company' ? 'Company name...'
                      : 'Describe your project...'
                      : '> Ask me anything…'
                  }
                  rows={1}
                  disabled={isLoading || formSubmitting}
                  className="flex-1 bg-transparent text-sm text-white/75 resize-none outline-none leading-relaxed min-h-[24px] max-h-[120px] disabled:opacity-40 font-mono placeholder:text-white/20 placeholder:font-mono"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}
                >
                  {isLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </div>
              <p className="text-center font-mono text-[9px] text-white/20 mt-2 tracking-wider">
                PROGREX AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
