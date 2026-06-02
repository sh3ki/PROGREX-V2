// One-time migration: add columns that exist in dbInit.ts but are missing from schema.sql
// Run with: node scripts/migrate-missing-columns.mjs
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

const statements = [
  'alter table admin_users add column if not exists profile_image_url text',
  'alter table roles add column if not exists is_active boolean not null default true',
  'alter table team_members add column if not exists avatar text',
  'alter table team_members add column if not exists portfolio text',
  'alter table team_members add column if not exists email text',
  'alter table team_members add column if not exists sort_order integer not null default 1',
  'alter table team_members add column if not exists is_active boolean not null default true',
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
