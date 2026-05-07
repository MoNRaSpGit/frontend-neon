import {
  NeonAccount,
  NeonActivity,
  NeonCategory,
  NeonClient,
  NeonExpense,
  NeonJournalAllocation,
  NeonJournalAllocationInput,
  NeonJournalEntry,
  NeonStatus
} from "./neon.types";

const DEMO_TENANT = {
  id: 1,
  name: "Neon Demo",
  slug: "neon-demo"
} as const;

const DEMO_USER = {
  id: 1,
  email: "neon.demo@saaspro.com",
  membershipRole: "admin"
} as const;

type MutableAccount = Omit<NeonAccount, "currentBalance">;
type MutableActivity = Omit<NeonActivity, "collectedAmount" | "pendingAmount" | "payments">;
type JournalCreationInput = {
  companyKey?: "empresa_verde" | "empresa_negra";
  movementType: "income" | "expense";
  movementDate: string;
  accountId: number;
  totalAmount: number;
  description?: string;
  expenseKind?: "operational" | "credit_settlement";
  providerName?: string;
  documentRef?: string;
  quantity?: number;
  unitLabel?: string;
  currencyCode?: "UYU" | "USD";
  creditCardLabel?: string;
  dueDate?: string;
  costCenterType?: "activity" | "vehicle" | "personal" | "rental" | "other";
  destinationActivityId?: number;
  destinationLabel?: string;
  kilometers?: number;
  liters?: number;
  allocations?: NeonJournalAllocationInput[];
};
type ExpenseCreationInput = {
  destinationType: "activity" | "personal" | "vehicle" | "rental" | "other";
  destinationActivityId?: number;
  destinationLabel?: string;
  totalAmount: number;
};

const demoNow = "2026-05-06T21:30:00.000-03:00";
const DEMO_STORAGE_KEY = "neon-demo-workspace-v2";

const seedClients: NeonClient[] = [
  {
    id: 1,
    tenantId: DEMO_TENANT.id,
    name: "Claudia Ferre",
    phone: "099 111 222",
    notes: "Cliente piloto Neon",
    createdAt: "2026-05-02T10:00:00.000-03:00",
    updatedAt: "2026-05-02T10:00:00.000-03:00"
  },
  {
    id: 2,
    tenantId: DEMO_TENANT.id,
    name: "Hotel Rambla",
    phone: "098 222 333",
    notes: "Eventos y alquileres",
    createdAt: "2026-05-02T10:05:00.000-03:00",
    updatedAt: "2026-05-02T10:05:00.000-03:00"
  },
  {
    id: 3,
    tenantId: DEMO_TENANT.id,
    name: "Carlos Pereira",
    phone: "097 444 555",
    notes: null,
    createdAt: "2026-05-02T10:10:00.000-03:00",
    updatedAt: "2026-05-02T10:10:00.000-03:00"
  }
];

const seedAccounts: MutableAccount[] = [
  {
    id: 1,
    tenantId: DEMO_TENANT.id,
    name: "Caja $",
    accountType: "cash",
    openingBalance: 15000,
    createdAt: "2026-05-02T09:00:00.000-03:00",
    updatedAt: "2026-05-02T09:00:00.000-03:00"
  },
  {
    id: 2,
    tenantId: DEMO_TENANT.id,
    name: "BROU $",
    accountType: "bank",
    openingBalance: 42000,
    createdAt: "2026-05-02T09:02:00.000-03:00",
    updatedAt: "2026-05-02T09:02:00.000-03:00"
  },
  {
    id: 3,
    tenantId: DEMO_TENANT.id,
    name: "BBVA $",
    accountType: "bank",
    openingBalance: 18000,
    createdAt: "2026-05-02T09:04:00.000-03:00",
    updatedAt: "2026-05-02T09:04:00.000-03:00"
  },
  {
    id: 4,
    tenantId: DEMO_TENANT.id,
    name: "ITAU U$S",
    accountType: "bank",
    openingBalance: 0,
    createdAt: "2026-05-02T09:06:00.000-03:00",
    updatedAt: "2026-05-02T09:06:00.000-03:00"
  },
  {
    id: 5,
    tenantId: DEMO_TENANT.id,
    name: "Credito",
    accountType: "credit",
    openingBalance: 0,
    createdAt: "2026-05-02T09:08:00.000-03:00",
    updatedAt: "2026-05-02T09:08:00.000-03:00"
  }
];

