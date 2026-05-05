import { API_BASE_URL } from "../../shared/config/api";
import { fetchWithAuth } from "../auth/auth.client";
import { SaasAdminTenantListResponse } from "./saas-admin.types";

export async function listSaasAdminTenants() {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/v1/saas-admin/tenants`);
  if (!response.ok) {
    throw new Error("No se pudo cargar SaaS Admin");
  }
  return (await response.json()) as SaasAdminTenantListResponse;
}
