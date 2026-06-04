"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

import { data } from "@/constants/sidebar-links"
import { NavCampaigns } from "./nav-campaigns"
import { NavAdministration } from "./nav-administraion"

export function AppSidebar(
  props: React.ComponentProps<typeof Sidebar>
) {
  const sidebarData = data()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={sidebarData.navMain} />
        <NavCampaigns campaigns={sidebarData.campaigns} />
        <NavAdministration items={sidebarData.administration} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}