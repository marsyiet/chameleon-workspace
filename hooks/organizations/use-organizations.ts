// hooks/organizations/use-organizations.ts
import { useQuery } from "@tanstack/react-query"
import { getOrganizations } from "@/services/organizations/get-organizations"

export function useOrganizations() {
  return useQuery({
    queryKey: ["organizations", "all"],
    queryFn: getOrganizations,
  })
}