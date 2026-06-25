import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { fr } from 'date-fns/locale'
import { Calendar03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { rangeFormatter } from '@/domain/dates'
import {
  PERIOD_PRESET_OPTIONS,
  type PeriodPreset,
  type PeriodSelection
} from '@/domain/periods'

interface PeriodFilterProps {
  value: PeriodSelection
  onChange: (selection: PeriodSelection) => void
}

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  const [preset, setPreset] = useState<PeriodPreset>(value.preset)
  const [open, setOpen] = useState(false)
  const [range, setRange] = useState<DateRange | undefined>(
    value.preset === 'custom' ? { from: value.from, to: value.to } : undefined
  )

  const customLabel =
    range?.from && range?.to
      ? `${rangeFormatter.format(range.from)} - ${rangeFormatter.format(range.to)}`
      : 'Choisir une plage'

  function onPresetChange(next: string) {
    const value = next as PeriodPreset
    setPreset(value)

    if (value === 'custom') {
      if (!range?.from || !range?.to) {
        // Small delay so the Select's auto-blur does not immediately close the popover.
        setTimeout(() => setOpen(true), 200)
      } else {
        onChange({ preset: 'custom', from: range.from, to: range.to })
      }
    } else {
      onChange({ preset: value })
    }
  }

  // Commit the range to the parent and close the popover once both ends are picked.
  function onRangeSelect(next: DateRange | undefined) {
    setRange(next)
    if (next?.from && next?.to) {
      onChange({ preset: 'custom', from: next.from, to: next.to })
      setOpen(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={preset} onValueChange={onPresetChange}>
        <SelectTrigger className="w-48">
          <HugeiconsIcon icon={Calendar03Icon} />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {PERIOD_PRESET_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {preset === 'custom' && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <HugeiconsIcon icon={Calendar03Icon} data-icon="inline-start" />
              {customLabel}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={range}
              onSelect={onRangeSelect}
              resetOnSelect
              numberOfMonths={1}
              locale={fr}
              className="p-2"
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