const seedCategories: NeonCategory[] = [
  {
    id: 1,
    tenantId: DEMO_TENANT.id,
    name: "Otros",
    movementType: "expense",
    classification: "empresa",
    isSystem: true,
    createdAt: "2026-05-02T09:20:00.000-03:00",
    updatedAt: "2026-05-02T09:20:00.000-03:00"
  },
  {
    id: 2,
    tenantId: DEMO_TENANT.id,
    name: "Gastos personales",
    movementType: "expense",
    classification: "personal",
    isSystem: true,
    createdAt: "2026-05-02T09:21:00.000-03:00",
    updatedAt: "2026-05-02T09:21:00.000-03:00"
  }
];

const seedActivities: MutableActivity[] = [
  {
    id: 1,
    tenantId: DEMO_TENANT.id,
    companyKey: "empresa_verde",
    activityNumber: 14,
    activityYear: 2026,
    activityDate: "2026-05-03",
    description: "Pantalla LED feria de invierno",
    clientId: 1,
    clientName: "Claudia Ferre",
    activityType: "neon",
    commercialStatus: "pendiente_de_cobrar",
    quotedAmount: 18500,
    invoiceDate: "2026-05-04",
    invoicedAmount: 18500,
    invoiceCompanyKey: "empresa_verde",
    createdAt: "2026-05-03T11:00:00.000-03:00",
    updatedAt: "2026-05-03T11:00:00.000-03:00"
  },
  {
    id: 2,
    tenantId: DEMO_TENANT.id,
    companyKey: "empresa_negra",
    activityNumber: 15,
    activityYear: 2026,
    activityDate: "2026-05-04",
    description: "Movil audiovisual corporativo",
    clientId: 2,
    clientName: "Hotel Rambla",
    activityType: "movil_audiovisual",
    commercialStatus: "pendiente_de_facturar",
    quotedAmount: 26000,
    invoiceDate: null,
    invoicedAmount: null,
    invoiceCompanyKey: null,
    createdAt: "2026-05-04T09:30:00.000-03:00",
    updatedAt: "2026-05-04T09:30:00.000-03:00"
  },
  {
    id: 3,
    tenantId: DEMO_TENANT.id,
    companyKey: "empresa_negra",
    activityNumber: 16,
    activityYear: 2026,
    activityDate: "2026-05-05",
    description: "Alquiler estructura ALQ1",
    clientId: 3,
    clientName: "Carlos Pereira",
    activityType: "otros",
    commercialStatus: "facturado",
    quotedAmount: 9800,
    invoiceDate: "2026-05-05",
    invoicedAmount: 9800,
    invoiceCompanyKey: "empresa_negra",
    createdAt: "2026-05-05T12:10:00.000-03:00",
    updatedAt: "2026-05-05T12:10:00.000-03:00"
  }
];

