export type ClientFormState = {
  name: string;
  phone: string;
  notes: string;
};

export type AccountFormState = {
  name: string;
  accountType: "cash" | "bank" | "credit";
  openingBalance: string;
};

export type ActivityFormState = {
  activityDate: string;
  description: string;
  clientId: string;
  activityType: "neon" | "movil_audiovisual" | "otros";
  quotedAmount: string;
  commercialStatus: "pendiente_de_facturar" | "facturado";
  invoiceDate: string;
  invoicedAmount: string;
};

export type JournalAllocationFormState = {
  destinationType: "" | "activity" | "vehicle" | "personal" | "rental" | "other";
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
  expenseKind: "operational" | "credit_settlement";
  providerName: string;
  documentRef: string;
  quantity: string;
  unitLabel: string;
  currencyCode: "" | "UYU" | "USD";
  creditCardLabel: string;
  dueDate: string;
  allocations: JournalAllocationFormState[];
};

export type DebtReportRange = "all" | "overdue" | "today" | "week" | "month";

export type ReportPeriodRange = "all" | "today" | "week" | "month";

export type ReportPeriodFilter = {
  range: ReportPeriodRange;
  dateFrom: string;
  dateTo: string;
};

export type ReportCenterScope = "all" | "activity" | "vehicle" | "personal" | "rental" | "other";

export type NeonCostCenterScope = Exclude<ReportCenterScope, "all" | "activity">;

export type NeonWorkspaceView = "idle" | "overview" | "journal" | "activities" | "reports" | "centers";

export type NeonCompanyKey = "neon" | "audiovisual";

export type CostCenterFormState = {
  editingId: string | null;
  scope: NeonCostCenterScope;
  label: string;
};

export type NeonCostCenterRecord = {
  id: string;
  companyKey: NeonCompanyKey;
  scope: NeonCostCenterScope;
  label: string;
  createdAt: string;
};

export type PendingDeleteCostCenterState = {
  id: string;
  label: string;
} | null;

export type PendingEditCostCenterState = {
  id: string;
} | null;
