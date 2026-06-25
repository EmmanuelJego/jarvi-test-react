import { HugeiconsIcon } from '@hugeicons/react'
import { ChartColumnIcon, GridTableIcon } from '@hugeicons/core-free-icons'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export type ChartView = 'chart' | 'table'

interface ViewToggleProps {
  value: ChartView
  onChange: (value: ChartView) => void
}

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
      size="sm"
    >
      <ToggleGroupItem value="chart" aria-label="Vue graphique">
        <HugeiconsIcon icon={ChartColumnIcon} />
      </ToggleGroupItem>
      <ToggleGroupItem value="table" aria-label="Vue tableau">
        <HugeiconsIcon icon={GridTableIcon} />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
