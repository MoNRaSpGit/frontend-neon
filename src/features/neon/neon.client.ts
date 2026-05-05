import { API_BASE_URL } from "../../shared/config/api";
import { fetchWithAuth } from "../auth/auth.client";
import {
  NeonAccount,
  NeonAccountsResponse,
  NeonActivitiesResponse,
  NeonActivity,
  NeonCategoriesResponse,
  NeonCategory,
  NeonClient,
  NeonClientsResponse,
  NeonExpense,
  NeonExpensesResponse,
  NeonStatus
} from "./neon.types";

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export async function getNeonStatus(): Promise<NeonStatus> {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/v1/neon/status`);
  if (!response.ok) {
    throw new Error("No se pudo cargar el estado de neon");
  }
  return readJson<NeonStatus>(response);
}

export async function listNeonClients(): Promise<NeonClient[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/v1/neon/clients?limit=100`);
  if (!response.ok) {
    throw new Error("No se pudieron cargar los clientes");
  }

  const payload = await readJson<NeonClientsResponse>(response);
  return payload.items;
}

export async function listNeonAccounts(): Promise<NeonAccount[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/v1/neon/accounts`);
  if (!response.ok) {
    throw new Error("No se pudieron cargar las cuentas");
  }

  const payload = await readJson<NeonAccountsResponse>(response);
  return payload.items;
}

export async function listNeonCategories(): Promise<NeonCategory[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/v1/neon/categories?movementType=expense`);
  if (!response.ok) {
    throw new Error("No se pudieron cargar las categorias");
  }

  const payload = await readJson<NeonCategoriesResponse>(response);
  return payload.items;
}

export async function createNeonClient(input: { name: string; phone?: string; notes?: string }) {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/v1/neon/clients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  const payload = await readJson<{ item?: NeonClient; message?: string }>(response);
  if (!response.ok || !payload.item) {
    throw new Error(payload.message || "No se pudo crear el cliente");
  }

  return payload.item;
}

export async function createNeonCategory(input: {
  name: string;
  movementType?: "income" | "expense";
  classification?: "empresa" | "personal";
}) {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/v1/neon/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  const payload = await readJson<{ item?: NeonCategory; message?: string }>(response);
  if (!response.ok || !payload.item) {
    throw new Error(payload.message || "No se pudo crear la categoria");
  }

  return payload.item;
}

export async function listNeonActivities(): Promise<NeonActivity[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/v1/neon/activities?limit=100`);
  if (!response.ok) {
    throw new Error("No se pudieron cargar las actividades");
  }

  const payload = await readJson<NeonActivitiesResponse>(response);
  return payload.items;
}

export async function getNeonActivity(activityId: number): Promise<NeonActivity> {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/v1/neon/activities/${activityId}`);
  const payload = await readJson<{ item?: NeonActivity; message?: string }>(response);
  if (!response.ok || !payload.item) {
    throw new Error(payload.message || "No se pudo cargar la actividad");
  }

  return payload.item;
}

export async function listNeonExpenses(): Promise<NeonExpense[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/v1/neon/expenses`);
  if (!response.ok) {
    throw new Error("No se pudieron cargar los gastos");
  }

  const payload = await readJson<NeonExpensesResponse>(response);
  return payload.items;
}

export async function createNeonActivity(input: {
  activityDate: string;
  description: string;
  clientId?: number;
  activityType: "neon" | "movil_audiovisual" | "otros";
  quotedAmount: number;
  commercialStatus?: "pendiente_de_facturar" | "facturado" | "pendiente_de_cobrar" | "cobrado";
}) {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/v1/neon/activities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  const payload = await readJson<{ item?: NeonActivity; message?: string }>(response);
  if (!response.ok || !payload.item) {
    throw new Error(payload.message || "No se pudo crear la actividad");
  }

  return payload.item;
}

export async function createNeonExpense(input: {
  accountId: number;
  categoryId: number;
  expenseDate: string;
  totalAmount: number;
  description?: string;
  destinationType: "activity" | "personal" | "vehicle" | "other";
  destinationActivityId?: number;
  destinationLabel?: string;
}) {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/v1/neon/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  const payload = await readJson<{ item?: NeonExpense; message?: string }>(response);
  if (!response.ok || !payload.item) {
    throw new Error(payload.message || "No se pudo registrar el gasto");
  }

  return payload.item;
}

export async function createNeonActivityPayment(
  activityId: number,
  input: {
    accountId: number;
    paymentDate: string;
    paidAmount: number;
    description?: string;
  }
) {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/v1/neon/activities/${activityId}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  const payload = await readJson<{ item?: NeonActivity; message?: string }>(response);
  if (!response.ok || !payload.item) {
    throw new Error(payload.message || "No se pudo registrar el pago");
  }

  return payload.item;
}
