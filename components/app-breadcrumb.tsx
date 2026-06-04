"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useTranslations } from "next-intl"

const LOCALES = ["fr", "en"]

const segmentLabels: Record<string, string> = {
  dashboard: "Dashboard",
  settings: "Paramètres",
  users: "Utilisateurs",
  organizations: "Organisations",
  profile: "Profil",
}

export function AppBreadcrumb() {
  const pathname = usePathname()
  const t = useTranslations("Workspace")

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .filter((segment) => !LOCALES.includes(segment))

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">{t("home")}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/")
          const isLast = index === segments.length - 1

          const label =
            segmentLabels[segment] ??
            decodeURIComponent(segment)
              .replace(/-/g, " ")
              .replace(/\b\w/g, (char) => char.toUpperCase())

          return (
            <div key={href} className="flex items-center">
              <BreadcrumbSeparator />

              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}