'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Zap,
  Loader2,
  RotateCcw,
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hi there! ðŸ‘‹ I'm **PROGREX AI**, your intelligent assistant. Ask me anything about our services, tech stack, pricing, or how we can help build your next big idea!",
  timestamp: new Date(),
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function renderContent(text: string) {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasNewMessage, setHasNewMessage] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

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
    if (!trimmed || isLoading) return

    setError(null)
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
        body: JSON.stringify({ messages: history }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong.')
      }

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
    setMessages([WELCOME_MESSAGE])
    setError(null)
    setInput('')
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-9999 flex flex-col items-end gap-3">
        <AnimatePresence>
          {!isOpen && hasNewMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 8 }}
              className="bg-[#560BAD] text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap"
            >
              New message!
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setIsOpen((v) => !v)}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.08 }}
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
          className="relative w-14 h-14 rounded-full bg-linear-to-br from-[#560BAD] to-[#4361EE] text-white shadow-[0_0_25px_rgba(86,11,173,0.6)] hover:shadow-[0_0_40px_rgba(131,29,198,0.8)] transition-shadow duration-300 flex items-center justify-center"
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
                <MessageCircle size={22} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pulse ring */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full animate-ping bg-[#560BAD]/30 pointer-events-none" />
          )}

          {/* Notification dot */}
          {!isOpen && hasNewMessage && (
            <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-[#050510]" />
          )}
        </motion.button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="fixed bottom-24 right-6 z-[9998] w-[360px] max-w-[calc(100vw-3rem)] flex flex-col rounded-2xl overflow-hidden shadow-[0_8px_60px_rgba(86,11,173,0.45)] border border-[#560BAD]/30 bg-[#0a0a1f]"
            style={{ height: 'min(560px, calc(100vh - 140px))' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-linear-to-r from-[#3A0CA3] to-[#560BAD] border-b border-[#560BAD]/40 shrink-0">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shadow-inner">
                <Zap size={18} className="text-[#CFA3EA]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white leading-tight">PROGREX AI</p>
                <p className="text-[11px] text-[#CFA3EA]/80 font-medium flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online Â· Powered by Groq
                </p>
              </div>
              <button
                onClick={clearChat}
                title="Clear chat"
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-[#560BAD]/40 scrollbar-track-transparent">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      msg.role === 'assistant'
                        ? 'bg-linear-to-br from-[#560BAD] to-[#4361EE]'
                        : 'bg-linear-to-br from-[#831DC6] to-[#CFA3EA]'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <Bot size={14} className="text-white" />
                    ) : (
                      <User size={14} className="text-white" />
                    )}
                  </div>

                  {/* Bubble */}
                  <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'assistant'
                          ? 'bg-[#13132a] border border-[#560BAD]/20 text-slate-200 rounded-tl-sm'
                          : 'bg-linear-to-br from-[#560BAD] to-[#4361EE] text-white rounded-tr-sm'
                      }`}
                    >
                      {renderContent(msg.content)}
                    </div>
                    <span className="text-[10px] text-slate-600 px-1">{formatTime(msg.timestamp)}</span>
                  </div>
                </motion.div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2.5 flex-row"
                >
                  <div className="w-7 h-7 rounded-full bg-linear-to-br from-[#560BAD] to-[#4361EE] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[#13132a] border border-[#560BAD]/20 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#560BAD] animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 rounded-full bg-[#560BAD] animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-[#560BAD] animate-bounce [animation-delay:300ms]" />
                  </div>
                </motion.div>
              )}

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 flex items-start gap-2"
                >
                  <span className="shrink-0 mt-0.5">âš ï¸</span>
                  <span>{error}</span>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-3 py-3 border-t border-[#560BAD]/20 bg-[#0d0d22] shrink-0">
              <div className="flex items-end gap-2 bg-[#13132a] border border-[#560BAD]/30 rounded-xl px-3 py-2 focus-within:border-[#560BAD]/70 focus-within:shadow-[0_0_15px_rgba(86,11,173,0.15)] transition-all duration-200">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                    e.target.style.height = 'auto'
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anythingâ€¦"
                  rows={1}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 resize-none outline-none leading-relaxed min-h-[24px] max-h-[120px] disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="shrink-0 w-8 h-8 rounded-lg bg-linear-to-br from-[#560BAD] to-[#4361EE] text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_12px_rgba(86,11,173,0.6)] transition-all duration-200 active:scale-95"
                >
                  {isLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </div>
              <p className="text-center text-[10px] text-slate-700 mt-2">
                Powered by <span className="text-[#831DC6] font-medium">Groq Ã— LLaMA 3.3</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