const seedJournalEntries: NeonJournalEntry[] = [
  {
    id: 1,
    tenantId: DEMO_TENANT.id,
    companyKey: "empresa_verde",
    movementType: "income",
    movementDate: "2026-05-05",
    accountId: 2,
    accountName: "BROU $",
    totalAmount: 12000,
    description: "Seña actividad feria",
    providerName: null,
    documentRef: null,
    quantity: null,
    unitLabel: null,
    currencyCode: null,
    expenseKind: null,
    creditCardLabel: null,
    dueDate: null,
    sourceType: "activity",
    sourceActivityId: 1,
    sourceActivityCode: "#14/2026",
    sourceActivityDescription: "Pantalla LED feria de invierno",
    allocations: [
      {
        id: 1,
        destinationType: "activity",
        destinationActivityId: 1,
        destinationActivityCode: "#14/2026",
        destinationActivityDescription: "Pantalla LED feria de invierno",
        destinationLabel: null,
        amount: 12000,
        metadata: null
      }
    ],
    createdAt: "2026-05-05T19:45:00.000-03:00",
    updatedAt: "2026-05-05T19:45:00.000-03:00"
  },
  {
    id: 2,
    tenantId: DEMO_TENANT.id,
    companyKey: "empresa_verde",
    movementType: "expense",
    movementDate: "2026-05-05",
    accountId: 1,
    accountName: "Caja $",
    totalAmount: 3400,
    description: "Compra materiales y traslado",
    providerName: "Barraca Central",
    documentRef: "FC-2081",
    quantity: 1,
    unitLabel: "servicio",
    currencyCode: "UYU",
    expenseKind: "operational",
    creditCardLabel: null,
    dueDate: null,
    sourceType: "independent",
    sourceActivityId: null,
    sourceActivityCode: null,
    sourceActivityDescription: null,
    allocations: [
      {
        id: 2,
        destinationType: "activity",
        destinationActivityId: 1,
        destinationActivityCode: "#14/2026",
        destinationActivityDescription: "Pantalla LED feria de invierno",
        destinationLabel: null,
        amount: 2100,
        metadata: null
      },
      {
        id: 3,
        destinationType: "vehicle",
        destinationActivityId: null,
        destinationActivityCode: null,
        destinationActivityDescription: null,
        destinationLabel: "Toyota RAA1111",
        amount: 1300,
        metadata: {
          kilometers: 86,
          liters: 12
        }
      }
    ],
    createdAt: "2026-05-05T20:10:00.000-03:00",
    updatedAt: "2026-05-05T20:10:00.000-03:00"
  },
  {
    id: 3,
    tenantId: DEMO_TENANT.id,
    companyKey: "empresa_negra",
    movementType: "expense",
    movementDate: "2026-05-06",
    accountId: 5,
    accountName: "Credito",
    totalAmount: 7800,
    description: "Combustible y viaticos",
    providerName: "Estacion Delta",
    documentRef: "TK-9912",
    quantity: 2,
    unitLabel: "ticket",
    currencyCode: "UYU",
    expenseKind: "operational",
    creditCardLabel: "Visa Itau",
    dueDate: "2026-05-07",
    sourceType: "independent",
    sourceActivityId: null,
    sourceActivityCode: null,
    sourceActivityDescription: null,
    allocations: [
      {
        id: 4,
        destinationType: "vehicle",
        destinationActivityId: null,
        destinationActivityCode: null,
        destinationActivityDescription: null,
        destinationLabel: "Micro SAH2222",
        amount: 5200,
        metadata: {
          kilometers: 210,
          liters: 46
        }
      },
      {
        id: 5,
        destinationType: "personal",
        destinationActivityId: null,
        destinationActivityCode: null,
        destinationActivityDescription: null,
        destinationLabel: "Casa",
        amount: 2600,
        metadata: null
      }
    ],
    createdAt: "2026-05-06T20:05:00.000-03:00",
    updatedAt: "2026-05-06T20:05:00.000-03:00"
  },
  {
    id: 4,
    tenantId: DEMO_TENANT.id,
    companyKey: "empresa_verde",
    movementType: "income",
    movementDate: "2026-05-06",
    accountId: 3,
    accountName: "BBVA $",
    totalAmount: 9800,
    description: "Ingreso alquiler ALQ1",
    providerName: null,
    documentRef: null,
    quantity: null,
    unitLabel: null,
    currencyCode: null,
    expenseKind: null,
    creditCardLabel: null,
    dueDate: null,
    sourceType: "independent",
    sourceActivityId: null,
    sourceActivityCode: null,
    sourceActivityDescription: null,
    allocations: [
      {
        id: 6,
        destinationType: "rental",
        destinationActivityId: null,
        destinationActivityCode: null,
        destinationActivityDescription: null,
        destinationLabel: "ALQ1",
        amount: 9800,
        metadata: null
      }
    ],
    createdAt: "2026-05-06T21:05:00.000-03:00",
    updatedAt: "2026-05-06T21:05:00.000-03:00"
  }
];

