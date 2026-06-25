import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import { Chart01Icon, LayoutTableIcon } from '@hugeicons/core-free-icons'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export type ChartView = 'chart' | 'table'

interface ViewToggleProps {
  value: ChartView
  onChange: (value: ChartView) => void
}

const OPTIONS: { value: ChartView; label: string; icon: IconSvgElement }[] = [
  { value: 'chart', label: 'Vue graphe', icon: Chart01Icon },
  { value: 'table', label: 'Vue table', icon: LayoutTableIcon }
]

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(next: string) => {
        // radix single mode emits '' when clicking the active item — keep current.
        if (next) {
          onChange(next as ChartView)
        }
      }}
      variant="outline"
      spacing={0}
    >
      {OPTIONS.map(option => (
        <Tooltip key={option.value}>
          <TooltipTrigger asChild>
            <ToggleGroupItem
              value={option.value}
              aria-label={option.label}
              className="aria-checked:bg-accent!"
            >
              <HugeiconsIcon icon={option.icon} />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>{option.label}</TooltipContent>
        </Tooltip>
      ))}
    </ToggleGroup>
  )
}
