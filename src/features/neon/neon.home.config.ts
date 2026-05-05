export const ACTIVITY_TYPE_OPTIONS = [
  { value: "neon", label: "Neon" },
  { value: "movil_audiovisual", label: "Movil audiovisual" },
  { value: "otros", label: "Otros" }
] as const;

export type ClientFormState = {
  name: string;
  phone: string;
  notes: string;
};

export type ActivityFormState = {
  activityDate: string;
  description: string;
  clientId: string;
  activityType: "neon" | "movil_audiovisual" | "otros";
  quotedAmount: string;
  commercialStatus: "pendiente_de_facturar" | "facturado" | "pendiente_de_cobrar" | "cobrado";
};

export type PaymentFormState = {
  accountId: string;
  paymentDate: string;
  paidAmount: string;
  description: string;
};

export type ExpenseFormState = {
  accountId: string;
  categoryScope: "empresa" | "personal";
  expenseDate: string;
  totalAmount: string;
  description: string;
};

export type NeonSectionKey = "activities" | "income" | "expenses" | "accounts";

export type ExpenseActivitySummary = {
  key: string;
  activityId: number | null;
  activityLabel: string;
  clientLabel: string;
  totalAmount: number;
  latestMovementDate: string;
  expenseDescriptions: string[];
  expensesCount: number;
};

export const COLORS = {
  pageTopGlow: "rgba(32, 43, 59, 0.16)",
  pageSideGlow: "rgba(79, 93, 117, 0.14)",
  pageBase: "#ece7de",
  pageBaseEnd: "#e3ddd2",
  ink: "#1d2430",
  inkSoft: "#495364",
  inkMuted: "#697383",
  border: "#c7beb0",
  borderSoft: "#d9d1c4",
  panel: "#f8f4ec",
  panelAlt: "#f2ede4",
  activityAccent: "#274257",
  activityBg: "linear-gradient(180deg, #e6ecef 0%, #d6dde1 100%)",
  incomeAccent: "#355448",
  incomeBg: "linear-gradient(180deg, #e8eee9 0%, #d7e0d9 100%)",
  expenseAccent: "#6f4f31",
  expenseBg: "linear-gradient(180deg, #f0e7dc 0%, #e1d2bf 100%)",
  accountAccent: "#4b435d",
  accountBg: "linear-gradient(180deg, #e8e4ec 0%, #d8d1df 100%)",
  button: "#2c3543",
  buttonText: "#f6f1e8",
  tagBg: "#e2e7ea"
} as const;
