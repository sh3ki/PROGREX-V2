'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { BlogPost } from '@/lib/blogData'
import Hero from '@/components/Hero'
import BlogCard from '@/components/BlogCard'
import CTASection from '@/components/CTASection'
import ConstellationDecor from '@/components/ConstellationDecor'
import SectionWrapper, { SectionHeader } from '@/components/SectionWrapper'
import { blogs, blogCategories } from '@/lib/mockData'
import { useTranslation } from '@/components/TranslationProvider'

// Sort blogs latest → oldest
function parseBlogDate(dateStr: string): number {
  return new Date(dateStr).getTime() || 0
}

const sortedBlogs = [...blogs].sort((a, b) => parseBlogDate(b.date) - parseBlogDate(a.date))

export default function BlogsClient() {
  const { t, translations } = useTranslation()
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const dragMoved = useRef(0)

  // Native drag-to-scroll (passive:false lets preventDefault work)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    let isDown = false
    let startX = 0
    let scrollStart = 0
    let moved = 0

    const onMouseDown = (e: MouseEvent) => {
      isDown = true
      moved = 0
      dragMoved.current = 0
      startX = e.clientX
      scrollStart = el.scrollLeft
      el.style.cursor = 'grabbing'
      e.preventDefault()
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return
      e.preventDefault()
      const delta = startX - e.clientX
      moved = Math.abs(delta)
      dragMoved.current = moved
      el.scrollLeft = scrollStart + delta
    }

    const onMouseUp = () => {
      isDown = false
      el.style.cursor = 'grab'
      // keep dragMoved alive briefly so the click event (which fires right after mouseup) can read it
      setTimeout(() => { dragMoved.current = 0 }, 100)
    }

    // Vertical wheel → horizontal scroll
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return
      e.preventDefault()
      el.scrollLeft += e.deltaY * 1.5
    }

    // Block link/card clicks if the user was dragging
    const onClickCapture = (e: MouseEvent) => {
      if (dragMoved.current > 6) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    el.addEventListener('mousedown', onMouseDown, { passive: false })
    window.addEventListener('mousemove', onMouseMove, { passive: false })
    window.addEventListener('mouseup', onMouseUp)
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('click', onClickCapture, true)

    return () => {
      el.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('click', onClickCapture, true)
    }
  }, [])

  const filtered = sortedBlogs.filter((b) => {
    const matchCat = activeCategory === 'All' || b.category === activeCategory
    const matchSearch = (() => {
      const q = search.trim()
      if (!q) return true
      // Split into tokens → every token must match (AND logic)
      const tokens = q.toLowerCase().split(/\s+/).filter(Boolean)
      // Haystack: all searchable fields joined
      const haystack = [
        b.title,
        b.excerpt,
        b.category,
        b.tags.join(' '),
        b.keywords.join(' '),
      ].join(' ').toLowerCase()
      // Each token is tested as a substring — so "rea" matches "react", "node" matches "nodejs"
      // All tokens must hit somewhere in the haystack (multi-word AND)
      return tokens.every((token) => haystack.includes(token))
    })()
    return matchCat && matchSearch
  })

  const featured = filtered[0]
  const rest = filtered.slice(1)

  const scrollBy = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'right' ? 340 : -340, behavior: 'smooth' })
  }

  return (
    <>
      <Hero
        badge={t('blogs.heroBadge')}
        title={t('blogs.heroTitle')}
        highlight={t('blogs.heroHighlight')}
        subtitle={t('blogs.heroSubtitle')}
        primaryBtn={{ label: t('blogs.heroPrimaryBtn'), href: '/contact' }}
      />

      <SectionWrapper className="bg-section-a" decoration={<ConstellationDecor name="cassiopeia" side="left" offsetY="15%" />}>
        <SectionHeader
          badge={t('blogs.listingBadge')}
          title={t('blogs.listingTitle')}
          highlight={t('blogs.listingHighlight')}
        />

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-nebula-500 text-sm select-none">{'>'}</span>
            <input
              type="text"
              placeholder={t('blogs.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 rounded-none border-0 border-b border-nebula-600/30 bg-transparent text-white/80 text-sm font-mono placeholder-nebula-600/50 focus:outline-none focus:border-nebula-400/60 transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {blogCategories.map((cat, catIdx) => {
              const tCat = (translations.blogs.categories as unknown as string[])[catIdx] ?? cat
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`font-mono text-xs px-3 py-1.5 border transition-all duration-200 ${
                    activeCategory === cat
                      ? 'border-nebula-400/60 text-nebula-300 bg-nebula-400/10'
                      : 'border-white/10 text-white/40 hover:border-nebula-600/40 hover:text-white/70'
                  }`}
                >
                  [{tCat}]
                </button>
              )
            })}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">{t('blogs.emptyState')}</div>
        ) : (
          <>
            {/* Featured post */}
            {featured && (
              <div className="mb-8">
                <div className="font-mono text-xs text-nebula-400 mb-3">{t('blogs.featured')}</div>
                <BlogCard
                  title={featured.title}
                  category={featured.category}
                  author={featured.author}
                  date={featured.date}
                  readTime={featured.readTime}
                  excerpt={featured.excerpt}
                  slug={featured.slug}
                  tags={featured.tags}
                  image={(featured as BlogPost).image}
                  featured
                />
              </div>
            )}

            {/* Horizontal draggable strip */}
            {rest.length > 0 && (
              <div>
                {/* Header row with nav buttons */}
                <div className="flex items-center justify-between mb-5">
                  <div className="font-mono text-xs text-white/30 uppercase tracking-wider">{`// more_articles (${rest.length})`}</div>
                  <div className="flex gap-3">
                    <motion.button
                      onClick={() => scrollBy('left')}
                      whileHover={{ scale: 1.1, background: 'rgba(14,165,233,0.18)', borderColor: 'rgba(14,165,233,0.6)' }}
                      whileTap={{ scale: 0.93 }}
                      aria-label="Scroll left"
                      className="flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200"
                      style={{
                        background: 'rgba(103,232,249,0.06)',
                        border: '1px solid rgba(103,232,249,0.22)',
                        color: 'rgba(103,232,249,0.7)',
                      }}
                    >
                      <ChevronLeft size={18} />
                    </motion.button>
                    <motion.button
                      onClick={() => scrollBy('right')}
                      whileHover={{ scale: 1.1, background: 'rgba(14,165,233,0.18)', borderColor: 'rgba(14,165,233,0.6)' }}
                      whileTap={{ scale: 0.93 }}
                      aria-label="Scroll right"
                      className="flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200"
                      style={{
                        background: 'rgba(103,232,249,0.06)',
                        border: '1px solid rgba(103,232,249,0.22)',
                        color: 'rgba(103,232,249,0.7)',
                      }}
                    >
                      <ChevronRight size={18} />
                    </motion.button>
                  </div>
                </div>

                {/* Scrollable + draggable container */}
                <div
                  ref={scrollRef}
                  className="flex gap-5 overflow-x-auto select-none"
                  style={{
                    cursor: 'grab',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    touchAction: 'pan-y',
                    paddingBottom: '4px',
                  } as React.CSSProperties}
                >
                  {rest.map((blog, i) => (
                    <div
                      key={blog.id}
                      className="shrink-0 w-[280px] sm:w-80"
                    >
                      <BlogCard
                        title={blog.title}
                        category={blog.category}
                        author={blog.author}
                        date={blog.date}
                        readTime={blog.readTime}
                        excerpt={blog.excerpt}
                        slug={blog.slug}
                        tags={blog.tags}
                        image={(blog as BlogPost).image}
                        index={i}
                      />
                    </div>
                  ))}
                </div>

                <p className="text-center font-mono text-[10px] text-white/18 mt-4 tracking-widest select-none">
                  {t('blogs.dragHint')}
                </p>
              </div>
            )}
          </>
        )}
      </SectionWrapper>

      <CTASection
        title={t('blogs.ctaTitle')}
        subtitle={t('blogs.ctaSubtitle')}
        primaryBtn={{ label: t('blogs.ctaPrimaryBtn'), href: '/contact' }}
        secondaryBtn={{ label: t('blogs.ctaSecondaryBtn'), href: '/services' }}
      />
    </>
  )
}