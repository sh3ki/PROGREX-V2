'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import Hero from '@/components/Hero'
import BlogCard from '@/components/BlogCard'
import CTASection from '@/components/CTASection'
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
      {/* â”€â”€ HERO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Hero
        badge="Insights & Knowledge"
        title="Tech Insights From the"
        highlight="PROGREX Team"
        subtitle="Engineering best practices, business technology strategies, and deep dives from our team of experts."
        primaryBtn={{ label: 'Subscribe for Updates', href: '/contact' }}
      />

      {/* â”€â”€ BLOG â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="bg-[#0D0F12] border-t border-[#1F2530]">
        <div className="max-w-350 mx-auto px-6 lg:px-10 py-24">

          {/* Header */}
          <div className="mb-12">
            <span className="label text-[#1B6FFF] mb-3 block">LATEST ARTICLES</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-[#EEF0F3] tracking-[-0.035em] leading-[1.1]">
              Our Blog
            </h2>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10 pb-6 border-b border-[#1F2530]">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4E5A6E]" />
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#111417] border border-[#1F2530] text-[#EEF0F3] text-sm placeholder-[#4E5A6E] focus:outline-none focus:border-[#1B6FFF]/60 transition-colors"
              />
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-2">
              {blogCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 text-xs font-mono tracking-[0.08em] uppercase transition-all duration-200 ${
                    activeCategory === cat
                      ? 'bg-[#1B6FFF] text-white'
                      : 'border border-[#1F2530] text-[#8892A4] hover:border-[#1B6FFF]/40 hover:text-[#EEF0F3]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 font-mono text-[11px] text-[#4E5A6E] tracking-[0.14em] uppercase">
              No articles found. Try a different search or category.
            </div>
          ) : (
            <>
              {/* Featured post */}
              {featured && (
                <div className="mb-10">
                  <span className="label text-[#1B6FFF] mb-4 block">FEATURED ARTICLE</span>
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
                  <span className="label text-[#4E5A6E] mb-6 block">MORE ARTICLES</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {rest.map((blog, i) => (
                      <motion.div
                        key={blog.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
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
        </div>
      </section>

      {/* â”€â”€ CTA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <CTASection
        title="Have a Project to Discuss?"
        subtitle="Our blog shares what we know. Our team delivers what you need. Let's start a conversation."
        primaryBtn={{ label: 'Contact Us', href: '/contact' }}
        secondaryBtn={{ label: 'Our Services', href: '/services' }}
      />
    </>
  )
}
