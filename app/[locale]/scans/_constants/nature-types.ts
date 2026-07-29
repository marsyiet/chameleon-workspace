import {
  Globe, Server, Database, Terminal, Cloud, KeyRound,
  Network, ShieldAlert, HardDrive, Radio,
} from "lucide-react"

export const NATURE_LABEL: Record<string, string> = {
  web_application: "Application web",
  api: "API",
  database: "Base de données",
  remote_access: "Accès distant",
  mail_server: "Serveur mail",
  dns_server: "Serveur DNS",
  file_transfer: "Transfert de fichiers",
  vpn_gateway: "Passerelle VPN",
  firewall_router: "Routeur / pare-feu",
  industrial_control: "Système industriel",
  authentication_portal: "Portail d'authentification",
  network_device_generic: "Équipement réseau",
  unknown: "Non identifié",
}

export const NATURE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  web_application: Globe,
  api: Server,
  database: Database,
  remote_access: Terminal,
  mail_server: Cloud,
  dns_server: Radio,
  file_transfer: HardDrive,
  vpn_gateway: ShieldAlert,
  firewall_router: ShieldAlert,
  industrial_control: HardDrive,
  authentication_portal: KeyRound,
  network_device_generic: Network,
  unknown: Server,
}

// Libellés courts pour les natureTags cumulatifs (technologies/rôles détectés
// en plus de la nature dominante) — affichés en minuscule, capitalisés à l'usage.
export const TAG_LABEL_OVERRIDES: Record<string, string> = {
  api: "API",
  cms: "CMS",
  "reverse-proxy": "Reverse proxy",
  authentication: "Authentification",
  web: "Site web",
  "network-device": "Équipement réseau",
}

export function formatNatureTag(tag: string): string {
  return TAG_LABEL_OVERRIDES[tag] ?? tag.charAt(0).toUpperCase() + tag.slice(1)
}