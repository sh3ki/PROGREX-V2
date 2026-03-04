'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Clock, User, ArrowLeft, Twitter, Linkedin, Share2, BookOpen } from 'lucide-react'
import BlogCard from '@/components/BlogCard'
import ConstellationDecor from '@/components/ConstellationDecor'
import CTASection from '@/components/CTASection'
import SectionWrapper from '@/components/SectionWrapper'

interface BlogPost {
  title: string
  category: string
  author: { name: string; role: string; avatar?: string }
  date: string
  readTime: string
  excerpt: string
  slug: string
  tags: string[]
  image: string
  content: string
  relatedPosts: string[]
}

interface RelatedPost {
  title: string
  category: string
  author: { name: string; role: string }
  date: string
  readTime: string
  excerpt: string
  slug: string
  tags: string[]
  image?: string
}

const categoryStyle: Record<string, { border: string; tag: string; glow: string; text: string }> = {
  Tech:           { border: 'rgba(14,165,233,0.4)',  tag: 'rgba(14,165,233,0.15)',  glow: 'rgba(14,165,233,0.12)',  text: '#38bdf8' },
  Business:       { border: 'rgba(167,139,250,0.4)', tag: 'rgba(167,139,250,0.15)', glow: 'rgba(167,139,250,0.12)', text: '#c4b5fd' },
  Academic:       { border: 'rgba(34,211,153,0.4)',  tag: 'rgba(34,211,153,0.15)',  glow: 'rgba(34,211,153,0.12)',  text: '#6ee7b7' },
  'Case Studies': { border: 'rgba(251,191,36,0.4)',  tag: 'rgba(251,191,36,0.15)',  glow: 'rgba(251,191,36,0.12)',  text: '#fcd34d' },
  Default:        { border: 'rgba(103,232,249,0.3)', tag: 'rgba(103,232,249,0.12)', glow: 'rgba(103,232,249,0.10)', text: '#67e8f9' },
}

const fallbackGradient: Record<string, string> = {
  Tech:           'linear-gradient(135deg, rgba(14,165,233,0.28), rgba(6,6,22,1) 70%)',
  Business:       'linear-gradient(135deg, rgba(124,58,237,0.32), rgba(6,6,22,1) 70%)',
  Academic:       'linear-gradient(135deg, rgba(16,185,129,0.28), rgba(6,6,22,1) 70%)',
  'Case Studies': 'linear-gradient(135deg, rgba(217,119,6,0.28),  rgba(6,6,22,1) 70%)',
  Default:        'linear-gradient(135deg, rgba(103,232,249,0.20), rgba(6,6,22,1) 70%)',
}

function HeroBanner({ image, title, category }: { image: string; title: string; category: string }) {
  const [imgError, setImgError] = useState(false)
  const cs = categoryStyle[category] ?? categoryStyle.Default
  const fg = fallbackGradient[category] ?? fallbackGradient.Default

  return (
    <div className="relative w-full overflow-hidden rounded-2xl h-[280px] sm:h-[350px] lg:h-[420px]">
      <div className="absolute inset-0" style={{ background: fg }} />
      <div className="absolute inset-0 bg-dot-grid opacity-20" />

      {image && !imgError && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      )}

      {/* Scrim: bottom-heavy so bottom text is legible */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(6,6,22,0.88) 0%, rgba(6,6,22,0.25) 55%, transparent 100%)' }} />

      {(!image || imgError) && (
        <div
          className="absolute inset-0 flex items-center justify-center font-display font-black uppercase select-none pointer-events-none"
          style={{ fontSize: 'clamp(40px, 15vw, 110px)', color: cs.glow, letterSpacing: '-0.04em', opacity: 0.22 }}
        >
          {category}
        </div>
      )}

      <div className="absolute bottom-5 left-6 top-3 flex items-center gap-2 z-10">
        <BookOpen size={13} style={{ color: cs.text, opacity: 1 }} />
        <span className="font-mono text-[11px]" style={{ color: cs.text, opacity: 1 }}>{'// '}{category}</span>
      </div>
    </div>
  )
}

