import fs from 'node:fs/promises'
import path from 'node:path'
import { Pool } from 'pg'
import { hashSync } from 'bcryptjs'
import { services, systems, testimonials, team, faqs, projects, blogs } from '../lib/mockData'
import { ADMIN_PERMISSION_KEYS, ADMIN_PERMISSION_LABELS } from '../lib/server/permissions'

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required`)
  return value
}

function normalizeCategories(category: unknown): string[] {
  if (Array.isArray(category)) return category.map(String)
  if (typeof category === 'string') return [category]
  return []
}

async function main() {
  const databaseUrl = requiredEnv('DATABASE_URL')
  const adminEmail = process.env.ADMIN_EMAIL ?? 'shekaigarcia@gmail.com'
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Pr0grX@2025!'
  const adminName = process.env.ADMIN_NAME ?? 'Jedidia Shekainah Garcia'
  const shouldReset = process.argv.includes('--reset') || process.env.DB_RESET === 'true'

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })
  const client = await pool.connect()

  try {
    await client.query('begin')

    const schemaPath = path.join(process.cwd(), 'lib', 'server', 'schema.sql')
    const schemaSql = await fs.readFile(schemaPath, 'utf8')
    await client.query(schemaSql)

    if (shouldReset) {
      await client.query(`
        truncate table
          contact_submissions,
          bookings,
          calendar_events,
          site_faqs,
          testimonials,
          ready_made_systems,
          blogs,
          team_members,
          projects,
          services,
          admin_users,
          role_permissions,
          roles,
          permissions
        restart identity cascade
      `)
    }

    for (const key of ADMIN_PERMISSION_KEYS) {
      await client.query(
        `insert into permissions(key, label)
         values ($1, $2)
         on conflict (key) do update set label = excluded.label`,
        [key, ADMIN_PERMISSION_LABELS[key]]
      )
    }

    const superAdminRole = await client.query<{ id: string }>(
      `insert into roles(name, description, is_system)
       values ('Super Admin', 'Full platform control with user management', true)
       on conflict (name) do update set description = excluded.description
       returning id`
    )
    const superAdminRoleId = superAdminRole.rows[0].id

    const adminRole = await client.query<{ id: string }>(
      `insert into roles(name, description, is_system)
       values ('Admin', 'Full platform control except user management', true)
       on conflict (name) do update set description = excluded.description
       returning id`
    )
    const adminRoleId = adminRole.rows[0].id

    for (const key of ADMIN_PERMISSION_KEYS) {
      await client.query(
        `insert into role_permissions(role_id, permission_key, can_read, can_write, can_delete)
         values ($1, $2, true, true, true)
         on conflict (role_id, permission_key)
         do update set can_read = excluded.can_read, can_write = excluded.can_write, can_delete = excluded.can_delete`,
        [superAdminRoleId, key]
      )

      const hasUsersManagement = key !== 'users'
      await client.query(
        `insert into role_permissions(role_id, permission_key, can_read, can_write, can_delete)
         values ($1, $2, $3, $3, $3)
         on conflict (role_id, permission_key)
         do update set can_read = excluded.can_read, can_write = excluded.can_write, can_delete = excluded.can_delete`,
        [adminRoleId, key, hasUsersManagement]
      )
    }

    const hashed = hashSync(adminPassword, 12)
    await client.query(
      `insert into admin_users(email, full_name, password_hash, role_id, is_active)
       values ($1, $2, $3, $4, true)
       on conflict (email)
       do update set full_name = excluded.full_name, password_hash = excluded.password_hash, role_id = excluded.role_id, is_active = true`,
      [adminEmail, adminName, hashed, superAdminRoleId]
    )

    for (const [index, service] of services.entries()) {
      await client.query(
        `insert into services(slug, title, short_desc, icon, color, details, sort_order, is_published)
         values ($1, $2, $3, $4, $5, $6::jsonb, $7, true)
         on conflict (slug)
         do update set title = excluded.title, short_desc = excluded.short_desc, icon = excluded.icon, color = excluded.color,
                      details = excluded.details, sort_order = excluded.sort_order, is_published = excluded.is_published, updated_at = now()`,
        [
          service.slug,
          service.title,
          service.shortDesc,
          service.icon,
          service.color,
          JSON.stringify({
            description: service.description,
            process: service.process,
            technologies: service.technologies,
            deliverables: service.deliverables,
            idealFor: service.idealFor,
            highlights: service.highlights,
            faqs: service.faqs,
          }),
          index,
        ]
      )
    }

    for (const [index, project] of projects.entries()) {
      const categories = normalizeCategories(project.category)
      await client.query(
        `insert into projects(slug, title, system_type, industry, categories, tags, image, short_desc, details, is_featured, feature_order, is_published)
         values ($1, $2, $3, $4, $5::text[], $6::text[], $7, $8, $9::jsonb, $10, $11, true)
         on conflict (slug)
         do update set title = excluded.title, system_type = excluded.system_type, industry = excluded.industry,
                      categories = excluded.categories, tags = excluded.tags, image = excluded.image, short_desc = excluded.short_desc,
                      details = excluded.details, is_featured = excluded.is_featured, feature_order = excluded.feature_order,
                      is_published = excluded.is_published, updated_at = now()`,
        [
          project.slug,
          project.title,
          project.systemType,
          project.industry,
          categories,
          project.tags,
          project.image,
          project.shortDesc,
          JSON.stringify({
            images: project.images,
            overview: project.overview,
            problem: project.problem,
            solution: project.solution,
            features: project.features,
            technologies: project.technologies,
            results: project.results,
            testimonial: project.testimonial,
          }),
          index < 13,
          index,
        ]
      )
    }

    for (const [index, member] of team.entries()) {
      await client.query(
        `insert into team_members(name, role, bio, avatar, linkedin, github, portfolio, sort_order, is_active)
         values ($1, $2, $3, $4, $5, $6, $7, $8, true)
         on conflict do nothing`,
        [member.name, member.role, member.bio, member.avatar, member.linkedin, member.github, member.portfolio, index]
      )
    }

    const dedupeTeam = await client.query<{ id: string }>(
      `select id from team_members order by created_at asc`
    )
    const seen = new Set<string>()
    for (const row of dedupeTeam.rows) {
      if (seen.has(row.id)) continue
      seen.add(row.id)
    }

    for (const [index, system] of systems.entries()) {
      await client.query(
        `insert into ready_made_systems(slug, name, category, industry, tagline, short_desc, image, has_demo, details, sort_order, is_published)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, true)
         on conflict (slug)
         do update set name = excluded.name, category = excluded.category, industry = excluded.industry,
                      tagline = excluded.tagline, short_desc = excluded.short_desc, image = excluded.image,
                      has_demo = excluded.has_demo, details = excluded.details, sort_order = excluded.sort_order,
                      is_published = excluded.is_published, updated_at = now()`,
        [
          system.slug,
          system.name,
          system.category,
          system.industry,
          system.tagline,
          system.shortDesc,
          system.image,
          Boolean(system.hasDemo),
          JSON.stringify({
            features: system.features,
            faqs: system.faqs,
            pricing: system.pricing,
            screenshots: system.screenshots,
          }),
          index,
        ]
      )
    }

    for (const [index, item] of testimonials.entries()) {
      await client.query(
        `insert into testimonials(name, role, avatar, quote, rating, company, sort_order, is_published)
         values ($1, $2, $3, $4, $5, $6, $7, true)
         on conflict do nothing`,
        [item.name, item.role, item.avatar, item.quote, item.rating, item.company, index]
      )
    }

    for (const [index, item] of faqs.entries()) {
      await client.query(
        `insert into site_faqs(question, answer, sort_order, is_published)
         values ($1, $2, $3, true)
         on conflict do nothing`,
        [item.question, item.answer, index]
      )
    }

    for (const blog of blogs) {
      await client.query(
        `insert into blogs(slug, title, category, author_name, author_role, author_avatar, published_at, read_time, image, excerpt, tags, content, related_posts, meta_title, meta_description, keywords, is_published)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::text[], $12, $13::text[], $14, $15, $16::text[], true)
         on conflict (slug)
         do update set title = excluded.title, category = excluded.category, author_name = excluded.author_name,
                      author_role = excluded.author_role, author_avatar = excluded.author_avatar,
                      published_at = excluded.published_at, read_time = excluded.read_time,
                      image = excluded.image, excerpt = excluded.excerpt, tags = excluded.tags,
                      content = excluded.content, related_posts = excluded.related_posts,
                      meta_title = excluded.meta_title, meta_description = excluded.meta_description,
                      keywords = excluded.keywords, is_published = excluded.is_published, updated_at = now()`,
        [
          blog.slug,
          blog.title,
          blog.category,
          blog.author.name,
          blog.author.role,
          blog.author.avatar,
          blog.date,
          blog.readTime,
          blog.image,
          blog.excerpt,
          blog.tags,
          blog.content,
          blog.relatedPosts,
          blog.metaTitle,
          blog.metaDescription,
          blog.keywords,
        ]
      )
    }

    await client.query('commit')

    console.log('Database setup complete')
    console.log(`Admin login: ${adminEmail}`)
    console.log(`Admin password: ${adminPassword}`)
  } catch (error) {
    await client.query('rollback')
    console.error(error)
    process.exitCode = 1
  } finally {
    client.release()
    await pool.end()
  }
}

void main()
