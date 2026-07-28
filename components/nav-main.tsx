"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { ChevronRightIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { ACCENT_COLORS, type NavAccent } from "@/constants/sidebar-links"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
    isActive?: boolean
    accent?: NavAccent
    items?: { title: string; url: string }[]
  }[]
}) {
  const pathname = usePathname()
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/"

  // Correspondance EXACTE pour les feuilles (top-level sans enfants, et
  // sous-items) — sinon "/scans" reste actif dès qu'on est sur "/scans/new".
  const isExactActive = (url: string) => pathWithoutLocale === url

  // Correspondance par préfixe, réservée à la détection "un des enfants
  // est actif" pour savoir si le groupe parent doit s'ouvrir/se colorer.
  const isPrefixActive = (url: string) =>
    pathWithoutLocale === url || pathWithoutLocale.startsWith(url + "/")

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>

      <SidebarMenu>
        {items.map((item) => {
          const hasChildren = item.items && item.items.length > 0
          const colors = ACCENT_COLORS[item.accent ?? "violet"]

          if (!hasChildren) {
            const active = isExactActive(item.url)
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={active}
                  className={cn(
                    "border-l-2 border-l-transparent",
                    active && `${colors.activeBg} ${colors.activeBorder}`
                  )}
                >
                  <Link href={item.url}>
                    <span className={active ? colors.icon : ""}>{item.icon}</span>
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          const groupActive = item.items!.some((sub) => isExactActive(sub.url))

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={groupActive || item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={groupActive}
                    className={cn(
                      "border-l-2 border-l-transparent",
                      groupActive && `${colors.activeBg} ${colors.activeBorder}`
                    )}
                  >
                    <span className={groupActive ? colors.icon : ""}>{item.icon}</span>
                    <span>{item.title}</span>
                    <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const subActive = isExactActive(subItem.url)
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={subActive}
                            className={cn(subActive && `${colors.activeBg} ${colors.icon}`)}
                          >
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}