export default function BlogPostClient({ blog, relatedPosts }: { blog: BlogPost; relatedPosts: RelatedPost[] }) {
  const cs = categoryStyle[blog.category] ?? categoryStyle.Default

  return (
    <>
      {/* ─── Hero header ─────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-10 overflow-hidden" style={{ background: 'rgba(6,6,22,0)' }}>
        <div className="absolute inset-0 bg-dot-grid opacity-5" />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-175 h-70 blur-[120px] pointer-events-none"
          style={{ background: cs.glow, opacity: 0.55 }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 font-mono text-xs text-white/35 hover:text-nebula-300 transition-colors mb-2 group"
            >
              <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
              ../blogs
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.05 }}>
            {/* Category badge */}
            <span
              className="font-mono text-[11px] px-3 py-1 rounded mb-2 inline-block font-semibold tracking-wide"
              style={{ background: cs.tag, color: cs.text, border: `1px solid ${cs.border}` }}
            >
              {blog.category}
            </span>

            {/* Title */}
            <h1
              className="font-display font-extrabold text-white leading-tight mb-2"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', letterSpacing: '-0.02em' }}
            >
              {blog.title}
            </h1>

            {/* Excerpt */}
            <p className="text-white/45 text-lg w-4xl leading-relaxed mb-6 ">
              {blog.excerpt}
            </p>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-4 mb-4">
              <div className="flex items-center gap-2.5">
                {blog.author.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={blog.author.avatar}
                    alt={blog.author.name}
                    className="w-9 h-9 rounded-full object-cover border"
                    style={{ borderColor: cs.border }}
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                    style={{ background: `linear-gradient(135deg, ${cs.text}44, ${cs.text}11)`, border: `1px solid ${cs.border}` }}
                  >
                    {blog.author.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="text-white/80 text-sm font-semibold leading-none">{blog.author.name}</div>
                  <div className="font-mono text-[10px] mt-0.5" style={{ color: cs.text + 'aa' }}>{blog.author.role}</div>
                </div>
              </div>
              <span className="h-5 w-px hidden sm:block" />
              <div className="flex items-center gap-5">
                <span className="flex items-center gap-1.5 text-white/35 text-sm font-mono">
                  <User size={12} />
                  {blog.date}
                </span>
                <span className="flex items-center gap-1.5 text-white/35 text-sm font-mono">
                  <Clock size={12} />
                  {blog.readTime}
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[10px] px-2.5 py-1 rounded"
                  style={{ background: 'rgba(103,232,249,0.06)', border: '1px solid rgba(103,232,249,0.14)', color: 'rgba(103,232,249,0.6)' }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Share */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-white/25 text-[10px] font-mono uppercase tracking-widest">{'// share'}</span>
              {[
                { icon: <Twitter size={13} />, href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}` },
                { icon: <Linkedin size={13} />, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://progrex.dev/blogs/${blog.slug}`)}` },
                { icon: <Share2 size={13} />, href: '#' },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 transition-all duration-200"
                  style={{ background: 'rgba(103,232,249,0.05)', border: '1px solid rgba(103,232,249,0.12)' }}
                  onMouseEnter={e => {
                    ;(e.currentTarget as HTMLAnchorElement).style.color = cs.text
                    ;(e.currentTarget as HTMLAnchorElement).style.borderColor = cs.border
                  }}
                  onMouseLeave={e => {
                    ;(e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.30)'
                    ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(103,232,249,0.12)'
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Hero banner image ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 mb-12"
      >
        <HeroBanner image={blog.image} title={blog.title} category={blog.category} />
      </motion.div>

      {/* ─── Article body ────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
          {/* Section divider */}
          <div className="flex items-center gap-4 mb-9">
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${cs.text}33, transparent)` }} />
            <span className="font-mono text-[10px] tracking-widest" style={{ color: cs.text + '60' }}>{'// article_content'}</span>
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, ${cs.text}33, transparent)` }} />
          </div>

          {/* Article prose */}
          <article
            className="prose prose-invert prose-base max-w-none mt-12
              prose-headings:font-extrabold prose-headings:tracking-tight
              prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-5 prose-h2:pb-3 prose-h2:text-white prose-h2:border-b prose-h2:border-white/8
              prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-white/90
              prose-p:text-white/60 prose-p:leading-[1.9]
              prose-strong:text-white prose-strong:font-semibold
              prose-li:text-white/60 prose-li:leading-relaxed prose-li:mb-1.5
              prose-ul:my-5 prose-ul:pl-6
              prose-ol:my-5 prose-ol:pl-6
              prose-a:no-underline prose-a:font-medium"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(blog.content) }}
          />

          {/* Bottom tag row */}
          <div className="mt-12 pt-2  flex flex-wrap gap-2 items-center">
            <span className="font-mono text-[10px] text-white/25 mr-2">{'// tags'}</span>
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[10px] px-2.5 py-1 rounded"
                style={{ background: cs.tag, color: cs.text, border: `1px solid ${cs.border}` }}
              >
                {tag}
              </span>
            ))}
          </div>
          </motion.div>

          {/* ─── Author card ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-6 rounded-2xl p-6 flex items-center gap-5"
            style={{
              background: 'rgba(12,12,32,0.9)',
              border: `1px solid ${cs.border}`,
              boxShadow: `0 0 0 1px ${cs.glow}, 0 8px 40px rgba(0,0,0,0.4)`,
            }}
          >
            {blog.author.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={blog.author.avatar}
                alt={blog.author.name}
                className="w-14 h-14 rounded-full object-cover border-2 shrink-0"
                style={{ borderColor: cs.border }}
              />
            ) : (
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0"
                style={{ background: `linear-gradient(135deg, ${cs.text}44, ${cs.text}11)`, border: `2px solid ${cs.border}` }}
              >
                {blog.author.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="font-bold text-white text-base mb-0.5">{blog.author.name}</div>
              <div className="font-mono text-xs mb-2" style={{ color: cs.text }}>{blog.author.role}</div>
              <div className="text-white/35 text-xs leading-relaxed">
                Expert contributor at PROGREX. Building and writing about technology that drives real business results.
              </div>
            </div>
          </motion.div>
      </div>

      {/* ─── Related posts ───────────────────────────────────────────── */}
      {relatedPosts.length > 0 && (
        <SectionWrapper
          className="bg-section-b"
          decoration={<ConstellationDecor name="leo" side="right" offsetY="15%" />}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${cs.text}33, transparent)` }} />
            <span className="font-mono text-[11px] tracking-widest uppercase" style={{ color: cs.text + '70' }}>
              {'// related_articles'}
            </span>
            <div className="h-px flex-1" style={{ background: `linear-gradient(to left, ${cs.text}33, transparent)` }} />
          </div>

          <div className={`grid gap-5 ${relatedPosts.length === 1 ? 'grid-cols-1 max-w-lg' : 'grid-cols-1 md:grid-cols-2'}`}>
            {relatedPosts.map((post, i) => (
              <BlogCard
                key={post.slug}
                title={post.title}
                category={post.category}
                author={post.author}
                date={post.date}
                readTime={post.readTime}
                excerpt={post.excerpt}
                slug={post.slug}
                tags={post.tags}
                image={post.image}
                index={i}
              />
            ))}
          </div>
        </SectionWrapper>
      )}

      <CTASection
        title="Enjoyed the Article?"
        subtitle="See how PROGREX puts these ideas into practice — for your business."
        primaryBtn={{ label: 'Work With Us', href: '/contact' }}
        secondaryBtn={{ label: 'More Articles', href: '/blogs' }}
      />
    </>
  )
}

// Minimal markdown renderer
const P_STYLE = 'style="text-align:justify;text-indent:2em;margin-bottom:2rem;line-height:1.9;"'

function renderMarkdown(content: string): string {
  const blocks = content.trim().split(/\n{2,}/)
  return blocks
    .map((block) => {
      const b = block.trim()
      if (!b) return ''
      // Apply inline formatting everywhere
      const inline = b.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      if (/^## (.+)/.test(b))  return `<h2>${b.replace(/^## /, '')}</h2>`
      if (/^### (.+)/.test(b)) return `<h3>${b.replace(/^### /, '')}</h3>`
      // Bullet list block
      if (/^- /.test(b)) {
        const items = inline.split('\n').map(l => l.replace(/^- /, '').trim()).filter(Boolean)
        return `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`
      }
      return `<p ${P_STYLE}>${inline.replace(/\n/g, ' ')}</p>`
    })
    .filter(Boolean)
    .join('')
}
