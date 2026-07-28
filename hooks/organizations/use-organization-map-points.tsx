import { useQuery } from "@tanstack/react-query"
import { getOrganizationMapPoints } from "@/services/organizations/get-organization-map-points"

export function useOrganizationMapPoints() {
  return useQuery({
    queryKey: ["organizations", "map"],
    queryFn: getOrganizationMapPoints,
  })
}