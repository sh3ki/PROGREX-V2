'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Hero from '@/components/Hero'
import BlogCard from '@/components/BlogCard'
import CTASection from '@/components/CTASection'
import ConstellationDecor from '@/components/ConstellationDecor'
import SectionWrapper, { SectionHeader } from '@/components/SectionWrapper'
import { blogs, blogCategories } from '@/lib/mockData'

export default function BlogsClient() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = blogs.filter((b) => {
    const matchCat = activeCategory === 'All' || b.category === activeCategory
    const matchSearch =
      !search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.excerpt.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const featured = filtered[0]
  const rest = filtered.slice(1)

  return (
    <>
      <Hero
        badge="Insights & Knowledge"
        title="Tech Insights From the"
        highlight="PROGREX Team"
        subtitle="Engineering best practices, business technology strategies, and deep dives from our team of experts."
        primaryBtn={{ label: 'Work With Us', href: '/contact' }}
      />

      <SectionWrapper className="bg-section-a" decoration={<ConstellationDecor name="cassiopeia" side="left" offsetY="15%" />}>
        <SectionHeader
          badge="Latest Articles"
          title="Our"
          highlight="Blog"
        />

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-nebula-500 text-sm select-none">{'>'}</span>
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 rounded-none border-0 border-b border-nebula-600/30 bg-transparent text-white/80 text-sm font-mono placeholder-nebula-600/50 focus:outline-none focus:border-nebula-400/60 transition-colors"
            />
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {blogCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-mono text-xs px-3 py-1.5 border transition-all duration-200 ${
                  activeCategory === cat
                    ? 'border-nebula-400/60 text-nebula-300 bg-nebula-400/10'
                    : 'border-white/10 text-white/40 hover:border-nebula-600/40 hover:text-white/70'
                }`}
              >
                [{cat}]
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">No articles found. Try a different search or category.</div>
        ) : (
          <>
            {/* Featured post */}
            {featured && (
              <div className="mb-8">
                <div className="font-mono text-xs text-nebula-400 mb-3">// FEATURED_ARTICLE</div>
                <BlogCard
                  title={featured.title}
                  category={featured.category}
                  author={featured.author}
                  date={featured.date}
                  readTime={featured.readTime}
                  excerpt={featured.excerpt}
                  slug={featured.slug}
                  tags={featured.tags}
                  featured
                />
              </div>
            )}

            {/* Blog grid */}
            {rest.length > 0 && (
              <>
                <div className="font-mono text-xs text-white/30 uppercase tracking-wider mb-4">// more_articles</div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {rest.map((blog, i) => (
                    <motion.div
                      key={blog.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
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
                        index={i}
                      />
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </SectionWrapper>

      <CTASection
        title="Have a Project to Discuss?"
        subtitle="Our blog shares what we know. Our team delivers what you need. Let's start a conversation."
        primaryBtn={{ label: 'Contact Us', href: '/contact' }}
        secondaryBtn={{ label: 'Our Services', href: '/services' }}
      />
    </>
  )
}