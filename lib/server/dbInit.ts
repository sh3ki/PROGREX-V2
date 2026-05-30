/**
 * lib/server/dbInit.ts
 *
 * Single once-per-process DDL initialisation guard.
 *
 * HOW IT WORKS
 * ────────────
 * All `CREATE TABLE / ALTER TABLE` statements that used to be scattered across
 * every admin page and API route are consolidated here.  The result is stored
 * as a `Promise<void>` on `globalThis` so it is created exactly ONCE per
 * Node.js process (Render persistent server) regardless of how many pages or
 * API routes call `ensureAllTablesOnce()` concurrently at startup.
 *
 * First call  → kicks off all DDL, stores the promise
 * Every subsequent call → instantly returns the already-resolved promise (free)
 * Server restart → runs once again on the first call after the cold start
 */

import fs from 'node:fs'
import path from 'node:path'
import { sql } from './db'
import { seedIfEmpty } from './dbSeed'

const g = globalThis as typeof globalThis & {
  __allTablesReady?: Promise<void>
}

export function ensureAllTablesOnce(): Promise<void> {
  if (!g.__allTablesReady) {
    g.__allTablesReady = _runAllDDL().catch((err) => {
      // Clear so the next request retries rather than permanently returning a rejected promise
      g.__allTablesReady = undefined
      throw err
    })
  }
  return g.__allTablesReady
}

