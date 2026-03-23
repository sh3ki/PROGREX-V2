import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getCurrentAdmin } from '@/lib/server/auth'
import AdminLayoutShell from '@/components/admin/AdminLayoutShell'

type ColorPreset = 'blue' | 'emerald' | 'violet' | 'rose' | 'orange' | 'cyan' | 'indigo' | 'teal' | 'amber' | 'fuchsia'
type Density = 'compact' | 'comfortable' | 'spacious'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    redirect('/admin/login')
  }

  const cookieStore = await cookies()
  const themeMode = cookieStore.get('apx-theme-mode')?.value
  const preset = cookieStore.get('apx-color-preset')?.value
  const density = cookieStore.get('apx-density')?.value

  const initialIsDark = themeMode ? themeMode === 'dark' : true
  const initialColorPreset: ColorPreset =
    preset === 'blue' ||
    preset === 'emerald' ||
    preset === 'violet' ||
    preset === 'rose' ||
    preset === 'orange' ||
    preset === 'cyan' ||
    preset === 'indigo' ||
    preset === 'teal' ||
    preset === 'amber' ||
    preset === 'fuchsia'
      ? preset
      : 'blue'
  const initialDensity: Density =
    density === 'compact' || density === 'comfortable' || density === 'spacious' ? density : 'comfortable'

  return (
    <AdminLayoutShell
      adminName={admin.fullName}
      adminEmail={admin.email}
      initialIsDark={initialIsDark}
      initialColorPreset={initialColorPreset}
      initialDensity={initialDensity}
    >
      {children}
    </AdminLayoutShell>
  )
}
