'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Clock, User, ArrowLeft, Share2, Twitter, Linkedin } from 'lucide-react'
import BlogCard from '@/components/BlogCard'
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
}

export default function BlogPostClient({ blog, relatedPosts }: { blog: BlogPost; relatedPosts: RelatedPost[] }) {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden bg-[#050510]">
        <div className="absolute inset-0 bg-dot-grid opacity-15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-nebula-700/10 rounded-full blur-[100px]" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Link href="/blogs" className="inline-flex items-center gap-2 text-white/40 hover:text-nebula-300 text-sm mb-6 transition-colors font-mono">
              <ArrowLeft size={15} />
              ../blogs
            </Link>

            <span className="font-mono text-xs px-3 py-1 border border-nebula-500/40 text-nebula-300 bg-nebula-400/10 mb-4 inline-block">
              [{blog.category}]
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-tight">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-5 text-sm text-slate-400 mb-6">
              <span className="flex items-center gap-1.5">
                <User size={14} />
                {blog.author.name} — {blog.author.role}
              </span>
              <span>{blog.date}</span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {blog.readTime}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {blog.tags.map((tag) => (
                <span key={tag} className="font-mono text-xs px-2.5 py-1 border border-nebula-700/20 text-nebula-400/70 bg-nebula-400/5">
                  [{tag}]
                </span>
              ))}
            </div>

            {/* Share */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 uppercase tracking-wide">Share:</span>
              <a href="#" className="w-8 h-8 rounded-lg glass border border-nebula-700/20 flex items-center justify-center text-white/40 hover:text-nebula-300 transition-colors">
                <Twitter size={14} />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg glass border border-nebula-700/20 flex items-center justify-center text-white/40 hover:text-nebula-300 transition-colors">
                <Linkedin size={14} />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg glass border border-nebula-700/20 flex items-center justify-center text-white/40 hover:text-nebula-300 transition-colors">
                <Share2 size={14} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hero image placeholder */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-4 mb-8">
        <div className="h-64 rounded-2xl bg-space-800 border border-nebula-700/20 flex items-center justify-center overflow-hidden relative">
          <div className="absolute inset-0 bg-dot-grid opacity-20" />
          <div className="text-white/20 text-sm font-mono relative">// {blog.title}</div>
        </div>
      </div>

      {/* Article content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card rounded-2xl p-8 sm:p-10 prose prose-invert prose-sm max-w-none
            prose-headings:text-white prose-headings:font-extrabold
            prose-h2:text-xl prose-h2:text-gradient-nebula prose-h2:mt-8 prose-h2:mb-3
            prose-p:text-white/55 prose-p:leading-relaxed
            prose-strong:text-nebula-300
            prose-li:text-white/55
            prose-a:text-nebula-500 prose-a:no-underline hover:prose-a:text-nebula-300"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(blog.content) }}
        />

        {/* Author card */}
        <div className="glass-card rounded-2xl p-6 mt-8 border border-nebula-700/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-nebula-700 to-aurora-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {blog.author.name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-white">{blog.author.name}</div>
            <div className="text-nebula-300/80 text-xs font-mono mb-1">{blog.author.role}</div>
            <div className="text-slate-500 text-xs">Expert contributor at PROGREX. Building and writing about technology that drives business success.</div>
          </div>
        </div>
      </div>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <SectionWrapper className="bg-[#030308]">
          <div className="font-mono text-xs text-nebula-400/60 uppercase tracking-widest mb-6">// related_articles</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
function renderMarkdown(content: string): string {
  return content
    .trim()
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]+?<\/li>)/g, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])/gm, '')
    .replace(/^<\/p><p>(<[hul])/gm, '$1')
    .split('\n')
    .map((line) => {
      if (line.match(/^<[h123ul]/)) return line
      if (line.trim() === '') return ''
      return `<p>${line}</p>`
    })
    .filter(Boolean)
    .join('')
}
