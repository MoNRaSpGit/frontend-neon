export type ClientFormState = {
  name: string;
  phone: string;
  notes: string;
};

export type AccountFormState = {
  name: string;
  accountType: "cash" | "bank";
  openingBalance: string;
};

export type ActivityFormState = {
  activityDate: string;
  description: string;
  clientId: string;
  activityType: "neon" | "movil_audiovisual" | "otros";
  quotedAmount: string;
  commercialStatus: "pendiente_de_facturar" | "facturado" | "pendiente_de_cobrar" | "cobrado";
};

export type JournalAllocationFormState = {
  destinationType: "" | "activity" | "vehicle" | "personal" | "other";
  destinationActivityId: string;
  destinationLabel: string;
  amount: string;
  kilometers: string;
  liters: string;
};

export type JournalFormState = {
  movementType: "income" | "expense";
  movementDate: string;
  accountId: string;
  totalAmount: string;
  description: string;
  allocations: JournalAllocationFormState[];
};
