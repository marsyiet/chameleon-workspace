import {
  LayoutDashboardIcon,
  RadarIcon,
  ServerIcon,
  NetworkIcon,
  ShieldCheckIcon,
  SearchIcon,
  UsersIcon,
  ClipboardListIcon,
  Settings2Icon,
  KeyRoundIcon,
  MapIcon,
  BugIcon,
  FileBarChart2Icon,
  ShieldAlertIcon,
  Share2Icon,
  WorkflowIcon,
  EyeIcon,
  BellIcon,
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
        title: "Cartographie",
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
          {
            title: "Inventaire",
            url: "/scans/inventory",
          },
        ],
      },
      {
        title: "Surveillance",
        url: "/surveillance",
        icon: <EyeIcon />,
        items: [
          {
            title: "Threat Intelligence",
            url: "/threat-intel",
          },
          {
            title: "Alertes & Changements",
            url: "/surveillance/alerts",
          },
        ],
      },
      {
        title: "Gestion des risques",
        url: "/risk",
        icon: <ShieldAlertIcon />,
        items: [
          {
            title: "Vulnerabilities",
            url: "/vulnerabilities",
          },
          {
            title: "Reports",
            url: "/reports",
          },
          {
            title: "Remediation",
            url: "/remediation",
          },
          {
            title: "Firewall Integrations",
            url: "/integrations/firewall",
          },
        ],
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