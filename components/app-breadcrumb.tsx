"use client"

import Link from "next/link"
import {
  usePathname,
  useSearchParams,
} from "next/navigation"

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
  scans: "Scans",
}

const isId = (segment: string) => {
  return (
    /^\d+$/.test(segment) ||
    /^[0-9a-fA-F]{24}$/.test(segment) ||
    /^[0-9a-fA-F-]{36}$/.test(segment)
  )
}

export function AppBreadcrumb() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations("Workspace")

  const title = searchParams.get("title")

  const pathSegments = pathname
    .split("/")
    .filter(Boolean)
    .filter(
      (segment) =>
        !LOCALES.includes(segment)
    )
    .filter((segment) => !isId(segment))

  const segments = title
    ? [...pathSegments, title]
    : pathSegments

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">
              {t("home")}
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map(
          (segment, index) => {
            const isLast =
              index ===
              segments.length - 1

            const href =
              "/" +
              segments
                .slice(0, index + 1)
                .join("/")

            const label =
              segmentLabels[
                segment
              ] ??
              decodeURIComponent(
                segment
              )
                .replace(/-/g, " ")
                .replace(
                  /\b\w/g,
                  (char) =>
                    char.toUpperCase()
                )

            return (
              <div
                key={`${href}-${index}`}
                className="flex items-center"
              >
                <BreadcrumbSeparator />

                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>
                      {label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={href}>
                        {label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            )
          }
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}