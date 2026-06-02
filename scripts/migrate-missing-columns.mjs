// One-time migration: add columns that exist in dbInit.ts but are missing from schema.sql
// Run with: node scripts/migrate-missing-columns.mjs
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

const statements = [
  // ── admin_users ──────────────────────────────────────────────────────────────
  'alter table admin_users add column if not exists profile_image_url text',

  // ── roles ────────────────────────────────────────────────────────────────────
  'alter table roles add column if not exists is_active boolean not null default true',

  // ── team_members ─────────────────────────────────────────────────────────────
  'alter table team_members add column if not exists avatar text',
  'alter table team_members add column if not exists portfolio text',
  'alter table team_members add column if not exists email text',
  'alter table team_members add column if not exists sort_order integer not null default 1',
  'alter table team_members add column if not exists is_active boolean not null default true',

  // ── blogs ────────────────────────────────────────────────────────────────────
  'alter table blogs add column if not exists team_member_id uuid',
  'alter table blogs add column if not exists is_published boolean not null default true',
  'alter table blogs add column if not exists related_posts text[] default array[]::text[]',
  'alter table blogs add column if not exists keywords text[] default array[]::text[]',
  'alter table blogs add column if not exists tags text[] default array[]::text[]',
  `do $$ begin
     if not exists (
       select 1 from pg_constraint where conname = 'blogs_team_member_id_fkey'
     ) then
       alter table blogs
         add constraint blogs_team_member_id_fkey
         foreign key (team_member_id) references team_members(id) on delete set null;
     end if;
   end $$`,

  // ── projects ─────────────────────────────────────────────────────────────────
  'alter table projects add column if not exists is_published boolean not null default true',

  // ── ready_made_systems ───────────────────────────────────────────────────────
  'alter table ready_made_systems add column if not exists is_published boolean not null default true',

  // ── calendar_events ──────────────────────────────────────────────────────────
  'alter table calendar_events add column if not exists event_date date',
  `alter table calendar_events add column if not exists color text not null default 'primary'`,
  'alter table calendar_events add column if not exists start_time text',
  'alter table calendar_events add column if not exists end_time text',
  'alter table calendar_events alter column end_at drop not null',

  // ── bookings ─────────────────────────────────────────────────────────────────
  'alter table bookings add column if not exists is_approved boolean not null default false',
  'alter table bookings add column if not exists requested_date date',
  'alter table bookings add column if not exists requested_start_time text',
  'alter table bookings add column if not exists requested_duration_minutes integer',
  'alter table bookings add column if not exists is_active boolean not null default true',
  'alter table bookings add column if not exists budget text',
  'alter table bookings add column if not exists project_details text',
  `alter table bookings add column if not exists attachment_urls text[] default array[]::text[]`,
  'alter table bookings add column if not exists is_archived boolean not null default false',

  // ── contact_submissions ───────────────────────────────────────────────────────
  'alter table contact_submissions add column if not exists service text',
  'alter table contact_submissions add column if not exists budget text',
  'alter table contact_submissions add column if not exists message text',
  `alter table contact_submissions add column if not exists status text not null default 'new'`,
  'alter table contact_submissions add column if not exists is_active boolean not null default true',
  'alter table contact_submissions add column if not exists is_archived boolean not null default false',
  `alter table contact_submissions add column if not exists attachment_urls text[] default array[]::text[]`,
  'alter table contact_submissions add column if not exists request_meeting boolean not null default false',

  // ── contact_submission_confirmations (new table) ──────────────────────────────
  `create table if not exists contact_submission_confirmations (
    id text primary key,
    token_hash text unique not null,
    payload jsonb not null,
    created_at timestamptz not null default now(),
    expires_at timestamptz not null,
    consumed_at timestamptz
  )`,

  // ── clients (new table) ───────────────────────────────────────────────────────
  `create table if not exists clients (
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
  )`,

  // ── ongoing_projects (new table) ──────────────────────────────────────────────
  `create table if not exists ongoing_projects (
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
  )`,
  `alter table ongoing_projects add column if not exists status text not null default 'active'`,
  'alter table ongoing_projects add column if not exists progress numeric(5,2) not null default 0',
  'alter table ongoing_projects add column if not exists invoice_no text',

  // ── ongoing_project_progress (new table) ──────────────────────────────────────
  `create table if not exists ongoing_project_progress (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references ongoing_projects(id) on delete cascade,
    progress numeric(5,2) not null,
    notes text,
    created_by text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  )`,

  // ── admin_kanban_tasks (new table) ────────────────────────────────────────────
  `create table if not exists admin_kanban_tasks (
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
  )`,

  // ── payments (new table) ──────────────────────────────────────────────────────
  `create table if not exists payments (
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
  )`,
]

for (const stmt of statements) {
  try {
    await sql.query(stmt)
    console.log('OK :', stmt.slice(0, 70).replace(/\n/g, ' ').trim())
  } catch (e) {
    console.error('ERR:', e.message)
  }
}
console.log('\nMigration complete.')