let clientsStore = clone(seedClients);
let accountsStore = clone(seedAccounts);
let categoriesStore = clone(seedCategories);
let activitiesStore = clone(seedActivities).map(normalizeActivity);
let journalStore = clone(seedJournalEntries).map(normalizeJournalEntry);

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function getFallbackCompanyKeyFromActivityType(_activityType: MutableActivity["activityType"]) {
  return "empresa_verde";
}

function normalizeActivity(activity: MutableActivity): MutableActivity {
  return {
    ...activity,
    companyKey: activity.companyKey || getFallbackCompanyKeyFromActivityType(activity.activityType),
    invoiceDate: activity.invoiceDate || null,
    invoicedAmount: typeof activity.invoicedAmount === "number" ? activity.invoicedAmount : null,
    invoiceCompanyKey: activity.invoiceCompanyKey || null
  };
}

function normalizeJournalEntry(entry: NeonJournalEntry): NeonJournalEntry {
  let inferredCompanyKey = entry.companyKey;

  if (!inferredCompanyKey) {
    const relatedActivityIds = [
      entry.sourceActivityId,
      ...entry.allocations
        .filter((allocation) => allocation.destinationType === "activity")
        .map((allocation) => allocation.destinationActivityId)
    ].filter((activityId): activityId is number => typeof activityId === "number");

    const relatedActivity = relatedActivityIds
      .map((activityId) => activitiesStore.find((activity) => activity.id === activityId))
      .find(Boolean);

    inferredCompanyKey = relatedActivity?.companyKey || "empresa_verde";
  }

  return {
    ...entry,
    companyKey: inferredCompanyKey
  };
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function persistStores() {
  if (!canUseStorage()) {
    return;
  }

  const snapshot = {
    clients: clientsStore,
    accounts: accountsStore,
    categories: categoriesStore,
    activities: activitiesStore,
    journal: journalStore
  };

  window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(snapshot));
}

function restoreStores() {
  if (!canUseStorage()) {
    return;
  }

  const rawSnapshot = window.localStorage.getItem(DEMO_STORAGE_KEY);
  if (!rawSnapshot) {
    return;
  }

  try {
    const snapshot = JSON.parse(rawSnapshot) as Partial<{
      clients: NeonClient[];
      accounts: MutableAccount[];
      categories: NeonCategory[];
      activities: MutableActivity[];
      journal: NeonJournalEntry[];
    }>;

    if (
      Array.isArray(snapshot.clients) &&
      Array.isArray(snapshot.accounts) &&
      Array.isArray(snapshot.categories) &&
      Array.isArray(snapshot.activities) &&
      Array.isArray(snapshot.journal)
    ) {
      clientsStore = clone(snapshot.clients);
      accountsStore = clone(snapshot.accounts);
      categoriesStore = clone(snapshot.categories);
      activitiesStore = clone(snapshot.activities).map(normalizeActivity);
      journalStore = clone(snapshot.journal).map(normalizeJournalEntry);
      persistStores();
    }
  } catch {
    window.localStorage.removeItem(DEMO_STORAGE_KEY);
  }
}

restoreStores();

function nowIso() {
  return new Date().toISOString();
}

