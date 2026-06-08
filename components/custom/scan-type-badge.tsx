export function ScanTypeBadge({
  type,
}: {
  type: string
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-fuchsia-500/30 bg-fuchsia-500/5 px-2 py-1 text-xs font-medium uppercase tracking-wider text-fuchsia-400">
      {type}
    </div>
  )
}