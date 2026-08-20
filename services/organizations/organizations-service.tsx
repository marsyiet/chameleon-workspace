import { api } from "@/lib/axios"

export async function getOrganizations(page: number, limit: number, search?: string) {
  const res = await api.get("/organizations", {
    params: { page, limit, search: search || undefined },
  })
  return res.data
}

export async function getOrganization(organizationId: string) {
  const res = await api.get(`/organizations/${organizationId}`)
  return res.data
}

export async function getOrganizationAssets(organizationId: string) {
  const res = await api.get(`/organizations/${organizationId}/assets`)
  return res.data
}

export async function getOrganizationScans(organizationId: string) {
  const res = await api.get(`/organizations/${organizationId}/scans`)
  return res.data
}

export async function getOrganizationStats(organizationId: string) {
  const res = await api.get(`/organizations/${organizationId}/stats`)
  return res.data
}

export async function createOrganization(payload: Record<string, unknown>) {
  const res = await api.post("/organizations", payload)
  return res.data
}

export async function updateOrganization(organizationId: string, payload: Record<string, unknown>) {
  const res = await api.put(`/organizations/${organizationId}`, payload)
  return res.data
}

export async function deleteOrganization(organizationId: string) {
  const res = await api.delete(`/organizations/${organizationId}`)
  return res.data
}