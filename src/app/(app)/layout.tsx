import Sidebar from '@/components/layout/Sidebar'
import { createClient } from '@/lib/supabase/server'
import NotificationBell from '@/components/NotificationBell'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30)

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-12 bg-white border-b border-slate-200 flex items-center justify-end px-6 gap-2 flex-shrink-0">
          <NotificationBell initialNotifications={notifications ?? []} />
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
