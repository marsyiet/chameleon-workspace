import { Scan } from "@/app/[locale]/scans/_constants/data-types"

export default function StatusBadge({ status }: { status: Scan["status"] }) {
  const styles: Record<string, string> = {
    completed: "bg-green-500/15 text-emerald-600 border-green-500/30 dark:text-green-400",
    running:   "bg-blue-500/15 text-blue-600 border-blue-500/30 dark:text-blue-400",
    pending:   "bg-secondary text-muted-foreground border-border",
    failed:    "bg-red-500/15 text-red-600 border-red-500/30 dark:text-red-400",
  }
  const dots: Record<string, string> = {
    completed: "bg-emerald-500",
    running:   "bg-blue-500 animate-pulse",
    pending:   "bg-muted-foreground",
    failed:    "bg-red-500",
  }
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border ${styles[status] ?? styles.pending}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] ?? dots.pending}`} />
      {status}
    </span>
  )
}