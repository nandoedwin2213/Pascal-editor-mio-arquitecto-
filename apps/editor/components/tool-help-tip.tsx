'use client'

import { toolHelp } from '@/lib/tool-help'

export function ToolHelpTip({ id, fallback }: { id: string; fallback: string }) {
  const help = toolHelp(id)
  if (!help) return <>{fallback}</>
  return (
    <div className="flex max-w-[240px] flex-col gap-1 py-0.5">
      <div className="font-semibold">{help.title}</div>
      <p className="text-background/85 leading-snug">{help.what}</p>
      <p className="text-background/70 leading-snug">
        <span className="font-medium text-background/85">Cómo: </span>
        {help.how}
      </p>
    </div>
  )
}
