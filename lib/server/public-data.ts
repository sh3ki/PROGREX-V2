import { unstable_cache } from 'next/cache'
import { sqlPublic as sql } from './db'

// ─── Cache tags ────────────────────────────────────────────────────────────────
// Import CACHE_TAGS in admin mutation routes to call revalidateTag() and
// instantly bust the right cache when content is saved/updated/deleted.
export const CACHE_TAGS = {
  projects:     'public-projects',
  team:         'public-team',
  blogs:        'public-blogs',    // also busted when teams change (blogs join team_members)
  systems:      'public-systems',
  services:     'public-services',
  testimonials: 'public-testimonials',
  faqs:         'public-faqs',
} as const

// Safety-net TTL: if a mutation handler forgets to revalidate, cache auto-expires after 1 hour.
const REVALIDATE_SECONDS = 3600

type SystemPricingPlan = {
  plan: string
  price: string
  type: string
  support: string
  students?: string
  users?: string
  employees?: string
}

function normalizePricing(input: unknown): SystemPricingPlan[] {
  if (!Array.isArray(input)) return []

  return input
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      plan: String(item.plan ?? ''),
      price: String(item.price ?? ''),
      type: String(item.type ?? ''),
      support: String(item.support ?? ''),
      students: item.students ? String(item.students) : undefined,
      users: item.users ? String(item.users) : undefined,
      employees: item.employees ? String(item.employees) : undefined,
    }))
}

export type PublicProject = {
  id: string
  slug: string
  title: string
  systemType: string
  category: string[]
  industry: string
  tags: string[]
  image: string
  shortDesc: string
  details: Record<string, unknown>
  isFeatured: boolean
  featureOrder: number
}

// ─── Projects ──────────────────────────────────────────────────────────────────
const _fetchPublicProjects = unstable_cache(
  async (): Promise<PublicProject[]> => {
    const rows = await sql<{
      id: string
      slug: string
      title: string
      system_type: string
      categories: string[]
      industry: string
      tags: string[]
      image: string
      short_desc: string
      details: Record<string, unknown>
      is_featured: boolean
      feature_order: number
    }>(
      `select id, slug, title, system_type, categories, industry, tags, image, short_desc, details, is_featured, feature_order
       from projects
       where is_published = true
       order by
         case
           when (details ->> 'positionOrder') ~ '^\\d+$' then (details ->> 'positionOrder')::int
           else 999999
         end asc,
         created_at desc`
    )
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      systemType: r.system_type,
      category: r.categories,
      industry: r.industry,
      tags: r.tags,
      image: r.image,
      shortDesc: r.short_desc,
      details: r.details ?? {},
      isFeatured: r.is_featured,
      featureOrder: r.feature_order,
    }))
  },
  ['public-projects'],
  { tags: [CACHE_TAGS.projects], revalidate: REVALIDATE_SECONDS }
)

export async function getPublicProjects(): Promise<PublicProject[]> {
  return _fetchPublicProjects()
}

export async function getProjectBySlug(slug: string): Promise<PublicProject | null> {
  const projects = await _fetchPublicProjects()
  return projects.find((p) => p.slug === slug) ?? null
}

export async function getFeaturedProjects(): Promise<PublicProject[]> {
  const rows = await _fetchPublicProjects()
  return rows
    .filter((p) => p.isFeatured)
    .sort((a, b) => a.featureOrder - b.featureOrder)
}

// ─── Team ──────────────────────────────────────────────────────────────────────
const _fetchPublicTeam = unstable_cache(
  async () => {
    const rows = await sql<{
      id: string
      name: string
      role: string
      bio: string
      avatar: string
      email: string
      portfolio: string
    }>(
      `select id, name, role, bio, avatar, email, portfolio
       from team_members
       where is_active = true
       order by sort_order asc, created_at asc`
    )
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      role: r.role,
      bio: r.bio,
      avatar: r.avatar,
      email: r.email,
      portfolio: r.portfolio,
    }))
  },
  ['public-team'],
  { tags: [CACHE_TAGS.team], revalidate: REVALIDATE_SECONDS }
)

export async function getPublicTeam() {
  return _fetchPublicTeam()
}

// ─── Blogs ─────────────────────────────────────────────────────────────────────
const _fetchPublicBlogs = unstable_cache(
  async () => {
    const rows = await sql<{
      id: string
      slug: string
      title: string
      category: string
      team_member_id: string | null
      author_name: string
      author_role: string
      author_avatar: string
      published_at: string
      read_time: string
      image: string
      excerpt: string
      tags: string[]
      content: string
      related_posts: string[]
      meta_title: string
      meta_description: string
      keywords: string[]
    }>(
      `select b.id, b.slug, b.title, b.category, b.team_member_id,
              coalesce(tm.name, b.author_name) as author_name,
              coalesce(tm.role, b.author_role) as author_role,
              coalesce(tm.avatar, b.author_avatar) as author_avatar,
              b.published_at, b.read_time, b.image, b.excerpt, b.tags,
              b.content, b.related_posts, b.meta_title, b.meta_description, b.keywords
       from blogs b
       left join team_members tm on tm.id = b.team_member_id
       where b.is_published = true
       order by b.created_at desc`
    )
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      category: r.category,
      author: {
        name: r.author_name,
        role: r.author_role,
        avatar: r.author_avatar,
      },
      date: r.published_at,
      readTime: r.read_time,
      image: r.image,
      excerpt: r.excerpt,
      tags: r.tags,
      content: r.content,
      relatedPosts: r.related_posts,
      metaTitle: r.meta_title,
      metaDescription: r.meta_description,
      keywords: r.keywords,
    }))
  },
  ['public-blogs'],
  { tags: [CACHE_TAGS.blogs], revalidate: REVALIDATE_SECONDS }
)

