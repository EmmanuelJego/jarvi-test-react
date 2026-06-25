import { Link } from 'react-router-dom'
import {
  AiSearch02Icon,
  Home01Icon,
  Building03Icon,
  Target02Icon,
  UserAccountIcon,
  Briefcase05Icon,
  UserSearch01Icon,
  ChartUpIcon,
  CloudSavingDone02Icon,
  Settings01Icon
} from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'
import { AppLogo } from '@/components/AppLogo'
import { SidebarButton } from '@/components/SidebarButton'

interface RailItem {
  icon: IconSvgElement
  to?: string
  label?: string
}

const topItems: RailItem[] = [
  { icon: AiSearch02Icon },
  { icon: Home01Icon }
]

const crmItems: RailItem[] = [
  { icon: Building03Icon },
  { icon: Target02Icon },
  { icon: UserAccountIcon }
]

const atsItems: RailItem[] = [
  { icon: Briefcase05Icon },
  { icon: UserSearch01Icon }
]

const bottomItems: RailItem[] = [
  { icon: ChartUpIcon, to: '/', label: 'Statistiques' },
  { icon: CloudSavingDone02Icon },
  { icon: Settings01Icon }
]

export function AppSidebar() {
  return (
    <aside className="h-screen w-20 p-2">
      <div className="flex h-full shrink-0 flex-col items-center gap-3 rounded-md bg-jarvi-500 py-4">
        {/* Logo */}
        <Link to="/" aria-label="Accueil" className="mb-3">
          <AppLogo className="size-9" />
        </Link>

        {/* Top section */}
        <div className="flex flex-col items-center gap-1">
          {topItems.map((item, index) => (
            <SidebarButton key={`top-item-${index}`} {...item} />
          ))}
        </div>

        {/* Middle section */}
        <div className="flex flex-1 flex-col items-center justify-center gap-5">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-semibold tracking-wide text-white/50 uppercase">CRM</span>
            {crmItems.map((item, index) => (
              <SidebarButton key={`crm-item-${index}`} {...item} />
            ))}
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-semibold tracking-wide text-white/50 uppercase">ATS</span>
            {atsItems.map((item, index) => (
              <SidebarButton key={`ats-item-${index}`} {...item} />
            ))}
          </div>
        </div>

        {/* Bottom section */}
        <div className="flex flex-col items-center gap-1">
          {bottomItems.map((item, index) => (
            <SidebarButton key={`bottom-item-${index}`} {...item} />
          ))}
        </div>
      </div>
    </aside>
  )
}
