export function ProgressCell({
  value,
}: {
  value: number
}) {
  return (
    <div className="w-[140px]">
      <div className="mb-1 flex justify-between text-xs">
        <span>{value}%</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)] transition-all"
          style={{
            width: `${value}%`,
          }}
        />
      </div>
    </div>
  )
}