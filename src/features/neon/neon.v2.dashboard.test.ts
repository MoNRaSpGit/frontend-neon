import { describe, expect, it, vi } from "vitest";
import { buildCommercialSummaryByCompany, buildDashboardSummary } from "./neon.v2.dashboard";
import { NeonAccount, NeonActivity, NeonCreditEntry, NeonJournalEntry } from "./neon.types";

function createAccount(input: Partial<NeonAccount> & Pick<NeonAccount, "id" | "name" | "accountType">): NeonAccount {
  return {
    id: input.id,
    tenantId: 1,
    name: input.name,
    accountType: input.accountType,
    openingBalance: 0,
    dueDate: input.dueDate ?? null,
    currentBalance: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  };
}

function createEntry(input: Partial<NeonJournalEntry> & Pick<NeonJournalEntry, "id" | "movementType" | "movementDate" | "accountId" | "accountName" | "totalAmount">): NeonJournalEntry {
  return {
    id: input.id,
    tenantId: 1,
    companyKey: input.companyKey ?? "empresa_verde",
    movementType: input.movementType,
    movementDate: input.movementDate,
    accountId: input.accountId,
    accountName: input.accountName,
    totalAmount: input.totalAmount,
    description: input.description ?? null,
    providerId: input.providerId ?? null,
    providerName: input.providerName ?? null,
    documentRef: input.documentRef ?? null,
    quantity: input.quantity ?? null,
    unitLabel: input.unitLabel ?? null,
    currencyCode: input.currencyCode ?? "UYU",
    expenseKind: input.expenseKind ?? null,
    creditCardLabel: input.creditCardLabel ?? null,
    dueDate: input.dueDate ?? null,
    sourceType: input.sourceType ?? "independent",
    sourceActivityId: input.sourceActivityId ?? null,
    sourceActivityCode: input.sourceActivityCode ?? null,
    sourceActivityDescription: input.sourceActivityDescription ?? null,
    allocations: input.allocations ?? [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  };
}

function createActivity(input: Partial<NeonActivity> & Pick<NeonActivity, "id" | "activityNumber" | "activityYear" | "description" | "quotedAmount">): NeonActivity {
  return {
    id: input.id,
    tenantId: 1,
    companyKey: input.companyKey ?? "empresa_verde",
    activityNumber: input.activityNumber,
    activityYear: input.activityYear,
    activityDate: input.activityDate ?? "2026-05-01",
    description: input.description,
    clientId: input.clientId ?? null,
    clientName: input.clientName ?? null,
    activityType: input.activityType ?? "neon",
    commercialStatus: input.commercialStatus ?? "pendiente_de_facturar",
    quotedAmount: input.quotedAmount,
    invoiceDate: input.invoiceDate ?? null,
    invoicedAmount: input.invoicedAmount ?? null,
    invoiceCompanyKey: input.invoiceCompanyKey ?? null,
    collectedAmount: input.collectedAmount ?? 0,
    pendingAmount: input.pendingAmount ?? input.quotedAmount,
    payments: input.payments ?? [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  };
}

function createCreditEntry(
  input: Partial<NeonCreditEntry> &
    Pick<NeonCreditEntry, "id" | "supplierId" | "supplierName" | "creditKind" | "creditDate" | "dueDate" | "totalAmount" | "pendingAmount">
): NeonCreditEntry {
  return {
    id: input.id,
    tenantId: 1,
    companyKey: input.companyKey ?? "empresa_verde",
    supplierId: input.supplierId,
    supplierName: input.supplierName,
    creditKind: input.creditKind,
    creditDate: input.creditDate,
    dueDate: input.dueDate,
    totalAmount: input.totalAmount,
    pendingAmount: input.pendingAmount,
    description: input.description ?? null,
    documentRef: input.documentRef ?? null,
    currencyCode: input.currencyCode ?? "UYU",
    allocations: input.allocations ?? [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  };
}

describe("buildDashboardSummary debt and settlements", () => {
  it("builds pending debt from supplier credit entries and payment settlements", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-06T12:00:00.000Z"));

    const accounts: NeonAccount[] = [createAccount({ id: 1, name: "Caja", accountType: "cash" })];
    const creditEntries: NeonCreditEntry[] = [
      createCreditEntry({
        id: 101,
        supplierId: 10,
        supplierName: "UTE",
        creditKind: "bill",
        creditDate: "2026-05-01",
        dueDate: "2026-05-10",
        totalAmount: 1000,
        pendingAmount: 400
      }),
      createCreditEntry({
        id: 102,
        supplierId: 10,
        supplierName: "UTE",
        creditKind: "bill",
        creditDate: "2026-05-03",
        dueDate: "2026-05-15",
        totalAmount: 700,
        pendingAmount: 700
      })
    ];
    const journalEntries: NeonJournalEntry[] = [
      createEntry({
        id: 201,
        movementType: "expense",
        movementDate: "2026-05-05",
        accountId: 1,
        accountName: "Caja",
        totalAmount: 600,
        providerId: 10,
        providerName: "UTE",
        description: "Pago parcial UTE",
        expenseKind: "credit_settlement"
      })
    ];

    const summary = buildDashboardSummary(accounts, [], journalEntries, creditEntries, "all");

    expect(summary.pendingDebtAmount).toBe(1100);
    expect(summary.pendingDebtCount).toBe(2);
    expect(summary.pendingDebtByCard[0]).toMatchObject({
      label: "UTE",
      amount: 1100,
      count: 2
    });
    expect(summary.recentCardSettlements[0]).toMatchObject({
      cardLabel: "UTE",
      totalAmount: 600,
      sourceAccountName: "Caja"
    });

    vi.useRealTimers();
  });

  it("keeps fully paid supplier debts visible in settled payments", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-06T12:00:00.000Z"));

    const accounts: NeonAccount[] = [createAccount({ id: 1, name: "Caja", accountType: "cash" })];
    const creditEntries: NeonCreditEntry[] = [
      createCreditEntry({
        id: 111,
        supplierId: 10,
        supplierName: "Cococola",
        creditKind: "purchase",
        creditDate: "2026-05-01",
        dueDate: "2026-05-10",
        totalAmount: 700,
        pendingAmount: 0
      })
    ];
    const journalEntries: NeonJournalEntry[] = [
      createEntry({
        id: 211,
        movementType: "expense",
        movementDate: "2026-05-20",
        accountId: 1,
        accountName: "Caja",
        totalAmount: 500,
        providerId: 10,
        providerName: "Cococola",
        description: "Pago 1",
        expenseKind: "credit_settlement"
      }),
      createEntry({
        id: 212,
        movementType: "expense",
        movementDate: "2026-05-21",
        accountId: 1,
        accountName: "Caja",
        totalAmount: 200,
        providerId: 10,
        providerName: "Cococola",
        description: "Pago 2",
        expenseKind: "credit_settlement"
      })
    ];

    const summary = buildDashboardSummary(accounts, [], journalEntries, creditEntries, "settled");

    expect(summary.settledDebtCount).toBe(1);
    expect(summary.settledDebtAmount).toBe(700);
    expect(summary.settledDebtEntries).toHaveLength(1);
    expect(summary.paymentReportCount).toBe(1);
    expect(summary.paymentReportAmount).toBe(700);
    expect(summary.paymentReportEntries).toHaveLength(1);
    expect(summary.paymentReportEntries[0]?.appliedPayments).toHaveLength(2);
    expect(summary.pendingDebtEntries[0]).toMatchObject({
      providerName: "Cococola",
      originalAmount: 700,
      paidAmount: 700,
      pendingAmount: 0
    });
    expect(summary.pendingDebtEntries[0]?.appliedPayments).toHaveLength(2);

    vi.useRealTimers();
  });

  it("filters payment report entries by the selected report period", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-27T12:00:00.000Z"));

    const accounts: NeonAccount[] = [createAccount({ id: 1, name: "Caja", accountType: "cash" })];
    const creditEntries: NeonCreditEntry[] = [
      createCreditEntry({
        id: 121,
        supplierId: 20,
        supplierName: "UTE",
        creditKind: "bill",
        creditDate: "2026-04-01",
        dueDate: "2026-04-10",
        totalAmount: 1000,
        pendingAmount: 0
      })
    ];
    const journalEntries: NeonJournalEntry[] = [
      createEntry({
        id: 221,
        movementType: "expense",
        movementDate: "2026-04-20",
        accountId: 1,
        accountName: "Caja",
        totalAmount: 500,
        providerId: 20,
        providerName: "UTE",
        description: "Pago abril",
        expenseKind: "credit_settlement"
      }),
      createEntry({
        id: 222,
        movementType: "expense",
        movementDate: "2026-05-03",
        accountId: 1,
        accountName: "Caja",
        totalAmount: 500,
        providerId: 20,
        providerName: "UTE",
        description: "Pago mayo",
        expenseKind: "credit_settlement"
      })
    ];

    const summary = buildDashboardSummary(accounts, [], journalEntries, creditEntries, "all", {
      range: "all",
      dateFrom: "2026-04-01",
      dateTo: "2026-04-30"
    });

    expect(summary.paymentReportCount).toBe(1);
    expect(summary.paymentReportAmount).toBe(500);
    expect(summary.paymentReportEntries).toHaveLength(1);
    expect(summary.paymentReportEntries[0]).toMatchObject({
      providerName: "UTE",
      originalAmount: 1000,
      pendingAmount: 0
    });
    expect(summary.paymentReportEntries[0]?.appliedPayments).toEqual([
      expect.objectContaining({
        paymentDate: "2026-04-20",
        amount: 500,
        sourceAccountName: "Caja"
      })
    ]);

    vi.useRealTimers();
  });

  it("keeps partially paid debts out of pagos realizados while they still have balance", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-27T12:00:00.000Z"));

    const accounts: NeonAccount[] = [createAccount({ id: 1, name: "Caja", accountType: "cash" })];
    const creditEntries: NeonCreditEntry[] = [
      createCreditEntry({
        id: 131,
        supplierId: 30,
        supplierName: "El Trigal",
        creditKind: "purchase",
        creditDate: "2026-05-01",
        dueDate: "2026-05-30",
        totalAmount: 1800,
        pendingAmount: 800
      })
    ];
    const journalEntries: NeonJournalEntry[] = [
      createEntry({
        id: 231,
        movementType: "expense",
        movementDate: "2026-05-04",
        accountId: 1,
        accountName: "Caja",
        totalAmount: 1000,
        providerId: 30,
        providerName: "El Trigal",
        description: "Pago parcial",
        expenseKind: "credit_settlement"
      })
    ];

    const summary = buildDashboardSummary(accounts, [], journalEntries, creditEntries, "all", {
      range: "all",
      dateFrom: "2026-05-01",
      dateTo: "2026-05-31"
    });

    expect(summary.pendingDebtEntries).toHaveLength(1);
    expect(summary.pendingDebtEntries[0]).toMatchObject({
      providerName: "El Trigal",
      pendingAmount: 800,
      paidAmount: 1000
    });
    expect(summary.paymentReportCount).toBe(0);
    expect(summary.paymentReportAmount).toBe(0);
    expect(summary.paymentReportEntries).toHaveLength(0);

    vi.useRealTimers();
  });

  it("nets credit settlements against card purchases and keeps only pending balances", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-06T12:00:00.000Z"));

    const accounts: NeonAccount[] = [
      createAccount({ id: 1, name: "Caja", accountType: "cash" }),
      createAccount({ id: 2, name: "Visa", accountType: "credit" })
    ];
    const activities: NeonActivity[] = [];
    const journalEntries: NeonJournalEntry[] = [
      createEntry({
        id: 11,
        movementType: "expense",
        movementDate: "2026-05-01",
        accountId: 2,
        accountName: "Visa",
        totalAmount: 1000,
        creditCardLabel: "Visa",
        dueDate: "2026-05-10",
        providerName: "Ancap",
        expenseKind: "operational"
      }),
      createEntry({
        id: 12,
        movementType: "expense",
        movementDate: "2026-05-02",
        accountId: 2,
        accountName: "Visa",
        totalAmount: 500,
        creditCardLabel: "Visa",
        dueDate: "2026-05-15",
        providerName: "Tienda",
        expenseKind: "operational"
      }),
      createEntry({
        id: 13,
        movementType: "expense",
        movementDate: "2026-05-05",
        accountId: 1,
        accountName: "Caja",
        totalAmount: 700,
        creditCardLabel: "Visa",
        description: "Pago resumen Visa",
        expenseKind: "credit_settlement"
      })
    ];

    const summary = buildDashboardSummary(accounts, activities, journalEntries, "all");

    expect(summary.pendingDebtAmount).toBe(800);
    expect(summary.pendingDebtCount).toBe(2);
    expect(summary.pendingDebtEntries[0]?.pendingAmount).toBe(300);
    expect(summary.pendingDebtEntries[1]?.pendingAmount).toBe(500);
    expect(summary.cardDebtSummaries[0]).toMatchObject({
      cardLabel: "Visa",
      pendingAmount: 800,
      pendingCount: 2
    });
    expect(summary.recentCardSettlements[0]).toMatchObject({
      cardLabel: "Visa",
      totalAmount: 700,
      sourceAccountName: "Caja"
    });

    vi.useRealTimers();
  });

  it("filters overdue debt correctly", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-06T12:00:00.000Z"));

    const accounts: NeonAccount[] = [createAccount({ id: 2, name: "Visa", accountType: "credit" })];
    const journalEntries: NeonJournalEntry[] = [
      createEntry({
        id: 21,
        movementType: "expense",
        movementDate: "2026-05-01",
        accountId: 2,
        accountName: "Visa",
        totalAmount: 400,
        creditCardLabel: "Visa",
        dueDate: "2026-05-04",
        providerName: "Proveedor 1",
        expenseKind: "operational"
      }),
      createEntry({
        id: 22,
        movementType: "expense",
        movementDate: "2026-05-03",
        accountId: 2,
        accountName: "Visa",
        totalAmount: 600,
        creditCardLabel: "Visa",
        dueDate: "2026-05-20",
        providerName: "Proveedor 2",
        expenseKind: "operational"
      })
    ];

    const summary = buildDashboardSummary(accounts, [], journalEntries, "overdue");

    expect(summary.overdueDebtAmount).toBe(400);
    expect(summary.pendingDebtEntries).toHaveLength(1);
    expect(summary.pendingDebtEntries[0]?.movementId).toBe(21);

    vi.useRealTimers();
  });

  it("builds account and activity reports from journal allocations", () => {
    const accounts: NeonAccount[] = [
      createAccount({ id: 1, name: "Caja", accountType: "cash", currentBalance: 1200 } as NeonAccount),
      createAccount({ id: 2, name: "Banco", accountType: "bank", currentBalance: 2800 } as NeonAccount)
    ];
    accounts[0].openingBalance = 1000;
    accounts[0].currentBalance = 1200;
    accounts[1].openingBalance = 2000;
    accounts[1].currentBalance = 2800;

    const activities: NeonActivity[] = [
      createActivity({
        id: 31,
        activityNumber: 7,
        activityYear: 2026,
        description: "Carteleria feria",
        quotedAmount: 2000,
        clientName: "Cliente Demo",
        collectedAmount: 1500,
        pendingAmount: 500
      })
    ];

    const journalEntries: NeonJournalEntry[] = [
      createEntry({
        id: 31,
        movementType: "income",
        movementDate: "2026-05-01",
        accountId: 2,
        accountName: "Banco",
        totalAmount: 1500,
        allocations: [
          {
            id: 1,
            destinationType: "activity",
            destinationActivityId: 31,
            destinationActivityCode: "#7/2026",
            destinationActivityDescription: "Carteleria feria",
            destinationLabel: null,
            amount: 1500,
            metadata: null
          }
        ]
      }),
      createEntry({
        id: 32,
        movementType: "expense",
        movementDate: "2026-05-02",
        accountId: 1,
        accountName: "Caja",
        totalAmount: 300,
        expenseKind: "operational",
        allocations: [
          {
            id: 2,
            destinationType: "activity",
            destinationActivityId: 31,
            destinationActivityCode: "#7/2026",
            destinationActivityDescription: "Carteleria feria",
            destinationLabel: null,
            amount: 300,
            metadata: null
          }
        ]
      })
    ];

    const summary = buildDashboardSummary(accounts, activities, journalEntries, "all");

    expect(summary.accountReports.find((item) => item.accountId === 1)).toMatchObject({
      expenseAmount: 300,
      incomeAmount: 0,
      currentBalance: 1200
    });
    expect(summary.accountReports.find((item) => item.accountId === 2)).toMatchObject({
      incomeAmount: 1500,
      expenseAmount: 0,
      currentBalance: 2800
    });
    expect(summary.activityResults[0]).toMatchObject({
      activityId: 31,
      incomeAmount: 1500,
      expenseAmount: 300,
      resultAmount: 1200,
      pendingAmount: 500
    });
    expect(summary.commercialQuotedAmount).toBe(2000);
    expect(summary.commercialCollectedAmount).toBe(1500);
    expect(summary.commercialPendingAmount).toBe(500);
    expect(summary.commercialCollectionRate).toBe(75);
  });

  it("filters report period for account and activity reports", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-06T12:00:00.000Z"));

    const accounts: NeonAccount[] = [
      createAccount({ id: 1, name: "Caja", accountType: "cash" }),
      createAccount({ id: 2, name: "Banco", accountType: "bank" })
    ];
    const activities: NeonActivity[] = [
      createActivity({
        id: 41,
        activityNumber: 8,
        activityYear: 2026,
        description: "Pantalla evento",
        quotedAmount: 1800
      })
    ];
    const journalEntries: NeonJournalEntry[] = [
      createEntry({
        id: 41,
        movementType: "income",
        movementDate: "2026-05-06",
        accountId: 2,
        accountName: "Banco",
        totalAmount: 900,
        allocations: [
          {
            id: 10,
            destinationType: "activity",
            destinationActivityId: 41,
            destinationActivityCode: "#8/2026",
            destinationActivityDescription: "Pantalla evento",
            destinationLabel: null,
            amount: 900,
            metadata: null
          }
        ]
      }),
      createEntry({
        id: 42,
        movementType: "expense",
        movementDate: "2026-05-01",
        accountId: 1,
        accountName: "Caja",
        totalAmount: 200,
        expenseKind: "operational",
        allocations: [
          {
            id: 11,
            destinationType: "activity",
            destinationActivityId: 41,
            destinationActivityCode: "#8/2026",
            destinationActivityDescription: "Pantalla evento",
            destinationLabel: null,
            amount: 200,
            metadata: null
          }
        ]
      })
    ];

    const summary = buildDashboardSummary(accounts, activities, journalEntries, "all", {
      range: "today",
      dateFrom: "",
      dateTo: ""
    });

    expect(summary.accountReports.find((item) => item.accountId === 2)?.incomeAmount).toBe(900);
    expect(summary.accountReports.find((item) => item.accountId === 1)?.expenseAmount).toBe(0);
    expect(summary.activityResults[0]).toMatchObject({
      incomeAmount: 900,
      expenseAmount: 0,
      resultAmount: 900
    });
    expect(summary.reportIncomeAmount).toBe(900);
    expect(summary.reportExpenseAmount).toBe(0);
    expect(summary.reportNetFlowAmount).toBe(900);

    vi.useRealTimers();
  });

  it("uses custom report date range when from/to are provided", () => {
    const accounts: NeonAccount[] = [
      createAccount({ id: 1, name: "Caja", accountType: "cash" }),
      createAccount({ id: 2, name: "Banco", accountType: "bank" })
    ];
    const activities: NeonActivity[] = [
      createActivity({
        id: 51,
        activityNumber: 9,
        activityYear: 2026,
        description: "Escenario",
        quotedAmount: 2500
      })
    ];
    const journalEntries: NeonJournalEntry[] = [
      createEntry({
        id: 51,
        movementType: "income",
        movementDate: "2026-05-02",
        accountId: 2,
        accountName: "Banco",
        totalAmount: 700,
        allocations: [
          {
            id: 21,
            destinationType: "activity",
            destinationActivityId: 51,
            destinationActivityCode: "#9/2026",
            destinationActivityDescription: "Escenario",
            destinationLabel: null,
            amount: 700,
            metadata: null
          }
        ]
      }),
      createEntry({
        id: 52,
        movementType: "expense",
        movementDate: "2026-05-10",
        accountId: 1,
        accountName: "Caja",
        totalAmount: 300,
        expenseKind: "operational"
      })
    ];

    const summary = buildDashboardSummary(accounts, activities, journalEntries, "all", {
      range: "all",
      dateFrom: "2026-05-01",
      dateTo: "2026-05-05"
    });

    expect(summary.accountReports.find((item) => item.accountId === 2)?.incomeAmount).toBe(700);
    expect(summary.accountReports.find((item) => item.accountId === 1)?.expenseAmount).toBe(0);
    expect(summary.activityResults[0]?.incomeAmount).toBe(700);
    expect(summary.reportIncomeAmount).toBe(700);
    expect(summary.reportExpenseAmount).toBe(0);
    expect(summary.profitableActivitiesCount).toBe(1);
  });

  it("groups pending collection and invoiced totals by commercial company", () => {
    const activities: NeonActivity[] = [
      createActivity({
        id: 61,
        activityNumber: 10,
        activityYear: 2026,
        description: "Pantalla principal",
        quotedAmount: 3000,
        commercialStatus: "facturado",
        invoiceDate: "2026-05-02",
        invoicedAmount: 3000,
        invoiceCompanyKey: "empresa_verde",
        collectedAmount: 1200,
        pendingAmount: 1800
      }),
      createActivity({
        id: 62,
        activityNumber: 11,
        activityYear: 2026,
        description: "Movil apoyo",
        quotedAmount: 1800,
        commercialStatus: "facturado",
        invoiceDate: "2026-03-10",
        invoicedAmount: 1800,
        invoiceCompanyKey: "empresa_negra",
        collectedAmount: 1800,
        pendingAmount: 0
      }),
      createActivity({
        id: 63,
        activityNumber: 12,
        activityYear: 2026,
        description: "Trabajo a definir",
        quotedAmount: 900,
        commercialStatus: "pendiente_de_facturar",
        invoiceCompanyKey: null,
        collectedAmount: 0,
        pendingAmount: 900
      })
    ];

    const empresaA = buildCommercialSummaryByCompany(activities, "empresa_verde", 2026);
    const empresaB = buildCommercialSummaryByCompany(activities, "empresa_negra", 2026);
    const empresaC = buildCommercialSummaryByCompany(activities, "empresa_c", 2026);

    expect(empresaA).toMatchObject({
      pendingCollectionCount: 1,
      pendingCollectionAmount: 1800,
      invoicedThisYearCount: 1,
      invoicedThisYearAmount: 3000
    });
    expect(empresaB).toMatchObject({
      pendingCollectionCount: 0,
      pendingCollectionAmount: 0,
      invoicedThisYearCount: 1,
      invoicedThisYearAmount: 1800
    });
    expect(empresaC).toMatchObject({
      pendingCollectionCount: 0,
      pendingCollectionAmount: 0,
      invoicedThisYearCount: 0,
      invoicedThisYearAmount: 0
    });
  });
});
