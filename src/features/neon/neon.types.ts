export type NeonStatus = {
  module: "neon";
  tenant: {
    id: number;
    name: string;
    slug: string;
  };
  user: {
    id: number;
    email: string;
    membershipRole: string;
  };
  backend: {
    database: "connected";
    currentTimestamp: string;
  };
  phase: "shell";
};

export type NeonClient = {
  id: number;
  tenantId: number;
  name: string;
  phone: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NeonAccount = {
  id: number;
  tenantId: number;
  name: string;
  accountType: "cash" | "bank";
  openingBalance: number;
  currentBalance: number;
  createdAt: string;
  updatedAt: string;
};

export type NeonJournalAllocation = {
  id: number;
  destinationType: "activity" | "vehicle" | "personal" | "other";
  destinationActivityId: number | null;
  destinationActivityCode: string | null;
  destinationActivityDescription: string | null;
  destinationLabel: string | null;
  amount: number;
  metadata: Record<string, unknown> | null;
};

export type NeonJournalAllocationInput = {
  destinationType: "activity" | "vehicle" | "personal" | "other";
  destinationActivityId?: number;
  destinationLabel?: string;
  amount: number;
  kilometers?: number;
  liters?: number;
};

export type NeonJournalEntry = {
  id: number;
  tenantId: number;
  movementType: "income" | "expense";
  movementDate: string;
  accountId: number;
  accountName: string;
  totalAmount: number;
  description: string | null;
  sourceType: "activity" | "independent";
  sourceActivityId: number | null;
  sourceActivityCode: string | null;
  sourceActivityDescription: string | null;
  allocations: NeonJournalAllocation[];
  createdAt: string;
  updatedAt: string;
};

export type NeonCategory = {
  id: number;
  tenantId: number;
  name: string;
  movementType: "income" | "expense";
  classification: "empresa" | "personal";
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NeonActivityPayment = {
  id: number;
  tenantId: number;
  activityId: number;
  movementId: number;
  accountId: number;
  accountName: string;
  paymentDate: string;
  paidAmount: number;
  description: string | null;
  createdAt: string;
};

export type NeonActivity = {
  id: number;
  tenantId: number;
  activityNumber: number;
  activityYear: number;
  activityDate: string;
  description: string;
  clientId: number | null;
  clientName: string | null;
  activityType: "neon" | "movil_audiovisual" | "otros";
  commercialStatus: "pendiente_de_facturar" | "facturado" | "pendiente_de_cobrar" | "cobrado";
  quotedAmount: number;
  collectedAmount: number;
  pendingAmount: number;
  payments?: NeonActivityPayment[];
  createdAt: string;
  updatedAt: string;
};

export type NeonExpense = {
  id: number;
  tenantId: number;
  movementDate: string;
  accountId: number;
  accountName: string;
  categoryId: number;
  categoryName: string;
  categoryClassification: "empresa" | "personal";
  totalAmount: number;
  description: string | null;
  destinationType: "activity" | "personal" | "vehicle" | "other";
  destinationActivityId: number | null;
  destinationActivityCode: string | null;
  destinationActivityDescription: string | null;
  destinationLabel: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NeonClientsResponse = {
  items: NeonClient[];
  meta: {
    tenantId: number;
    count: number;
    limit: number;
  };
};

export type NeonAccountsResponse = {
  items: NeonAccount[];
  meta: {
    tenantId: number;
    count: number;
  };
};

export type NeonJournalResponse = {
  items: NeonJournalEntry[];
  meta: {
    tenantId: number;
    count: number;
    limit: number;
  };
};

export type NeonCategoriesResponse = {
  items: NeonCategory[];
  meta: {
    tenantId: number;
    count: number;
  };
};

export type NeonActivitiesResponse = {
  items: NeonActivity[];
  meta: {
    tenantId: number;
    count: number;
    limit: number;
  };
};

export type NeonExpensesResponse = {
  items: NeonExpense[];
  meta: {
    tenantId: number;
    count: number;
  };
};
