export const ADMIN_PERMISSION_KEYS = [
  'dashboard',
  'users',
  'roles',
  'calendar',
  'bookings',
  'projects',
  'teams',
  'blogs',
  'systems',
] as const

export type AdminPermissionKey = (typeof ADMIN_PERMISSION_KEYS)[number]

export const ADMIN_PERMISSION_LABELS: Record<AdminPermissionKey, string> = {
  dashboard: 'Dashboard',
  users: 'User Management',
  roles: 'Roles and Permissions',
  calendar: 'Calendar',
  bookings: 'Bookings and Contact Submissions',
  projects: 'Projects',
  teams: 'Teams',
  blogs: 'Blogs',
  systems: 'Ready-Made Systems',
}
