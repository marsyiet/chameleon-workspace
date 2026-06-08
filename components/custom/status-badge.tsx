import {
  CircleCheckIcon,
  Clock3Icon,
  LoaderIcon,
  XCircleIcon,
} from "lucide-react"

export function StatusBadge({
  status,
}: {
  status: string
}) {
  switch (status) {
    case "completed":
      return (
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-3 py-1 text-xs font-medium text-emerald-400 ">
          <CircleCheckIcon className="size-3.5 fill-emerald-400 text-emerald-400" />
          Completed
        </div>
      )

    case "running":
      return (
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 px-3 py-1 text-xs font-medium text-cyan-400">
          <LoaderIcon className="size-3.5 animate-spin" />
          Running
        </div>
      )

    case "failed":
      return (
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/5 px-3 py-1 text-xs font-medium text-red-400">
          <XCircleIcon className="size-3.5" />
          Failed
        </div>
      )

    default:
      return (
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/5 px-3 py-1 text-xs font-medium text-amber-400 ">
          <Clock3Icon className="size-3.5" />
          Pending
        </div>
      )
  }
}