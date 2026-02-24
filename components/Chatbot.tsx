'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle, X, Send, Bot, User, Loader2, RotateCcw,
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
  content: "Hi there! 👋 I'm **PROGREX AI**, your intelligent assistant. Ask me anything about our services, tech stack, pricing, or how we can help build your next big idea!",
  timestamp: new Date(),
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
    setMessages([WELCOME_MESSAGE])
    setError(null)
    setInput('')
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
                <MessageCircle size={22} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pulse ring */}
          {!isOpen && (
            <span
              className="absolute inset-0 rounded-full animate-ping pointer-events-none"
              style={{ background: 'rgba(103,232,249,0.2)' }}
            />
          )}

          {/* Notification dot */}
          {!isOpen && hasNewMessage && (
            <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-[#03030F]" />
          )}
        </motion.button>
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
                <p className="font-mono text-[11px] text-nebula-400/70 tracking-widest">// AI COPILOT</p>
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

            {/* Input area */}
            <div
              className="px-3 py-3 shrink-0 relative z-10"
              style={{ borderTop: '1px solid rgba(103,232,249,0.1)', background: 'rgba(2,2,12,0.9)' }}
            >
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
                  placeholder="> Ask me anything…"
                  rows={1}
                  disabled={isLoading}
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
                POWERED BY <span className="text-nebula-400/60">GROQ × LLAMA 3.3</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
