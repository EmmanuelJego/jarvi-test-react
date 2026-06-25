import { Outlet } from 'react-router-dom'
import { AppSidebar } from '@/components/AppSidebar'

export function DefaultLayout() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="mx-auto max-w-300 flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