export async function getPublicBlogs() {
  return _fetchPublicBlogs()
}

export async function getBlogBySlug(slug: string) {
  const blogs = await _fetchPublicBlogs()
  return blogs.find((b) => b.slug === slug) ?? null
}

// ─── Ready-made systems ────────────────────────────────────────────────────────
const _fetchPublicSystems = unstable_cache(
  async () => {
    const rows = await sql<{
      id: string
      slug: string
      category: string
      industry: string
      name: string
      tagline: string
      short_desc: string
      image: string
      has_demo: boolean
      details: Record<string, unknown>
    }>(
      `select id, slug, category, industry, name, tagline, short_desc, image, has_demo, details
       from ready_made_systems
       where is_published = true
       order by sort_order asc, created_at asc`
    )
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      category: r.category,
      industry: r.industry,
      name: r.name,
      tagline: r.tagline,
      shortDesc: r.short_desc,
      image: r.image,
      hasDemo: r.has_demo,
      features: (r.details?.features as string[]) ?? [],
      faqs: (r.details?.faqs as { q: string; a: string }[]) ?? [],
      pricing: normalizePricing(r.details?.pricing),
      screenshots: (r.details?.screenshots as string[]) ?? [],
    }))
  },
  ['public-systems'],
  { tags: [CACHE_TAGS.systems], revalidate: REVALIDATE_SECONDS }
)

export async function getPublicSystems() {
  return _fetchPublicSystems()
}

type ServiceProcessStep = { step: number; title: string; desc: string }
type ServiceCard = { title: string; desc: string }
type ServiceHighlight = { icon: string; label: string; desc: string }
type ServiceFaq = { q: string; a: string }

export type PublicService = {
  id: string
  slug: string
  title: string
  shortDesc: string
  description: string
  icon: string
  color: string
  process: ServiceProcessStep[]
  technologies: string[]
  deliverables: string[]
  idealFor: ServiceCard[]
  highlights: ServiceHighlight[]
  faqs: ServiceFaq[]
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((item) => String(item))
}

function asProcessArray(value: unknown): ServiceProcessStep[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item, index) => ({
      step: Number(item.step ?? index + 1),
      title: String(item.title ?? ''),
      desc: String(item.desc ?? ''),
    }))
}

function asCardArray(value: unknown): ServiceCard[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      title: String(item.title ?? ''),
      desc: String(item.desc ?? ''),
    }))
}

function asHighlightArray(value: unknown): ServiceHighlight[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      icon: String(item.icon ?? 'CheckCircle'),
      label: String(item.label ?? ''),
      desc: String(item.desc ?? ''),
    }))
}

function asFaqArray(value: unknown): ServiceFaq[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      q: String(item.q ?? ''),
      a: String(item.a ?? ''),
    }))
}

// ─── Services ──────────────────────────────────────────────────────────────────
const _fetchPublicServices = unstable_cache(
  async (): Promise<PublicService[]> => {
    const rows = await sql<{
      id: string
      slug: string
      title: string
      short_desc: string
      icon: string
      color: string
      details: Record<string, unknown>
    }>(
      `select id, slug, title, short_desc, icon, color, details
       from services
       where is_published = true
       order by sort_order asc, created_at asc`
    )
    return rows.map((r) => {
      const details = r.details ?? {}
      return {
        id: r.id,
        slug: r.slug,
        title: r.title,
        shortDesc: r.short_desc,
        description: String(details.description ?? r.short_desc ?? ''),
        icon: r.icon,
        color: r.color,
        process: asProcessArray(details.process),
        technologies: asStringArray(details.technologies),
        deliverables: asStringArray(details.deliverables),
        idealFor: asCardArray(details.idealFor),
        highlights: asHighlightArray(details.highlights),
        faqs: asFaqArray(details.faqs),
      }
    })
  },
  ['public-services'],
  { tags: [CACHE_TAGS.services], revalidate: REVALIDATE_SECONDS }
)

export async function getPublicServices(): Promise<PublicService[]> {
  return _fetchPublicServices()
}

export async function getServiceBySlug(slug: string) {
  const services = await _fetchPublicServices()
  return services.find((s) => s.slug === slug) ?? null
}

// ─── Testimonials ──────────────────────────────────────────────────────────────
const _fetchHomeTestimonials = unstable_cache(
  async () => {
    return sql<{
      id: string
      name: string
      role: string
      avatar: string
      quote: string
      rating: number
      company: string
    }>(
      `select id, name, role, avatar, quote, rating, company
       from testimonials
       where is_published = true
       order by sort_order asc, created_at asc`
    )
  },
  ['public-testimonials'],
  { tags: [CACHE_TAGS.testimonials], revalidate: REVALIDATE_SECONDS }
)

export async function getHomeTestimonials() {
  return _fetchHomeTestimonials()
}

// ─── FAQs ──────────────────────────────────────────────────────────────────────
const _fetchHomeFaqs = unstable_cache(
  async () => {
    return sql<{
      id: string
      question: string
      answer: string
    }>(
      `select id, question, answer
       from site_faqs
       where is_published = true
       order by sort_order asc, created_at asc`
    )
  },
  ['public-faqs'],
  { tags: [CACHE_TAGS.faqs], revalidate: REVALIDATE_SECONDS }
)

export async function getHomeFaqs() {
  return _fetchHomeFaqs()
}
