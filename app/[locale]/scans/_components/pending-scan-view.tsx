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
        <div className="absolute inset-0 rounded-full border border-primary/20" />
        <div className="absolute inset-8 rounded-full border border-primary/20" />
        <div className="absolute inset-16 rounded-full border border-primary/20" />
        <div className="radar-sweep absolute inset-0" />
        <svg
          viewBox="0 0 300 300"
          className="absolute inset-0 h-full w-full text-muted-foreground/40"
        >
          {/* Silhouette du Cameroun — contour réel (Natural Earth, simplifié) */}
          <path
            d="M127.9 263.8 L94.8 261.6 L97.4 239.6 L91.1 233.8 L95.0 231.8 L90.8 232.4 L89.0 227.6 L93.4 227.6 L93.8 224.6 L90.6 224.6 L93.6 220.7 L89.8 223.4 L87.5 221.2 L88.7 223.9 L84.6 225.5 L84.2 223.0 L76.4 221.5 L73.7 209.7 L72.4 211.8 L69.5 207.5 L71.0 212.5 L66.4 212.2 L72.7 198.3 L73.7 183.6 L102.1 157.9 L103.6 160.7 L109.8 160.8 L111.6 155.2 L121.6 163.7 L123.0 170.1 L126.4 170.5 L139.9 156.3 L137.0 152.3 L146.9 137.0 L147.7 127.7 L151.5 125.3 L150.8 122.8 L160.1 118.9 L161.4 106.0 L168.9 102.4 L169.6 91.4 L174.1 89.1 L181.1 70.2 L186.1 64.5 L190.1 65.3 L200.0 58.7 L201.1 44.8 L190.6 40.5 L187.9 25.1 L195.6 25.0 L198.6 31.9 L204.4 34.7 L206.1 45.3 L209.4 46.8 L211.4 81.0 L223.3 92.6 L190.4 92.9 L185.3 100.0 L209.5 122.1 L220.7 140.7 L203.4 173.0 L194.9 179.1 L200.0 182.9 L197.8 195.4 L200.9 198.2 L202.2 210.1 L212.5 222.3 L208.9 223.1 L210.2 226.2 L232.2 248.6 L233.6 273.6 L231.8 275.0 L223.8 268.9 L206.0 267.3 L198.8 262.9 L171.0 263.9 L168.2 261.2 L135.2 260.4 L128.5 260.9 L127.9 263.8 Z"
            fill="currentColor"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-4 animate-pulse rounded-full bg-primary" />
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