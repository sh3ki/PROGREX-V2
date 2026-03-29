import { NextRequest, NextResponse } from 'next/server'
import type { AdminPermissionKey } from '@/lib/server/permissions'
import { requirePermission } from '@/lib/server/admin-permission'
import { sql } from '@/lib/server/db'
import { assertSameOrigin } from '@/lib/server/request-security'

type ResourceConfig = {
  table: string
  permission: AdminPermissionKey
  writableColumns: string[]
}

const RESOURCES: Record<string, ResourceConfig> = {
  users: {
    table: 'admin_users',
    permission: 'users',
    writableColumns: ['email', 'full_name', 'role_id', 'is_active'],
  },
  roles: {
    table: 'roles',
    permission: 'roles',
    writableColumns: ['name', 'description', 'is_system'],
  },
  calendar: {
    table: 'calendar_events',
    permission: 'calendar',
    writableColumns: ['title', 'description', 'start_at', 'end_at', 'location', 'meeting_link', 'status'],
  },
  bookings: {
    table: 'bookings',
    permission: 'bookings',
    writableColumns: ['name', 'email', 'phone', 'company', 'service', 'budget', 'message', 'preferred_date', 'preferred_time', 'status', 'source'],
  },
  contacts: {
    table: 'contact_submissions',
    permission: 'bookings',
    writableColumns: ['name', 'email', 'phone', 'company', 'service', 'budget', 'message', 'status', 'admin_reply', 'replied_at'],
  },
  projects: {
    table: 'projects',
    permission: 'projects',
    writableColumns: ['slug', 'title', 'system_type', 'industry', 'categories', 'tags', 'image', 'short_desc', 'details', 'is_featured', 'feature_order', 'is_published'],
  },
  teams: {
    table: 'team_members',
    permission: 'teams',
    writableColumns: ['name', 'role', 'bio', 'avatar', 'linkedin', 'github', 'portfolio', 'sort_order', 'is_active'],
  },
  blogs: {
    table: 'blogs',
    permission: 'blogs',
    writableColumns: ['slug', 'title', 'category', 'author_name', 'author_role', 'author_avatar', 'published_at', 'read_time', 'image', 'excerpt', 'tags', 'content', 'related_posts', 'meta_title', 'meta_description', 'keywords', 'is_published'],
  },
  systems: {
    table: 'ready_made_systems',
    permission: 'systems',
    writableColumns: ['slug', 'name', 'category', 'industry', 'tagline', 'short_desc', 'image', 'has_demo', 'details', 'sort_order', 'is_published'],
  },
}

function getConfig(resource: string): ResourceConfig | null {
  return RESOURCES[resource] ?? null
}

function mapApiError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ resource: string; id: string }> }) {
  try {
    if (!assertSameOrigin(req)) {
      return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
    }

    const { resource, id } = await context.params
    const config = getConfig(resource)
    if (!config) return NextResponse.json({ error: 'Unknown resource' }, { status: 404 })

    await requirePermission(config.permission, 'write')

    const body = await req.json()
    const allowedEntries = Object.entries(body).filter(([key]) => config.writableColumns.includes(key))
    if (allowedEntries.length === 0) {
      return NextResponse.json({ error: 'No valid fields' }, { status: 400 })
    }

    const setClauses = allowedEntries.map(([key], i) => `${key} = $${i + 2}`)
    const values = allowedEntries.map(([, value]) => value)

    const updated = await sql(
      `update ${config.table}
       set ${setClauses.join(', ')}, updated_at = now()
       where id = $1
       returning *`,
      [id, ...values]
    )

    return NextResponse.json({ data: updated[0] })
  } catch (error) {
    return mapApiError(error)
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ resource: string; id: string }> }) {
  try {
    if (!assertSameOrigin(req)) {
      return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
    }

    const { resource, id } = await context.params
    const config = getConfig(resource)
    if (!config) return NextResponse.json({ error: 'Unknown resource' }, { status: 404 })

    await requirePermission(config.permission, 'delete')
    await sql(`delete from ${config.table} where id = $1`, [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    return mapApiError(error)
  }
}
