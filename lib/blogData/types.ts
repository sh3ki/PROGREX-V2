// ─── BLOG POST TYPE ──────────────────────────────────────────────────────────
export interface BlogPost {
  id: string
  slug: string
  title: string
  category: string
  author: { name: string; role: string; avatar: string }
  date: string
  readTime: string
  image: string
  excerpt: string
  tags: string[]
  content: string
  relatedPosts: string[]
  metaTitle: string
  metaDescription: string
  keywords: string[]
}

// ─── AUTHORS ─────────────────────────────────────────────────────────────────
export const AUTHORS = {
  SHEKAINAH: {
    name: 'Jedidia Shekainah Garcia',
    role: 'Founder & CEO, PROGREX',
    avatar: 'https://res.cloudinary.com/dlu2bqrda/image/upload/v1772372755/2e322f09-b81b-4794-a43c-8b35eff1003b_qqozqs.jpg',
  },
  LEE: {
    name: 'Lee Rafael Torres',
    role: 'Co-Founder & CTO, PROGREX',
    avatar: 'https://res.cloudinary.com/dlu2bqrda/image/upload/v1772373187/Lee-formatpic_sprpmg.png',
  },
  BHEBERLYN: {
    name: 'Bheberlyn O. Eugenio',
    role: 'Project Manager, PROGREX',
    avatar: 'https://res.cloudinary.com/dlu2bqrda/image/upload/v1772377390/berlyn_ykjlnw.png',
  },
} as const
