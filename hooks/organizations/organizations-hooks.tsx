import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getOrganizations,
  getOrganization,
  getOrganizationAssets,
  getOrganizationScans,
  getOrganizationStats,
  createOrganization,
  updateOrganization,
  deleteOrganization,
} from "@/services/organizations/organizations-service"

export function useOrganizations(page: number, limit: number, search: string) {
  return useQuery({
    queryKey: ["organizations", page, limit, search],
    queryFn: () => getOrganizations(page, limit, search),
  })
}

export function useOrganization(organizationId: string) {
  return useQuery({
    queryKey: ["organizations", organizationId],
    queryFn: () => getOrganization(organizationId),
    enabled: !!organizationId,
  })
}

export function useOrganizationAssets(organizationId: string) {
  return useQuery({
    queryKey: ["organizations", organizationId, "assets"],
    queryFn: () => getOrganizationAssets(organizationId),
    enabled: !!organizationId,
  })
}

export function useOrganizationScans(organizationId: string) {
  return useQuery({
    queryKey: ["organizations", organizationId, "scans"],
    queryFn: () => getOrganizationScans(organizationId),
    enabled: !!organizationId,
  })
}

export function useOrganizationStats(organizationId: string) {
  return useQuery({
    queryKey: ["organizations", organizationId, "stats"],
    queryFn: () => getOrganizationStats(organizationId),
    enabled: !!organizationId,
  })
}

export function useCreateOrganization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => createOrganization(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] })
    },
  })
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ organizationId, payload }: { organizationId: string; payload: Record<string, unknown> }) =>
      updateOrganization(organizationId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] })
      queryClient.invalidateQueries({ queryKey: ["organizations", variables.organizationId] })
    },
  })
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (organizationId: string) => deleteOrganization(organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] })
    },
  })
}