// ─── BLOG DATA INDEX ─────────────────────────────────────────────────────────
// Combines all blog batches into a single export (59 blogs: Jan 1 – Feb 28, 2025)

export type { BlogPost } from './types'
export { AUTHORS } from './types'

import { blogsBatch1 } from './blogs-jan-01-10'
import { blogsBatch2 } from './blogs-jan-11-20'
import { blogsBatch3 } from './blogs-jan-21-31'
import { blogsBatch4 } from './blogs-feb-01-10'
import { blogsBatch5 } from './blogs-feb-11-20'
import { blogsBatch6 } from './blogs-feb-21-28'

export const allBlogs = [
  ...blogsBatch1,
  ...blogsBatch2,
  ...blogsBatch3,
  ...blogsBatch4,
  ...blogsBatch5,
  ...blogsBatch6,
]

// Re-export individual batches for direct access if needed
export { blogsBatch1, blogsBatch2, blogsBatch3, blogsBatch4, blogsBatch5, blogsBatch6 }
