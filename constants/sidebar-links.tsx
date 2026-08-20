import {
  LayoutDashboardIcon,
  RadarIcon,
  EyeIcon,
  ShieldAlertIcon,
  UsersIcon,
  KeyRoundIcon,
  ClipboardListIcon,
  Settings2Icon,
  ShieldCheckIcon,
  Building2,
} from "lucide-react"

export type NavAccent = "violet" | "teal" | "amber" | "rose"

export const ACCENT_COLORS: Record<NavAccent, { icon: string; activeBg: string; activeBorder: string }> = {
  violet: {
    icon: "text-[oklch(0.58_0.26_290)]",
    activeBg: "bg-[oklch(0.58_0.26_290_/_0.18)]",
    activeBorder: "border-l-[oklch(0.58_0.26_290)]",
  },
  teal: {
    icon: "text-[oklch(0.60_0.14_180)]",
    activeBg: "bg-[oklch(0.60_0.14_180_/_0.18)]",
    activeBorder: "border-l-[oklch(0.60_0.14_180)]",
  },
  amber: {
    icon: "text-[oklch(0.68_0.16_70)]",
    activeBg: "bg-[oklch(0.68_0.16_70_/_0.18)]",
    activeBorder: "border-l-[oklch(0.68_0.16_70)]",
  },
  rose: {
    icon: "text-[oklch(0.62_0.21_10)]",
    activeBg: "bg-[oklch(0.62_0.21_10_/_0.18)]",
    activeBorder: "border-l-[oklch(0.62_0.21_10)]",
  },
}

export const data = () => {
  return {
    user: {
      name: "Admin",
      email: "admin@chameleon.io",
      avatar: "/images/avatar.jpg",
    },
    teams: [
      {
        name: "Chameleon",
        logo: <ShieldCheckIcon />,
        plan: "Enterprise",
      },
    ],
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: <LayoutDashboardIcon />,
        accent: "violet" as NavAccent,
      },
      {
        title: "Cartographie",
        url: "/scans",
        icon: <RadarIcon />,
        accent: "teal" as NavAccent,
        items: [
          { title: "Inventaire", url: "/scans/inventory" },
          { title: "Tous les scans", url: "/scans" },
          { title: "Nouveau scan", url: "/scans/new" },
          { title: "Programmation des scans", url: "/scans/scheduled" },
        ],
      },
      {
        title: "Surveillance",
        url: "/surveillance",
        icon: <EyeIcon />,
        accent: "amber" as NavAccent,
        items: [
          { title: "Threat Intelligence", url: "/threat-intel" },
          { title: "Alertes & Changements", url: "/changes" },
        ],
      },
      {
        title: "Gestion des risques",
        url: "/risk",
        icon: <ShieldAlertIcon />,
        accent: "rose" as NavAccent,
        items: [
          { title: "Rapports", url: "/reports" },
        ],
      },
    ],
    administration: [
      { name: "Organizations", url: "/organizations", icon: <Building2 />, accent: "violet" as NavAccent },
      { name: "Roles", url: "/roles", icon: <KeyRoundIcon />, accent: "teal" as NavAccent },
      { name: "Logs d'audit", url: "/audit-logs", icon: <ClipboardListIcon />, accent: "amber" as NavAccent },
    ],
  }
}