function nextId(items: Array<{ id: number }>) {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

function getAccountName(accountId: number) {
  const account = accountsStore.find((item) => item.id === accountId);
  if (!account) {
    throw new Error("Cuenta no encontrada en demo");
  }

  return account.name;
}

function getActivityReference(activityId: number) {
  const activity = activitiesStore.find((item) => item.id === activityId);
  if (!activity) {
    throw new Error("Actividad no encontrada en demo");
  }

  return {
    activityId: activity.id,
    code: `#${activity.activityNumber}/${activity.activityYear}`,
    description: activity.description
  };
}

function getActivityCompanyKey(activityId: number) {
  const activity = activitiesStore.find((item) => item.id === activityId);
  if (!activity) {
    throw new Error("Actividad no encontrada en demo");
  }

  return activity.companyKey;
}

function buildAllocations(
  input: Pick<
    JournalCreationInput,
    "allocations" | "costCenterType" | "destinationActivityId" | "destinationLabel" | "liters" | "kilometers"
  > | ExpenseCreationInput,
  totalAmount: number
) {
  let normalizedAllocations: Array<
    NeonJournalAllocationInput & {
      kilometers?: number;
      liters?: number;
    }
  > = [];

  if ("allocations" in input) {
    normalizedAllocations =
      input.allocations && input.allocations.length > 0
        ? input.allocations
        : input.costCenterType
          ? [
              {
                destinationType: input.costCenterType,
                destinationActivityId: input.destinationActivityId,
                destinationLabel: input.destinationLabel,
                amount: totalAmount,
                kilometers: input.kilometers,
                liters: input.liters
              }
            ]
          : [];
  } else {
    const expenseInput = input as ExpenseCreationInput;
    normalizedAllocations = [
      {
        destinationType: expenseInput.destinationType,
        destinationActivityId: expenseInput.destinationActivityId,
        destinationLabel: expenseInput.destinationLabel,
        amount: expenseInput.totalAmount,
        kilometers: undefined,
        liters: undefined
      }
    ];
  }

  const startingAllocationId =
    journalStore.reduce((max, entry) => {
      return Math.max(max, ...entry.allocations.map((allocation) => allocation.id));
    }, 0) + 1;

  return normalizedAllocations.map<NeonJournalAllocation>((allocation, index) => {
    const activityReference =
      allocation.destinationType === "activity" && allocation.destinationActivityId
        ? getActivityReference(allocation.destinationActivityId)
        : null;

    return {
      id: startingAllocationId + index,
      destinationType: allocation.destinationType,
      destinationActivityId: activityReference?.activityId || null,
      destinationActivityCode: activityReference?.code || null,
      destinationActivityDescription: activityReference?.description || null,
      destinationLabel: activityReference ? null : allocation.destinationLabel?.trim() || null,
      amount: Number(allocation.amount.toFixed(2)),
      metadata:
        allocation.destinationType === "vehicle"
          ? {
              kilometers: allocation.kilometers ?? null,
              liters: allocation.liters ?? null
            }
          : null
    };
  });
}

function deriveAccounts(): NeonAccount[] {
  return accountsStore.map((account) => {
    const relatedEntries = journalStore.filter((entry) => entry.accountId === account.id);
    const currentBalance = relatedEntries.reduce((sum, entry) => {
      return sum + (entry.movementType === "income" ? entry.totalAmount : -entry.totalAmount);
    }, account.openingBalance);

    return {
      ...account,
      currentBalance: Number(currentBalance.toFixed(2))
    };
  });
}

function deriveActivities(): NeonActivity[] {
  return activitiesStore.map((activity) => {
    const collectedAmount = journalStore.reduce((sum, entry) => {
      if (entry.movementType !== "income") {
        return sum;
      }

      return (
        sum +
        entry.allocations
          .filter((allocation) => allocation.destinationType === "activity" && allocation.destinationActivityId === activity.id)
          .reduce((allocationSum, allocation) => allocationSum + allocation.amount, 0)
      );
    }, 0);

    const pendingAmount = Math.max(Number((activity.quotedAmount - collectedAmount).toFixed(2)), 0);

    return {
      ...activity,
      collectedAmount: Number(collectedAmount.toFixed(2)),
      pendingAmount
    };
  });
}

function deriveExpenses(): NeonExpense[] {
  return journalStore
    .filter((entry) => entry.movementType === "expense" && entry.expenseKind !== "credit_settlement")
    .flatMap((entry) =>
      entry.allocations.map((allocation) => ({
        id: allocation.id,
        tenantId: entry.tenantId,
        movementDate: entry.movementDate,
        accountId: entry.accountId,
        accountName: entry.accountName,
        categoryId: 1,
        categoryName: "Otros",
        categoryClassification: allocation.destinationType === "personal" ? "personal" : "empresa",
        totalAmount: allocation.amount,
        description: entry.description,
        destinationType: allocation.destinationType,
        destinationActivityId: allocation.destinationActivityId,
        destinationActivityCode: allocation.destinationActivityCode,
        destinationActivityDescription: allocation.destinationActivityDescription,
        destinationLabel: allocation.destinationLabel,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt
      }))
    );
}

function filterJournalEntries(
  entries: NeonJournalEntry[],
  params?: {
    limit?: number;
    movementType?: "income" | "expense";
    accountId?: number;
    costCenterType?: "activity" | "vehicle" | "personal" | "rental" | "other";
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }
) {
  let nextEntries = [...entries];

  if (params?.movementType) {
    nextEntries = nextEntries.filter((entry) => entry.movementType === params.movementType);
  }

  if (params?.accountId) {
    nextEntries = nextEntries.filter((entry) => entry.accountId === params.accountId);
  }

  if (params?.costCenterType) {
    nextEntries = nextEntries.filter((entry) =>
      entry.allocations.some((allocation) => allocation.destinationType === params.costCenterType)
    );
  }

  if (params?.dateFrom) {
    nextEntries = nextEntries.filter((entry) => entry.movementDate >= params.dateFrom!);
  }

  if (params?.dateTo) {
    nextEntries = nextEntries.filter((entry) => entry.movementDate <= params.dateTo!);
  }

  if (params?.search?.trim()) {
    const searchTerm = params.search.trim().toLowerCase();
    nextEntries = nextEntries.filter((entry) =>
      [
        entry.description,
        entry.providerName,
        entry.documentRef,
        entry.creditCardLabel,
        entry.accountName,
        ...entry.allocations.map((allocation) => allocation.destinationLabel || allocation.destinationActivityDescription || allocation.destinationActivityCode)
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(searchTerm)
    );
  }

  nextEntries.sort((left, right) =>
    left.movementDate !== right.movementDate ? right.movementDate.localeCompare(left.movementDate) : right.id - left.id
  );

  if (params?.limit) {
    nextEntries = nextEntries.slice(0, params.limit);
  }

  return nextEntries;
}

export async function getNeonStatus(): Promise<NeonStatus> {
  return {
    module: "neon",
    tenant: { ...DEMO_TENANT },
    user: { ...DEMO_USER },
    backend: {
      database: "connected",
      currentTimestamp: demoNow
    },
    phase: "shell"
  };
}

export async function listNeonClients(): Promise<NeonClient[]> {
  return clone(clientsStore).sort((left, right) => left.name.localeCompare(right.name));
}

export async function listNeonAccounts(): Promise<NeonAccount[]> {
  return clone(deriveAccounts());
}

export async function createNeonAccount(input: {
  name: string;
  accountType: "cash" | "bank" | "credit";
  openingBalance?: number;
}) {
  const timestamp = nowIso();
  const account: MutableAccount = {
    id: nextId(accountsStore),
    tenantId: DEMO_TENANT.id,
    name: input.name.trim(),
    accountType: input.accountType,
    openingBalance: Number((input.openingBalance || 0).toFixed(2)),
    createdAt: timestamp,
    updatedAt: timestamp
  };

  accountsStore.push(account);
  persistStores();
  return deriveAccounts().find((item) => item.id === account.id)!;
}

export async function listNeonCategories(): Promise<NeonCategory[]> {
  return clone(categoriesStore);
}

export async function createNeonClient(input: { name: string; phone?: string; notes?: string }) {
  const timestamp = nowIso();
  const client: NeonClient = {
    id: nextId(clientsStore),
    tenantId: DEMO_TENANT.id,
    name: input.name.trim(),
    phone: input.phone?.trim() || null,
    notes: input.notes?.trim() || null,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  clientsStore.push(client);
  persistStores();
  return clone(client);
}

export async function createNeonCategory(input: {
  name: string;
  movementType?: "income" | "expense";
  classification?: "empresa" | "personal";
}) {
  const timestamp = nowIso();
  const category: NeonCategory = {
    id: nextId(categoriesStore),
    tenantId: DEMO_TENANT.id,
    name: input.name.trim(),
    movementType: input.movementType || "expense",
    classification: input.classification || "empresa",
    isSystem: false,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  categoriesStore.push(category);
  persistStores();
  return clone(category);
}

export async function listNeonActivities(): Promise<NeonActivity[]> {
  return clone(deriveActivities()).sort((left, right) => {
    if (left.activityDate !== right.activityDate) {
      return right.activityDate.localeCompare(left.activityDate);
    }

    return right.id - left.id;
  });
}

export async function getNeonActivity(activityId: number): Promise<NeonActivity> {
  const activity = deriveActivities().find((item) => item.id === activityId);
  if (!activity) {
    throw new Error("No se pudo cargar la actividad");
  }

  return clone(activity);
}

export async function listNeonExpenses(): Promise<NeonExpense[]> {
  return clone(deriveExpenses());
}

export async function listNeonJournal(params?: {
  limit?: number;
  movementType?: "income" | "expense";
  accountId?: number;
  costCenterType?: "activity" | "vehicle" | "personal" | "rental" | "other";
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}): Promise<NeonJournalEntry[]> {
  return clone(filterJournalEntries(journalStore, params));
}

export async function createNeonJournalEntry(input: JournalCreationInput) {
  const timestamp = nowIso();
  const allocations = buildAllocations(input, input.totalAmount);
  const sourceActivityAllocation =
    allocations.length === 1 && allocations[0].destinationType === "activity" ? allocations[0] : null;
  const relatedActivityCompanyKey =
    sourceActivityAllocation?.destinationActivityId
      ? getActivityCompanyKey(sourceActivityAllocation.destinationActivityId)
      : allocations.find((allocation) => allocation.destinationType === "activity" && allocation.destinationActivityId)
        ?.destinationActivityId
        ? getActivityCompanyKey(
            allocations.find((allocation) => allocation.destinationType === "activity" && allocation.destinationActivityId)!
              .destinationActivityId!
          )
        : null;

  const entry: NeonJournalEntry = {
    id: nextId(journalStore),
    tenantId: DEMO_TENANT.id,
    companyKey: relatedActivityCompanyKey || input.companyKey || "empresa_verde",
    movementType: input.movementType,
    movementDate: input.movementDate,
    accountId: input.accountId,
    accountName: getAccountName(input.accountId),
    totalAmount: Number(input.totalAmount.toFixed(2)),
    description: input.description?.trim() || null,
    providerName: input.providerName?.trim() || null,
    documentRef: input.documentRef?.trim() || null,
    quantity: input.quantity ?? null,
    unitLabel: input.unitLabel?.trim() || null,
    currencyCode: input.currencyCode || null,
    expenseKind: input.movementType === "expense" ? input.expenseKind || "operational" : null,
    creditCardLabel: input.creditCardLabel?.trim() || null,
    dueDate: input.dueDate || null,
    sourceType: sourceActivityAllocation ? "activity" : "independent",
    sourceActivityId: sourceActivityAllocation?.destinationActivityId || null,
    sourceActivityCode: sourceActivityAllocation?.destinationActivityCode || null,
    sourceActivityDescription: sourceActivityAllocation?.destinationActivityDescription || null,
    allocations,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  journalStore.unshift(entry);
  persistStores();
  return clone(entry);
}

export async function createNeonActivity(input: {
  activityDate: string;
  description: string;
  clientId?: number;
  companyKey: "empresa_verde" | "empresa_negra";
  activityType: "neon" | "movil_audiovisual" | "otros";
  quotedAmount: number;
  commercialStatus?: "pendiente_de_facturar" | "facturado" | "pendiente_de_cobrar" | "cobrado";
  invoiceDate?: string;
  invoicedAmount?: number;
  invoiceCompanyKey?: "empresa_verde" | "empresa_negra";
}) {
  const timestamp = nowIso();
  const activityYear = Number(input.activityDate.slice(0, 4));
  const nextNumber =
    activitiesStore
      .filter((item) => item.activityYear === activityYear)
      .reduce((max, item) => Math.max(max, item.activityNumber), 0) + 1;
  const client = input.clientId ? clientsStore.find((item) => item.id === input.clientId) : null;

  const activity: MutableActivity = {
    id: nextId(activitiesStore),
    tenantId: DEMO_TENANT.id,
    companyKey: input.companyKey,
    activityNumber: nextNumber,
    activityYear,
    activityDate: input.activityDate,
    description: input.description.trim(),
    clientId: client?.id || null,
    clientName: client?.name || null,
    activityType: input.activityType,
    commercialStatus: input.commercialStatus || "pendiente_de_facturar",
    quotedAmount: Number(input.quotedAmount.toFixed(2)),
    invoiceDate: input.invoiceDate || null,
    invoicedAmount: Number.isFinite(input.invoicedAmount) ? Number(input.invoicedAmount!.toFixed(2)) : null,
    invoiceCompanyKey: input.invoiceCompanyKey || null,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  activitiesStore.unshift(activity);
  persistStores();
  return deriveActivities().find((item) => item.id === activity.id)!;
}

export async function createNeonExpense(input: {
  accountId: number;
  categoryId: number;
  expenseDate: string;
  totalAmount: number;
  description?: string;
  companyKey?: "empresa_verde" | "empresa_negra";
  destinationType: "activity" | "personal" | "vehicle" | "rental" | "other";
  destinationActivityId?: number;
  destinationLabel?: string;
}) {
  const category = categoriesStore.find((item) => item.id === input.categoryId);
  if (!category) {
    throw new Error("No se pudo registrar el gasto");
  }

  const entry = await createNeonJournalEntry({
    companyKey: input.companyKey,
    movementType: "expense",
    movementDate: input.expenseDate,
    accountId: input.accountId,
    totalAmount: input.totalAmount,
    description: input.description,
    expenseKind: "operational",
    providerName: category.name,
    currencyCode: "UYU",
    costCenterType: input.destinationType,
    destinationActivityId: input.destinationActivityId,
    destinationLabel: input.destinationLabel
  });

  return deriveExpenses().find((expense) => expense.id === entry.allocations[0]?.id)!;
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
  const activityReference = getActivityReference(activityId);
  await createNeonJournalEntry({
    companyKey: getActivityCompanyKey(activityId),
    movementType: "income",
    movementDate: input.paymentDate,
    accountId: input.accountId,
    totalAmount: input.paidAmount,
    description: input.description || `Pago ${activityReference.code}`,
    allocations: [
      {
        destinationType: "activity",
        destinationActivityId: activityId,
        amount: input.paidAmount
      }
    ]
  });

  return getNeonActivity(activityId);
}
