import { sql } from './db'

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

export async function getPublicProjects(): Promise<PublicProject[]> {
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
     order by created_at desc`
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
}

export async function getProjectBySlug(slug: string): Promise<PublicProject | null> {
  const projects = await getPublicProjects()
  return projects.find((p) => p.slug === slug) ?? null
}

export async function getFeaturedProjects(limit = 13): Promise<PublicProject[]> {
  const rows = await getPublicProjects()
  return rows
    .filter((p) => p.isFeatured)
    .sort((a, b) => a.featureOrder - b.featureOrder)
    .slice(0, limit)
}

export async function getPublicTeam() {
  const rows = await sql<{
    id: string
    name: string
    role: string
    bio: string
    avatar: string
    linkedin: string
    github: string
    portfolio: string
  }>(
    `select id, name, role, bio, avatar, linkedin, github, portfolio
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
    linkedin: r.linkedin,
    github: r.github,
    portfolio: r.portfolio,
  }))
}

export async function getPublicBlogs() {
  const rows = await sql<{
    id: string
    slug: string
    title: string
    category: string
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
    `select id, slug, title, category, author_name, author_role, author_avatar, published_at, read_time, image, excerpt, tags, content, related_posts, meta_title, meta_description, keywords
     from blogs
     where is_published = true
     order by created_at desc`
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
}

export async function getBlogBySlug(slug: string) {
  const blogs = await getPublicBlogs()
  return blogs.find((b) => b.slug === slug) ?? null
}

export async function getPublicSystems() {
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

export async function getPublicServices(): Promise<PublicService[]> {
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
}

export async function getServiceBySlug(slug: string) {
  const services = await getPublicServices()
  return services.find((s) => s.slug === slug) ?? null
}

export async function getHomeTestimonials() {
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
}

export async function getHomeFaqs() {
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
}
