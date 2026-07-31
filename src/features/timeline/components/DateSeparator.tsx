export function DateSeparator({ date }: { date: string }) {
  const d = new Date(date)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  let label: string
  if (d.toDateString() === today.toDateString()) {
    label = 'Hoje'
  } else if (d.toDateString() === yesterday.toDateString()) {
    label = 'Ontem'
  } else {
    label = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    label = label.charAt(0).toUpperCase() + label.slice(1)
  }

  return (
    <div className="flex items-center gap-2 py-1">
      <div className="flex-1 h-px bg-gray-100" />
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  )
}