// ─── All DDL consolidated ──────────────────────────────────────────────────────
async function _runAllDDL() {
  // ── base schema (idempotent — CREATE TABLE IF NOT EXISTS) ─────────────────────
  const schemaPath = path.join(process.cwd(), 'lib', 'server', 'schema.sql')
  const schemaSql = fs.readFileSync(schemaPath, 'utf8')
  await sql(schemaSql)

  // ── admin_users ──────────────────────────────────────────────────────────────
  await sql('alter table admin_users add column if not exists profile_image_url text')

  // ── roles ────────────────────────────────────────────────────────────────────
  await sql('alter table roles add column if not exists is_active boolean not null default true')

  // ── team_members ─────────────────────────────────────────────────────────────
  await sql('alter table team_members add column if not exists avatar text')
  await sql('alter table team_members add column if not exists portfolio text')
  await sql('alter table team_members add column if not exists email text')
  await sql('alter table team_members add column if not exists sort_order integer not null default 1')
  await sql('alter table team_members add column if not exists is_active boolean not null default true')

  // ── blogs ────────────────────────────────────────────────────────────────────
  await sql('alter table blogs add column if not exists team_member_id uuid')
  await sql('alter table blogs add column if not exists is_published boolean not null default true')
  await sql('alter table blogs add column if not exists related_posts text[] default array[]::text[]')
  await sql('alter table blogs add column if not exists keywords text[] default array[]::text[]')
  await sql('alter table blogs add column if not exists tags text[] default array[]::text[]')
  await sql(`
    do $$
    begin
      if not exists (
        select 1 from pg_constraint where conname = 'blogs_team_member_id_fkey'
      ) then
        alter table blogs
          add constraint blogs_team_member_id_fkey
          foreign key (team_member_id)
          references team_members(id)
          on delete set null;
      end if;
    end $$
  `)
  // Backfill: link blog author to team member by name match (safe: uses set null if no match)
  await sql(`
    update blogs b
       set team_member_id = tm.id
      from team_members tm
     where b.team_member_id is null
       and lower(trim(coalesce(b.author_name, ''))) = lower(trim(tm.name))
  `)
  // Backfill: set published_at from created_at for older records
  await sql(`
    update blogs
       set published_at = to_char(coalesce(created_at, now())::date, 'YYYY-MM-DD')
     where coalesce(trim(published_at), '') = ''
  `)

  // ── projects ─────────────────────────────────────────────────────────────────
  await sql('alter table projects add column if not exists is_published boolean not null default true')
  // Normalise results array to always have exactly 4 metric slots (safe upsert shape)
  await sql(`
    update projects
       set details = jsonb_set(
             coalesce(details, '{}'::jsonb),
             '{results}',
             case
               when jsonb_typeof(coalesce(details, '{}'::jsonb)->'results') = 'array' then
                 (
                   (
                     select jsonb_agg(jsonb_build_object(
                       'value',  coalesce(nullif(item->>'value',  ''), 'N/A'),
                       'metric', coalesce(nullif(item->>'metric', ''), 'Additional KPI')
                     ))
                     from (
                       select item
                         from jsonb_array_elements(coalesce(details, '{}'::jsonb)->'results') as item
                        limit 4
                     ) trimmed
                   ) ||
                   (
                     select coalesce(
                       jsonb_agg(jsonb_build_object('value', 'N/A', 'metric', 'Additional KPI')),
                       '[]'::jsonb
                     )
                     from generate_series(
                       1,
                       greatest(0, 4 - least(4, jsonb_array_length(coalesce(details, '{}'::jsonb)->'results')))
                     )
                   )
                 )
               else
                 jsonb_build_array(
                   jsonb_build_object('value', 'N/A', 'metric', 'Additional KPI'),
                   jsonb_build_object('value', 'N/A', 'metric', 'Additional KPI'),
                   jsonb_build_object('value', 'N/A', 'metric', 'Additional KPI'),
                   jsonb_build_object('value', 'N/A', 'metric', 'Additional KPI')
                 )
             end,
             true
           )
     where jsonb_typeof(coalesce(details, '{}'::jsonb)->'results') <> 'array'
        or jsonb_array_length(coalesce(details, '{}'::jsonb)->'results') <> 4
  `)

  // ── ready_made_systems ───────────────────────────────────────────────────────
  await sql('alter table ready_made_systems add column if not exists is_published boolean not null default true')

  // ── calendar_events ──────────────────────────────────────────────────────────
  await sql("alter table calendar_events add column if not exists event_date date")
  await sql("alter table calendar_events add column if not exists color text not null default 'primary'")
  await sql('alter table calendar_events add column if not exists start_time text')
  await sql('alter table calendar_events add column if not exists end_time text')
  await sql('alter table calendar_events alter column end_at drop not null')
  // Backfill date/time fields from the old timestamptz columns
  await sql(`
    update calendar_events
       set event_date = coalesce(event_date, start_at::date),
           start_time = coalesce(start_time, to_char(start_at, 'HH24:MI')),
           end_time   = coalesce(end_time, case when end_at is null then '' else to_char(end_at, 'HH24:MI') end),
           color      = coalesce(nullif(trim(color), ''), 'primary')
     where event_date is null
        or start_time is null
        or coalesce(trim(color), '') = ''
  `)

  // ── bookings ─────────────────────────────────────────────────────────────────
  await sql('alter table bookings add column if not exists is_approved boolean not null default false')
  await sql('alter table bookings add column if not exists requested_date date')
  await sql('alter table bookings add column if not exists requested_start_time text')
  await sql('alter table bookings add column if not exists requested_duration_minutes integer')
  await sql('alter table bookings add column if not exists is_active boolean not null default true')
  await sql('alter table bookings add column if not exists budget text')
  await sql('alter table bookings add column if not exists project_details text')
  await sql('alter table bookings add column if not exists attachment_urls text[] default array[]::text[]')
  await sql('alter table bookings add column if not exists is_archived boolean not null default false')

  // ── contact_submissions ───────────────────────────────────────────────────────
  await sql('alter table contact_submissions add column if not exists service text')
  await sql('alter table contact_submissions add column if not exists budget text')
  await sql('alter table contact_submissions add column if not exists message text')
  await sql("alter table contact_submissions add column if not exists status text not null default 'new'")
  await sql('alter table contact_submissions add column if not exists is_active boolean not null default true')
  await sql('alter table contact_submissions add column if not exists is_archived boolean not null default false')
  await sql('alter table contact_submissions add column if not exists attachment_urls text[] default array[]::text[]')
  await sql('alter table contact_submissions add column if not exists request_meeting boolean not null default false')

  // ── contact_submission_confirmations ─────────────────────────────────────────
  await sql(`
    create table if not exists contact_submission_confirmations (
      id text primary key,
      token_hash text unique not null,
      payload jsonb not null,
      created_at timestamptz not null default now(),
      expires_at timestamptz not null,
      consumed_at timestamptz
    )
  `)

  // ── clients ───────────────────────────────────────────────────────────────────
  await sql(`
    create table if not exists clients (
      id uuid primary key default gen_random_uuid(),
      full_name text not null,
      profile_image text,
      other_member_names text[] default array[]::text[],
      role text,
      email text,
      fb_link text,
      phone text,
      client_date date,
      is_active boolean not null default true,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `)

  // ── ongoing_projects ─────────────────────────────────────────────────────────
  await sql(`
    create table if not exists ongoing_projects (
      id uuid primary key default gen_random_uuid(),
      project_name text not null,
      project_description text,
      start_date date,
      target_date date,
      client_id uuid references clients(id) on delete set null,
      category text,
      assigned_team_member_ids uuid[] default array[]::uuid[],
      agreement_file_url text,
      project_scope_file_url text,
      other_files_urls text[] default array[]::text[],
      payment_term text,
      is_active boolean not null default true,
      progress_color text not null default '#16a34a',
      total_price numeric(12,2),
      balance numeric(12,2),
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `)
  await sql('alter table ongoing_projects add column if not exists is_active boolean not null default true')
  await sql('alter table ongoing_projects add column if not exists other_files_urls text[] default array[]::text[]')
  await sql("alter table ongoing_projects add column if not exists progress_color text not null default '#16a34a'")
  await sql("alter table ongoing_projects add column if not exists status text not null default 'active'")
  await sql('alter table ongoing_projects add column if not exists progress numeric(5,2) not null default 0')
  await sql('alter table ongoing_projects add column if not exists invoice_no text')
  // Backfill: set status from is_active (safe: WHERE clause skips already-set rows)
  await sql(`
    update ongoing_projects
       set status = case when is_active then coalesce(nullif(status, ''), 'active') else 'finished' end
     where status is null or trim(status) = ''
  `)
  // Backfill: assign invoice numbers to rows that don't have one yet
  await sql(`
    with source as (
      select id,
             to_char(coalesce(start_date, created_at::date), 'YYYY-MM') as ym,
             row_number() over (
               partition by to_char(coalesce(start_date, created_at::date), 'YYYY-MM')
               order by coalesce(start_date, created_at::date) asc, created_at asc, id asc
             ) as seq
        from ongoing_projects
       where invoice_no is null or trim(invoice_no) = ''
    )
    update ongoing_projects op
       set invoice_no = concat('INV-', source.ym, '-', lpad(source.seq::text, 3, '0'))
      from source
     where op.id = source.id
  `)
  await sql(`
    create table if not exists ongoing_project_progress (
      id uuid primary key default gen_random_uuid(),
      project_id uuid not null references ongoing_projects(id) on delete cascade,
      progress numeric(5,2) not null,
      notes text,
      created_by text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `)
  await sql('alter table ongoing_project_progress add column if not exists created_by text')

  // ── admin_kanban_tasks ───────────────────────────────────────────────────────
  await sql(`
    create table if not exists admin_kanban_tasks (
      id uuid primary key default gen_random_uuid(),
      project_id uuid not null references ongoing_projects(id) on delete cascade,
      title text not null,
      description text,
      priority text not null default 'medium',
      status text not null default 'todo',
      due_date date,
      assignee_ids uuid[] not null default array[]::uuid[],
      is_active boolean not null default true,
      history jsonb not null default '[]'::jsonb,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `)
  await sql("alter table admin_kanban_tasks add column if not exists priority text not null default 'medium'")
  await sql("alter table admin_kanban_tasks add column if not exists status text not null default 'todo'")
  await sql('alter table admin_kanban_tasks add column if not exists due_date date')
  await sql('alter table admin_kanban_tasks add column if not exists assignee_ids uuid[] not null default array[]::uuid[]')
  await sql("alter table admin_kanban_tasks add column if not exists is_active boolean not null default true")
  await sql("alter table admin_kanban_tasks add column if not exists history jsonb not null default '[]'::jsonb")

  // ── payments ─────────────────────────────────────────────────────────────────
  await sql(`
    create table if not exists payments (
      id text primary key,
      project_id uuid references ongoing_projects(id) on delete set null,
      client_name text not null,
      project_name text,
      amount numeric(12, 2) not null default 0,
      ref_number text,
      discount_amount numeric(12, 2) not null default 0,
      tax_amount numeric(12, 2) not null default 0,
      currency text not null default 'PHP',
      currency_symbol text not null default '₱',
      currency_label text not null default 'Philippine Peso',
      payment_method text,
      payment_date date,
      payment_time time,
      status text not null default 'pending',
      proof_url text,
      notes text,
      or_number text,
      invoice_number text,
      invoice_status text not null default 'draft',
      invoice_due_date date,
      invoice_sent_at timestamptz,
      invoice_pdf_url text,
      invoice_pdf_public_id text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `)
  await sql('alter table payments add column if not exists project_id uuid references ongoing_projects(id) on delete set null')
  await sql('alter table payments add column if not exists ref_number text')
  await sql('alter table payments add column if not exists discount_amount numeric(12, 2) not null default 0')
  await sql('alter table payments add column if not exists tax_amount numeric(12, 2) not null default 0')
  await sql('alter table payments add column if not exists payment_time time')
  await sql("alter table payments add column if not exists currency_symbol text not null default '₱'")
  await sql("alter table payments add column if not exists currency_label text not null default 'Philippine Peso'")
  await sql('alter table payments add column if not exists or_number text')
  await sql('alter table payments add column if not exists invoice_number text')
  await sql("alter table payments add column if not exists invoice_status text not null default 'draft'")
  await sql('alter table payments add column if not exists invoice_due_date date')
  await sql('alter table payments add column if not exists invoice_sent_at timestamptz')
  await sql('alter table payments add column if not exists invoice_pdf_url text')
  await sql('alter table payments add column if not exists invoice_pdf_public_id text')

  // ── initial data seed (only when the DB is empty) ─────────────────────────────
  await seedIfEmpty()
}
