"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { ACCENT_COLORS, type NavAccent } from "@/constants/sidebar-links"

export function NavAdministration({
  items,
}: {
  items: {
    name: string
    url: string
    icon: React.ReactNode
    accent?: NavAccent
  }[]
}) {
  const pathname = usePathname()
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/"
  const isExactActive = (url: string) => pathWithoutLocale === url

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Administration</SidebarGroupLabel>

      <SidebarMenu>
        {items.map((item) => {
          const active = isExactActive(item.url)
          const colors = ACCENT_COLORS[item.accent ?? "violet"]

          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild
                isActive={active}
                className={cn(
                  "border-l-2 border-l-transparent",
                  active && `${colors.activeBg} ${colors.activeBorder}`
                )}
              >
                <Link href={item.url}>
                  <span className={active ? colors.icon : ""}>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}