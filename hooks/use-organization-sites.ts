import { useQuery } from "@tanstack/react-query"
import { useInventoryAssets } from "@/hooks/assets/use-inventory-assets"
import { api } from "@/lib/axios"

export interface OrganizationSite {
  id: string
  name: string
  city: string | null
  lat: number | null
  lon: number | null
}

interface OrganizationSiteWithCount extends OrganizationSite {
  assetCount: number
}

async function getCurrentOrganization() {
  // Hypothèse : endpoint retournant l'organisation courante (contexte de session).
  // Adapte l'URL si ton backend expose ça différemment (ex: /organizations/:id).
  const res = await api.get("/organizations/me")
  return res.data.data as { _id: string; name: string; sites: OrganizationSite[] }
}

export function useOrganizationSites() {
  const { data: assets } = useInventoryAssets()

  return useQuery({
    queryKey: ["organizations", "me", "sites"],
    queryFn: async () => {
      const org = await getCurrentOrganization()
      const assetsArray = Array.isArray(assets) ? assets : []

      const sitesWithCount: OrganizationSiteWithCount[] = (org.sites ?? [])
        .filter((site) => site.lat !== null && site.lon !== null)
        .map((site) => ({
          ...site,
          assetCount: assetsArray.filter((a:any) => a.siteId === site.id).length,
        }))

      return { organization: org, sites: sitesWithCount }
    },
  })
}