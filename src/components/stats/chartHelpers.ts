export function percentFormatter(value: number | Date): string {
  return `${value}%`
}

export interface LegendItem {
  color: string
  label: string
}

interface TooltipOptions {
  title: string
  sublabel: string
  color: string
  value: number
  replied: number
  total: number
}

// Raw HTML for unovis tooltips (they don't accept JSX).
export function buildBarTooltip({ title, sublabel, color, value, replied, total }: TooltipOptions): string {
  const noReply = total - replied
  return `<div style="min-width:200px">
    <div style="font-size:13px;font-weight:600;color:#111827">${title}</div>
    <div style="margin-top:6px;display:flex;align-items:center;justify-content:space-between;gap:16px">
      <span style="display:flex;align-items:center;gap:6px;font-size:12px;color:#6b7280">
        <span style="width:8px;height:8px;border-radius:9999px;background:${color}"></span>${sublabel}
      </span>
      <span style="font-size:12px;font-weight:600;color:#111827">${percentFormatter(value)}</span>
    </div>
    <div style="padding-left:14px;font-size:11px;color:#9ca3af">${replied} avec réponse · ${noReply} sans réponse</div>
  </div>`
}
