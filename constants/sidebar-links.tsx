import {
  LayoutDashboardIcon,
  RadarIcon,
  ServerIcon,
  NetworkIcon,
  CpuIcon,
  ShieldCheckIcon,
  GlobeIcon,
  SearchIcon,
  UsersIcon,
  ClipboardListIcon,
  Settings2Icon,
  KeyRoundIcon,
} from "lucide-react"

export const data = () => {
  return {
    user: {
      name: "Admin",
      email: "admin@chameleon.io",
      avatar: "/globe.svg",
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
        title: "Search",
        url: "/search",
        icon: <SearchIcon />,
      },

      {
        title: "Dashboard",
        url: "/",
        icon: <LayoutDashboardIcon />,
      },

      {
        title: "Discovery",
        url: "/scans",
        icon: <RadarIcon />,
        items: [
          {
            title: "All Scans",
            url: "/scans",
          },
          {
            title: "New Scan",
            url: "/scans/new",
          },
          {
            title: "Scheduled Scans",
            url: "/scans/scheduled",
          },
        ],
      },

      {
        title: "Assets",
        url: "/assets",
        icon: <ServerIcon />,
        items: [
          {
            title: "All Assets",
            url: "/assets",
          },
          {
            title: "IP Addresses",
            url: "/assets/ip-addresses",
          },
          {
            title: "Domains",
            url: "/assets/domains",
          },
          {
            title: "Hosts",
            url: "/assets/hosts",
          },
        ],
      },

      {
        title: "Services",
        url: "/services",
        icon: <NetworkIcon />,
        items: [
          {
            title: "Open Ports",
            url: "/services/ports",
          },
          {
            title: "Detected Services",
            url: "/services",
          },
          {
            title: "HTTP Services",
            url: "/services/http",
          },
        ],
      },

      {
        title: "Technologies",
        url: "/technologies",
        icon: <CpuIcon />,
      },

      {
        title: "Attack Surface",
        url: "/attack-surface",
        icon: <GlobeIcon />,
      },
    ],

    campaigns: [
      {
        name: "External Attack Surface",
        url: "/campaigns/1",
        icon: <RadarIcon />,
      },
      {
        name: "Corporate Network",
        url: "/campaigns/2",
        icon: <NetworkIcon />,
      },
      {
        name: "Cloud Assets",
        url: "/campaigns/3",
        icon: <ServerIcon />,
      },
    ],

    administration: [
      {
        name: "Users",
        url: "/users",
        icon: <UsersIcon />,
      },

      {
        name: "Roles",
        url: "/roles",
        icon: <KeyRoundIcon />,
      },

      {
        name: "Audit Logs",
        url: "/audit-logs",
        icon: <ClipboardListIcon />,
      },

      {
        name: "Settings",
        url: "/settings",
        icon: <Settings2Icon />,
      },
    ],

  }
}