"use client"

type Props = {
  scan: {
    name: string
    status: string
    progress: number
    assetsDiscovered: number
  }
}

export default function PendingScanView({
  scan,
}: Props) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8">
      <div className="relative h-[420px] w-[420px]">
        <div className="absolute inset-0 rounded-full border border-emerald-500/20" />
        <div className="absolute inset-8 rounded-full border border-emerald-500/20" />
        <div className="absolute inset-16 rounded-full border border-emerald-500/20" />

        <div className="radar-sweep absolute inset-0" />

        <svg
          viewBox="0 0 300 300"
          className="absolute inset-0 h-full w-full opacity-70"
        >
          {/* silhouette simplifiée du Cameroun */}
          <path
            d="M170 35
               L195 55
               L210 95
               L200 125
               L220 165
               L205 230
               L175 270
               L145 245
               L135 200
               L110 170
               L105 125
               L125 95
               L135 55
               Z"
            fill="currentColor"
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-4 animate-pulse rounded-full bg-emerald-400" />
        </div>
      </div>

      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">
          {scan.name}
        </h1>

        <p className="text-muted-foreground">
          Initialisation du scan...
        </p>

        <div className="flex justify-center gap-6 text-sm">
          <span>
            Status: {scan.status}
          </span>

          <span>
            Assets: {scan.assetsDiscovered}
          </span>

          <span>
            Progress: {scan.progress}%
          </span>
        </div>
      </div>
    </div>
  )
}