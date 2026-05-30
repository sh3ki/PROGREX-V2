/**
 * lib/server/dbSeed.ts
 *
 * One-time data seeder — called at the end of the DDL initialisation phase.
 * Seeds permissions, roles, admin user, and all public content ONLY when
 * the `services` table is empty (i.e. a fresh database).
 * Uses ON CONFLICT DO NOTHING so it is completely idempotent if re-run.
 */

import { hashSync } from 'bcryptjs'
import { sql } from './db'
import { ADMIN_PERMISSION_KEYS, ADMIN_PERMISSION_LABELS } from './permissions'
import { services, systems, testimonials, team, faqs, projects, blogs } from '../mockData'

function normalizeCategories(category: unknown): string[] {
  if (Array.isArray(category)) return category.map(String)
  if (typeof category === 'string') return [category]
  return []
}

export async function seedIfEmpty(): Promise<void> {
  // Guard: skip if any service rows already exist
  const [{ count }] = await sql<{ count: string }>(
    'SELECT count(*)::text AS count FROM services'
  )
  if (parseInt(count, 10) > 0) return

  // ── permissions ───────────────────────────────────────────────────────────────
  for (const key of ADMIN_PERMISSION_KEYS) {
    await sql(
      `INSERT INTO permissions(key, label) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET label = EXCLUDED.label`,
      [key, ADMIN_PERMISSION_LABELS[key]]
    )
  }

  // ── roles ─────────────────────────────────────────────────────────────────────
  const [{ id: superAdminRoleId }] = await sql<{ id: string }>(
    `INSERT INTO roles(name, description, is_system)
     VALUES ('Super Admin', 'Full platform control with user management', true)
     ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
     RETURNING id`
  )
  const [{ id: adminRoleId }] = await sql<{ id: string }>(
    `INSERT INTO roles(name, description, is_system)
     VALUES ('Admin', 'Full platform control except user management', true)
     ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
     RETURNING id`
  )

  // ── role_permissions ──────────────────────────────────────────────────────────
  for (const key of ADMIN_PERMISSION_KEYS) {
    await sql(
      `INSERT INTO role_permissions(role_id, permission_key, can_read, can_write, can_delete)
       VALUES ($1, $2, true, true, true)
       ON CONFLICT (role_id, permission_key)
       DO UPDATE SET can_read = true, can_write = true, can_delete = true`,
      [superAdminRoleId, key]
    )
    const hasPerm = key !== 'users'
    await sql(
      `INSERT INTO role_permissions(role_id, permission_key, can_read, can_write, can_delete)
       VALUES ($1, $2, $3, $3, $3)
       ON CONFLICT (role_id, permission_key)
       DO UPDATE SET can_read = EXCLUDED.can_read, can_write = EXCLUDED.can_write, can_delete = EXCLUDED.can_delete`,
      [adminRoleId, key, hasPerm]
    )
  }

  // ── default admin user (DO NOTHING so existing admins keep their password) ────
  const adminEmail = process.env.ADMIN_EMAIL ?? 'shekaigarcia@gmail.com'
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Pr0grX@2025!'
  const adminName = process.env.ADMIN_NAME ?? 'Jedidia Shekainah Garcia'
  const hashed = hashSync(adminPassword, 12)
  await sql(
    `INSERT INTO admin_users(email, full_name, password_hash, role_id, is_active)
     VALUES ($1, $2, $3, $4, true)
     ON CONFLICT (email) DO NOTHING`,
    [adminEmail, adminName, hashed, superAdminRoleId]
  )

  // ── services ──────────────────────────────────────────────────────────────────
  for (const [index, s] of services.entries()) {
    await sql(
      `INSERT INTO services(slug, title, short_desc, icon, color, details, sort_order, is_published)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, true)
       ON CONFLICT (slug) DO NOTHING`,
      [
        s.slug,
        s.title,
        s.shortDesc ?? null,
        s.icon ?? null,
        s.color ?? null,
        JSON.stringify({
          description: s.description,
          process: s.process,
          technologies: s.technologies,
          deliverables: s.deliverables,
          idealFor: s.idealFor,
          highlights: s.highlights,
          faqs: s.faqs,
        }),
        index,
      ]
    )
  }

  // ── projects ──────────────────────────────────────────────────────────────────
  for (const [index, p] of projects.entries()) {
    await sql(
      `INSERT INTO projects(slug, title, system_type, industry, categories, tags, image, short_desc, details, is_featured, feature_order, is_published)
       VALUES ($1, $2, $3, $4, $5::text[], $6::text[], $7, $8, $9::jsonb, $10, $11, true)
       ON CONFLICT (slug) DO NOTHING`,
      [
        p.slug,
        p.title,
        p.systemType ?? null,
        p.industry ?? null,
        normalizeCategories(p.category),
        p.tags ?? [],
        p.image ?? null,
        p.shortDesc ?? null,
        JSON.stringify({
          images: p.images,
          overview: p.overview,
          problem: p.problem,
          solution: p.solution,
          features: p.features,
          technologies: p.technologies,
          results: p.results,
          testimonial: p.testimonial,
        }),
        index < 13,
        index,
      ]
    )
  }

  // ── team members ──────────────────────────────────────────────────────────────
  for (const [index, m] of team.entries()) {
    await sql(
      `INSERT INTO team_members(name, role, bio, avatar, linkedin, github, portfolio, sort_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
       ON CONFLICT DO NOTHING`,
      [
        m.name,
        m.role,
        m.bio ?? null,
        m.avatar ?? null,
        m.linkedin ?? null,
        m.github ?? null,
        m.portfolio ?? null,
        index,
      ]
    )
  }

  // ── ready-made systems ────────────────────────────────────────────────────────
  for (const [index, sys] of systems.entries()) {
    await sql(
      `INSERT INTO ready_made_systems(slug, name, category, industry, tagline, short_desc, image, has_demo, details, sort_order, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, true)
       ON CONFLICT (slug) DO NOTHING`,
      [
        sys.slug,
        sys.name,
        sys.category ?? null,
        sys.industry ?? null,
        sys.tagline ?? null,
        sys.shortDesc ?? null,
        sys.image ?? null,
        Boolean(sys.hasDemo),
        JSON.stringify({
          features: sys.features,
          faqs: sys.faqs,
          pricing: sys.pricing,
          screenshots: sys.screenshots,
        }),
        index,
      ]
    )
  }

  // ── testimonials ──────────────────────────────────────────────────────────────
  for (const [index, t] of testimonials.entries()) {
    await sql(
      `INSERT INTO testimonials(name, role, avatar, quote, rating, company, sort_order, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       ON CONFLICT DO NOTHING`,
      [
        t.name,
        t.role ?? null,
        t.avatar ?? null,
        t.quote,
        t.rating ?? null,
        t.company ?? null,
        index,
      ]
    )
  }

  // ── site FAQs ─────────────────────────────────────────────────────────────────
  for (const [index, f] of faqs.entries()) {
    await sql(
      `INSERT INTO site_faqs(question, answer, sort_order, is_published)
       VALUES ($1, $2, $3, true)
       ON CONFLICT DO NOTHING`,
      [f.question, f.answer, index]
    )
  }

  // ── blogs ─────────────────────────────────────────────────────────────────────
  for (const b of blogs) {
    await sql(
      `INSERT INTO blogs(slug, title, category, author_name, author_role, author_avatar,
        published_at, read_time, image, excerpt, tags, content,
        related_posts, meta_title, meta_description, keywords, is_published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::text[],$12,$13::text[],$14,$15,$16::text[],true)
       ON CONFLICT (slug) DO NOTHING`,
      [
        b.slug,
        b.title,
        b.category ?? null,
        b.author?.name ?? null,
        b.author?.role ?? null,
        b.author?.avatar ?? null,
        b.date ?? null,
        b.readTime ?? null,
        b.image ?? null,
        b.excerpt ?? null,
        b.tags ?? [],
        b.content ?? null,
        b.relatedPosts ?? [],
        b.metaTitle ?? null,
        b.metaDescription ?? null,
        b.keywords ?? [],
      ]
    )
  }
}
