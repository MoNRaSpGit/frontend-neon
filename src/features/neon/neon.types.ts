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

export type NeonActivitiesResponse = {
  items: NeonActivity[];
  meta: {
    tenantId: number;
    count: number;
    limit: number;
  };
};
