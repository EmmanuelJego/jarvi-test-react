import { Link, useLocation } from 'react-router-dom'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface SidebarButtonProps {
  icon: IconSvgElement
  to?: string
  label?: string
}

export function SidebarButton({ icon, to, label }: SidebarButtonProps) {
  const location = useLocation()
  const isActive = !!to && location.pathname === to

  const className = cn(
    'size-11 text-white/70 hover:bg-jarvi-700 hover:text-white disabled:opacity-100',
    isActive && 'bg-jarvi-700 text-white hover:bg-jarvi-700'
  )

  const content = <HugeiconsIcon icon={icon} size={20} className='size-auto' />

  if (!to) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        aria-label={label}
        className={className}
      >
        {content}
      </Button>
    )
  }

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      aria-label={label}
      className={className}
    >
      <Link to={to}>{content}</Link>
    </Button>
  )
}
