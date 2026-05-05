import { API_BASE_URL } from "../../shared/config/api";
import { fetchWithAuth } from "../auth/auth.client";
import { NeonStatus } from "./neon.types";

export async function getNeonStatus(): Promise<NeonStatus> {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/v1/neon/status`);
  if (!response.ok) {
    throw new Error("No se pudo cargar el estado de neon");
  }
  return (await response.json()) as NeonStatus;
}
