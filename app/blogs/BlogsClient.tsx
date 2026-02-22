'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import Hero from '@/components/Hero'
import BlogCard from '@/components/BlogCard'
import CTASection from '@/components/CTASection'
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
        primaryBtn={{ label: 'Subscribe for Updates', href: '/contact' }}
      />

      <SectionWrapper className="bg-[#050510]">
        <SectionHeader
          badge="Latest Articles"
          title="Our"
          highlight="Blog"
        />

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl glass border border-[#560BAD]/20 bg-transparent text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-[#831DC6]/60 transition-colors"
            />
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {blogCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-[#560BAD] to-[#4361EE] text-white shadow-[0_0_12px_rgba(86,11,173,0.4)]'
                    : 'glass border border-[#560BAD]/20 text-slate-300 hover:border-[#560BAD]/60 hover:text-white'
                }`}
              >
                {cat}
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
                <div className="text-xs font-semibold text-[#CFA3EA] uppercase tracking-wider mb-3">⭐ Featured Article</div>
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
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">More Articles</div>
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