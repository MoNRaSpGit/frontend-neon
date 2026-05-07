import {
  addDaysToDateInputValue,
  formatActivityCode,
  getMonthEndDateInputValue,
  getTodayDateInputValue
} from "./neon.home.helpers";
import { NeonAccount, NeonActivity, NeonJournalAllocation, NeonJournalEntry } from "./neon.types";
import { DebtReportRange, NeonCompanyKey, ReportCenterScope, ReportPeriodFilter, ReportPeriodRange } from "./neon.v2.types";

export type DashboardBucket = {
  label: string;
  amount: number;
  count: number;
};

export type PendingDebtItem = {
  movementId: number;
  movementDate: string;
  dueDate: string | null;
  accountName: string;
  cardLabel: string;
  providerName: string | null;
  documentRef: string | null;
  currencyCode: "UYU" | "USD" | null;
  originalAmount: number;
  pendingAmount: number;
};

export type CardDebtSummary = {
  cardLabel: string;
  pendingAmount: number;
  pendingCount: number;
  overdueAmount: number;
  overdueCount: number;
  nextDueDate: string | null;
  nextDueAmount: number;
};

export type CardSettlementItem = {
  movementId: number;
  movementDate: string;
  createdAt: string;
  sourceAccountName: string;
  cardLabel: string;
  description: string | null;
  currencyCode: "UYU" | "USD" | null;
  totalAmount: number;
};

export type AccountReportItem = {
  accountId: number;
  accountName: string;
  accountType: NeonAccount["accountType"];
  openingBalance: number;
  currentBalance: number;
  incomeAmount: number;
  expenseAmount: number;
  netFlowAmount: number;
};

export type ActivityResultItem = {
  activityId: number;
  activityLabel: string;
  clientName: string | null;
  quotedAmount: number;
  incomeAmount: number;
  expenseAmount: number;
  resultAmount: number;
  collectedAmount: number;
  pendingAmount: number;
};

export type ReportCenterOption = {
  key: string;
  label: string;
  scope: Exclude<ReportCenterScope, "all">;
};

export type ReportMovementStoryItem = {
  movementId: number;
  movementDate: string;
  createdAt: string;
  movementType: "income" | "expense";
  accountName: string;
  centerScope: ReportCenterScope;
  centerLabel: string;
  providerName: string | null;
  description: string | null;
  documentRef: string | null;
  amount: number;
  quantity: number | null;
  unitLabel: string | null;
  liters: number;
  kilometers: number;
  currencyCode: "UYU" | "USD" | null;
};

export type ReportStorySummary = {
  title: string;
  subtitle: string;
  centerScope: ReportCenterScope;
  totalIncomeAmount: number;
  totalExpenseAmount: number;
  balanceAmount: number;
  totalLiters: number;
  totalKilometers: number;
  movementCount: number;
  quotedAmount: number | null;
  collectedAmount: number | null;
  pendingAmount: number | null;
  items: ReportMovementStoryItem[];
};

export type DashboardSummary = {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  reportIncomeAmount: number;
  reportExpenseAmount: number;
  reportNetFlowAmount: number;
  reportActivityNetAmount: number;
  profitableActivitiesCount: number;
  lossActivitiesCount: number;
  commercialQuotedAmount: number;
  commercialCollectedAmount: number;
  commercialPendingAmount: number;
  commercialCollectionRate: number;
  activitiesCount: number;
  pendingBillingCount: number;
  pendingBillingAmount: number;
  pendingCollectionCount: number;
  pendingCollectionAmount: number;
  pendingDebtCount: number;
  pendingDebtAmount: number;
  overdueDebtCount: number;
  overdueDebtAmount: number;
  dueTodayCount: number;
  dueTodayAmount: number;
  dueWeekCount: number;
  dueWeekAmount: number;
  dueMonthCount: number;
  dueMonthAmount: number;
  selectedDebtRange: DebtReportRange;
  selectedReportPeriodRange: ReportPeriodRange;
  selectedReportDateFrom: string;
  selectedReportDateTo: string;
  pendingDebtEntries: PendingDebtItem[];
  pendingDebtByCard: DashboardBucket[];
  cardDebtSummaries: CardDebtSummary[];
  recentCardSettlements: CardSettlementItem[];
  accountReports: AccountReportItem[];
  activityResults: ActivityResultItem[];
  topExpenseCenters: DashboardBucket[];
  topIncomeActivities: DashboardBucket[];
  reportCenterOptions: ReportCenterOption[];
};

export type DerivedCommercialStatus = "pendiente_de_facturar" | "pendiente_de_cobrar" | "cobrado";

export function getCompanyLabel(company: NeonCompanyKey) {
  return company === "audiovisual" ? "Audiovisual" : "Neon";
}

export function deriveCommercialStatus(
  activity: Pick<NeonActivity, "commercialStatus" | "pendingAmount" | "invoiceDate" | "invoicedAmount" | "invoiceCompanyKey">
): DerivedCommercialStatus {
  const hasInvoiceData = Boolean(activity.invoiceDate && activity.invoiceCompanyKey && activity.invoicedAmount !== null);
  const shouldBehaveAsInvoiced =
    hasInvoiceData ||
    activity.commercialStatus === "facturado" ||
    activity.commercialStatus === "pendiente_de_cobrar" ||
    activity.commercialStatus === "cobrado";

  if (!shouldBehaveAsInvoiced) {
    return "pendiente_de_facturar";
  }

  return activity.pendingAmount > 0 ? "pendiente_de_cobrar" : "cobrado";
}

export function getCommercialStatusLabel(status: DerivedCommercialStatus) {
  if (status === "pendiente_de_facturar") return "Pendiente de facturar";
  if (status === "pendiente_de_cobrar") return "Pendiente de cobrar";
  return "Cobrado";
}

export function getActivityCompany(activity: Pick<NeonActivity, "activityType">): NeonCompanyKey {
  return activity.activityType === "movil_audiovisual" ? "audiovisual" : "neon";
}

export function filterActivitiesByCompany(activities: NeonActivity[], company: NeonCompanyKey) {
  return activities.filter((activity) => (activity.companyKey || getActivityCompany(activity)) === company);
}

export function filterJournalEntriesByCompany(
  journalEntries: NeonJournalEntry[],
  activities: NeonActivity[],
  company: NeonCompanyKey
) {
  const companyActivityIds = new Set(filterActivitiesByCompany(activities, company).map((activity) => activity.id));

  return journalEntries.filter((entry) => {
    if (entry.companyKey) {
      return entry.companyKey === company;
    }

    if (entry.sourceActivityId && companyActivityIds.has(entry.sourceActivityId)) {
      return true;
    }

    return entry.allocations.some(
      (allocation) =>
        allocation.destinationType === "activity" &&
        Boolean(allocation.destinationActivityId && companyActivityIds.has(allocation.destinationActivityId))
    );
  });
}

function getAllocationLabel(allocation: NeonJournalAllocation) {
  if (allocation.destinationType === "activity") {
    return allocation.destinationActivityCode || allocation.destinationActivityDescription || "Actividad";
  }

  return allocation.destinationLabel || allocation.destinationType;
}

function buildBuckets(entries: NeonJournalEntry[], limit: number) {
  const totals = new Map<string, DashboardBucket>();

  for (const entry of entries) {
    if (entry.allocations.length === 0) {
      const current = totals.get("Sin centro") || { label: "Sin centro", amount: 0, count: 0 };
      current.amount += entry.totalAmount;
      current.count += 1;
      totals.set("Sin centro", current);
      continue;
    }

    for (const allocation of entry.allocations) {
      const label = getAllocationLabel(allocation);
      const current = totals.get(label) || { label, amount: 0, count: 0 };
      current.amount += allocation.amount;
      current.count += 1;
      totals.set(label, current);
    }
  }

  return Array.from(totals.values())
    .sort((left, right) => (right.amount !== left.amount ? right.amount - left.amount : left.label.localeCompare(right.label)))
    .slice(0, limit);
}

function buildDebtBuckets(entries: PendingDebtItem[], limit: number) {
  const totals = new Map<string, DashboardBucket>();

  for (const entry of entries) {
    const cardLabel = entry.cardLabel;
    const current = totals.get(cardLabel) || { label: cardLabel, amount: 0, count: 0 };
    current.amount += entry.pendingAmount;
    current.count += 1;
    totals.set(cardLabel, current);
  }

  return Array.from(totals.values())
    .sort((left, right) => (right.amount !== left.amount ? right.amount - left.amount : left.label.localeCompare(right.label)))
    .slice(0, limit);
}

function buildCardDebtSummaries(entries: PendingDebtItem[], today: string, limit: number) {
  const cards = new Map<string, CardDebtSummary>();

  for (const entry of entries) {
    const current =
      cards.get(entry.cardLabel) || {
        cardLabel: entry.cardLabel,
        pendingAmount: 0,
        pendingCount: 0,
        overdueAmount: 0,
        overdueCount: 0,
        nextDueDate: null,
        nextDueAmount: 0
      };

    current.pendingAmount += entry.pendingAmount;
    current.pendingCount += 1;

    if (entry.dueDate && entry.dueDate < today) {
      current.overdueAmount += entry.pendingAmount;
      current.overdueCount += 1;
    }

    if (entry.dueDate && entry.dueDate >= today) {
      if (!current.nextDueDate || entry.dueDate < current.nextDueDate) {
        current.nextDueDate = entry.dueDate;
        current.nextDueAmount = entry.pendingAmount;
      } else if (entry.dueDate === current.nextDueDate) {
        current.nextDueAmount += entry.pendingAmount;
      }
    }

    cards.set(entry.cardLabel, current);
  }

  return Array.from(cards.values())
    .sort((left, right) => {
      if (right.pendingAmount !== left.pendingAmount) {
        return right.pendingAmount - left.pendingAmount;
      }

      return left.cardLabel.localeCompare(right.cardLabel);
    })
    .slice(0, limit);
}

function buildRecentCardSettlements(journalEntries: NeonJournalEntry[], limit: number) {
  return journalEntries
    .filter((entry) => entry.movementType === "expense" && entry.expenseKind === "credit_settlement" && Boolean(entry.creditCardLabel))
    .sort((left, right) => {
      if (left.movementDate !== right.movementDate) {
        return right.movementDate.localeCompare(left.movementDate);
      }

      return right.id - left.id;
    })
    .slice(0, limit)
    .map((entry) => ({
      movementId: entry.id,
      movementDate: entry.movementDate,
      createdAt: entry.createdAt,
      sourceAccountName: entry.accountName,
      cardLabel: entry.creditCardLabel?.trim() || "Credito sin tarjeta",
      description: entry.description,
      currencyCode: entry.currencyCode,
      totalAmount: entry.totalAmount
    }));
}

function buildAccountReports(accounts: NeonAccount[], journalEntries: NeonJournalEntry[]) {
  return accounts
    .map((account) => {
      const relatedEntries = journalEntries.filter((entry) => entry.accountId === account.id);
      const incomeAmount = relatedEntries
        .filter((entry) => entry.movementType === "income")
        .reduce((sum, entry) => sum + entry.totalAmount, 0);
      const expenseAmount = relatedEntries
        .filter((entry) => entry.movementType === "expense")
        .reduce((sum, entry) => sum + entry.totalAmount, 0);

      return {
        accountId: account.id,
        accountName: account.name,
        accountType: account.accountType,
        openingBalance: account.openingBalance,
        currentBalance: account.currentBalance,
        incomeAmount,
        expenseAmount,
        netFlowAmount: incomeAmount - expenseAmount
      };
    })
    .sort((left, right) =>
      Math.abs(right.currentBalance) !== Math.abs(left.currentBalance)
        ? Math.abs(right.currentBalance) - Math.abs(left.currentBalance)
        : left.accountName.localeCompare(right.accountName)
    );
}

function buildActivityResults(activities: NeonActivity[], journalEntries: NeonJournalEntry[]) {
  return activities
    .map((activity) => {
      let incomeAmount = 0;
      let expenseAmount = 0;

      for (const entry of journalEntries) {
        for (const allocation of entry.allocations) {
          if (allocation.destinationType !== "activity" || allocation.destinationActivityId !== activity.id) {
            continue;
          }

          if (entry.movementType === "income") {
            incomeAmount += allocation.amount;
          } else if (entry.expenseKind !== "credit_settlement") {
            expenseAmount += allocation.amount;
          }
        }
      }

      return {
        activityId: activity.id,
        activityLabel: `${formatActivityCode(activity)} · ${activity.description}`,
        clientName: activity.clientName,
        quotedAmount: activity.quotedAmount,
        incomeAmount,
        expenseAmount,
        resultAmount: incomeAmount - expenseAmount,
        collectedAmount: activity.collectedAmount,
        pendingAmount: activity.pendingAmount
      };
    })
    .sort((left, right) =>
      Math.abs(right.resultAmount) !== Math.abs(left.resultAmount)
        ? Math.abs(right.resultAmount) - Math.abs(left.resultAmount)
        : left.activityLabel.localeCompare(right.activityLabel)
    );
}

function filterDebtEntries(entries: PendingDebtItem[], range: DebtReportRange, today: string) {
  const weekEnd = addDaysToDateInputValue(today, 6);
  const monthEnd = getMonthEndDateInputValue(today);

  return entries.filter((entry) => {
    if (!entry.dueDate) {
      return range === "all";
    }

    if (range === "overdue") {
      return entry.dueDate < today;
    }

    if (range === "today") {
      return entry.dueDate === today;
    }

    if (range === "week") {
      return entry.dueDate >= today && entry.dueDate <= weekEnd;
    }

    if (range === "month") {
      return entry.dueDate >= today && entry.dueDate <= monthEnd;
    }

    return true;
  });
}

function filterEntriesByReportPeriod(entries: NeonJournalEntry[], period: ReportPeriodFilter, today: string) {
  const hasCustomRange = Boolean(period.dateFrom || period.dateTo);

  if (hasCustomRange) {
    return entries.filter((entry) => {
      if (period.dateFrom && entry.movementDate < period.dateFrom) {
        return false;
      }

      if (period.dateTo && entry.movementDate > period.dateTo) {
        return false;
      }

      return true;
    });
  }

  if (period.range === "all") {
    return entries;
  }

  const weekEnd = addDaysToDateInputValue(today, 6);
  const monthEnd = getMonthEndDateInputValue(today);

  return entries.filter((entry) => {
    if (period.range === "today") {
      return entry.movementDate === today;
    }

    if (period.range === "week") {
      return entry.movementDate >= today && entry.movementDate <= weekEnd;
    }

    return entry.movementDate >= today && entry.movementDate <= monthEnd;
  });
}

function getAllocationStoryLabel(allocation: NeonJournalAllocation) {
  if (allocation.destinationType === "activity") {
    return allocation.destinationActivityCode || allocation.destinationActivityDescription || "Actividad";
  }

  return allocation.destinationLabel || allocation.destinationType;
}

function getAllocationMetric(metadata: Record<string, unknown> | null, key: "liters" | "kilometers") {
  const rawValue = metadata?.[key];
  return typeof rawValue === "number" && Number.isFinite(rawValue) ? rawValue : 0;
}

function matchesEntrySearch(entry: NeonJournalEntry, searchTerm: string) {
  if (!searchTerm) {
    return true;
  }

  const normalizedSearch = searchTerm.trim().toLowerCase();
  if (!normalizedSearch) {
    return true;
  }

  const haystack = [
    entry.accountName,
    entry.description,
    entry.providerName,
    entry.documentRef,
    entry.creditCardLabel,
    ...entry.allocations.map((allocation) => getAllocationStoryLabel(allocation))
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalizedSearch);
}

function getReportEntriesByFilters(
  journalEntries: NeonJournalEntry[],
  reportPeriodFilter: ReportPeriodFilter,
  accountId: number | null,
  searchTerm: string
) {
  const today = getTodayDateInputValue();
  return filterEntriesByReportPeriod(journalEntries, reportPeriodFilter, today).filter((entry) => {
    if (accountId && entry.accountId !== accountId) {
      return false;
    }

    return matchesEntrySearch(entry, searchTerm);
  });
}

export function buildReportCenterOptions(journalEntries: NeonJournalEntry[]) {
  const options = new Map<string, ReportCenterOption>();

  for (const entry of journalEntries) {
    for (const allocation of entry.allocations) {
      const label = getAllocationStoryLabel(allocation);
      if (!label) {
        continue;
      }

      const scope = allocation.destinationType;
      const key = `${scope}:${label}`;
      if (options.has(key)) {
        continue;
      }

      options.set(key, {
        key,
        label,
        scope
      });
    }
  }

  return Array.from(options.values()).sort((left, right) =>
    left.scope !== right.scope ? left.scope.localeCompare(right.scope) : left.label.localeCompare(right.label)
  );
}

export function buildReportStory(
  activities: NeonActivity[],
  journalEntries: NeonJournalEntry[],
  reportPeriodFilter: ReportPeriodFilter,
  centerScope: ReportCenterScope,
  centerKey: string,
  accountId: number | null,
  searchTerm: string
): ReportStorySummary {
  const scopedEntries = getReportEntriesByFilters(journalEntries, reportPeriodFilter, accountId, searchTerm);

  if (centerScope === "all" || !centerKey) {
    const items = scopedEntries
      .slice()
      .sort((left, right) => (left.movementDate !== right.movementDate ? right.movementDate.localeCompare(left.movementDate) : right.id - left.id))
      .map((entry) => ({
        movementId: entry.id,
        movementDate: entry.movementDate,
        createdAt: entry.createdAt,
        movementType: entry.movementType,
        accountName: entry.accountName,
        centerScope: "all" as const,
        centerLabel:
          entry.allocations.length > 0 ? entry.allocations.slice(0, 2).map((allocation) => getAllocationStoryLabel(allocation)).join(" · ") : "Sin centro",
        providerName: entry.providerName,
        description: entry.description,
        documentRef: entry.documentRef,
        amount: entry.totalAmount,
        quantity: entry.quantity,
        unitLabel: entry.unitLabel,
        liters: 0,
        kilometers: 0,
        currencyCode: entry.currencyCode
      }));

    const totalIncomeAmount = items.filter((item) => item.movementType === "income").reduce((sum, item) => sum + item.amount, 0);
    const totalExpenseAmount = items.filter((item) => item.movementType === "expense").reduce((sum, item) => sum + item.amount, 0);

    return {
      title: "Vista general",
      subtitle: "Todo el movimiento del periodo elegido.",
      centerScope: "all",
      totalIncomeAmount,
      totalExpenseAmount,
      balanceAmount: totalIncomeAmount - totalExpenseAmount,
      totalLiters: 0,
      totalKilometers: 0,
      movementCount: items.length,
      quotedAmount: null,
      collectedAmount: null,
      pendingAmount: null,
      items: items.slice(0, 20)
    };
  }

  const scopedItems = scopedEntries
    .flatMap((entry) =>
      entry.allocations
        .filter((allocation) => allocation.destinationType === centerScope && getAllocationStoryLabel(allocation) === centerKey)
        .map((allocation) => ({
          movementId: entry.id,
          movementDate: entry.movementDate,
          createdAt: entry.createdAt,
          movementType: entry.movementType,
          accountName: entry.accountName,
          centerScope,
          centerLabel: getAllocationStoryLabel(allocation),
          providerName: entry.providerName,
          description: entry.description,
          documentRef: entry.documentRef,
          amount: allocation.amount,
          quantity: entry.quantity,
          unitLabel: entry.unitLabel,
          liters: getAllocationMetric(allocation.metadata, "liters"),
          kilometers: getAllocationMetric(allocation.metadata, "kilometers"),
          currencyCode: entry.currencyCode
        }))
    )
    .sort((left, right) => (left.movementDate !== right.movementDate ? right.movementDate.localeCompare(left.movementDate) : right.movementId - left.movementId));

  const totalIncomeAmount = scopedItems.filter((item) => item.movementType === "income").reduce((sum, item) => sum + item.amount, 0);
  const totalExpenseAmount = scopedItems.filter((item) => item.movementType === "expense").reduce((sum, item) => sum + item.amount, 0);
  const relatedActivity =
    centerScope === "activity"
      ? activities.find((activity) => `${formatActivityCode(activity)} · ${activity.description}` === centerKey || formatActivityCode(activity) === centerKey)
      : null;

  return {
    title: centerKey,
    subtitle:
      centerScope === "activity"
        ? "Lectura puntual de la actividad elegida."
        : centerScope === "vehicle"
          ? "Lectura puntual del vehiculo elegido."
          : centerScope === "personal"
            ? "Lectura puntual del gasto personal."
            : centerScope === "rental"
              ? "Lectura puntual del alquiler elegido."
              : "Lectura puntual del centro elegido.",
    centerScope,
    totalIncomeAmount,
    totalExpenseAmount,
    balanceAmount: totalIncomeAmount - totalExpenseAmount,
    totalLiters: scopedItems.reduce((sum, item) => sum + item.liters, 0),
    totalKilometers: scopedItems.reduce((sum, item) => sum + item.kilometers, 0),
    movementCount: scopedItems.length,
    quotedAmount: relatedActivity?.quotedAmount ?? null,
    collectedAmount: relatedActivity?.collectedAmount ?? null,
    pendingAmount: relatedActivity?.pendingAmount ?? null,
    items: scopedItems.slice(0, 20)
  };
}

function buildPendingDebtItems(accounts: NeonAccount[], journalEntries: NeonJournalEntry[]) {
  const creditAccountIds = new Set(accounts.filter((account) => account.accountType === "credit").map((account) => account.id));
  const purchases = journalEntries
    .filter(
      (entry) =>
        entry.movementType === "expense" &&
        creditAccountIds.has(entry.accountId) &&
        entry.expenseKind !== "credit_settlement" &&
        Boolean(entry.creditCardLabel)
    )
    .sort((left, right) => {
      const leftDue = left.dueDate || left.movementDate;
      const rightDue = right.dueDate || right.movementDate;
      if (leftDue !== rightDue) {
        return leftDue.localeCompare(rightDue);
      }

      return left.id - right.id;
    });
  const settlements = journalEntries
    .filter((entry) => entry.movementType === "expense" && entry.expenseKind === "credit_settlement" && Boolean(entry.creditCardLabel))
    .sort((left, right) => {
      if (left.movementDate !== right.movementDate) {
        return left.movementDate.localeCompare(right.movementDate);
      }

      return left.id - right.id;
    });

  const settlementByCard = new Map<string, number>();
  for (const settlement of settlements) {
    const cardLabel = settlement.creditCardLabel?.trim();
    if (!cardLabel) continue;
    settlementByCard.set(cardLabel, (settlementByCard.get(cardLabel) || 0) + settlement.totalAmount);
  }

  const items: PendingDebtItem[] = [];

  for (const purchase of purchases) {
    const cardLabel = purchase.creditCardLabel?.trim();
    if (!cardLabel) continue;

    let remainingSettlement = settlementByCard.get(cardLabel) || 0;
    const pendingAmount = Math.max(Number((purchase.totalAmount - remainingSettlement).toFixed(2)), 0);
    const appliedSettlement = Math.min(remainingSettlement, purchase.totalAmount);
    remainingSettlement = Number((remainingSettlement - appliedSettlement).toFixed(2));
    settlementByCard.set(cardLabel, remainingSettlement);

    if (pendingAmount <= 0) {
      continue;
    }

    items.push({
      movementId: purchase.id,
      movementDate: purchase.movementDate,
      dueDate: purchase.dueDate,
      accountName: purchase.accountName,
      cardLabel,
      providerName: purchase.providerName,
      documentRef: purchase.documentRef,
      currencyCode: purchase.currencyCode,
      originalAmount: purchase.totalAmount,
      pendingAmount
    });
  }

  return items;
}

export function buildDashboardSummary(
  accounts: NeonAccount[],
  activities: NeonActivity[],
  journalEntries: NeonJournalEntry[],
  debtReportRange: DebtReportRange = "all",
  reportPeriodFilter: ReportPeriodFilter = { range: "all", dateFrom: "", dateTo: "" }
): DashboardSummary {
  const totalBalance = accounts.reduce((sum, account) => sum + account.currentBalance, 0);
  const totalIncome = journalEntries
    .filter((entry) => entry.movementType === "income")
    .reduce((sum, entry) => sum + entry.totalAmount, 0);
  const totalExpense = journalEntries
    .filter((entry) => entry.movementType === "expense")
    .reduce((sum, entry) => sum + entry.totalAmount, 0);

  const pendingBillingActivities = activities.filter((activity) => deriveCommercialStatus(activity) === "pendiente_de_facturar");
  const pendingCollectionActivities = activities.filter((activity) => deriveCommercialStatus(activity) === "pendiente_de_cobrar");
  const today = getTodayDateInputValue();
  const weekEnd = addDaysToDateInputValue(today, 6);
  const monthEnd = getMonthEndDateInputValue(today);
  const reportEntries = filterEntriesByReportPeriod(journalEntries, reportPeriodFilter, today);
  const pendingDebtEntries = buildPendingDebtItems(accounts, journalEntries)
    .sort((left, right) => {
      const leftDue = left.dueDate || "9999-12-31";
      const rightDue = right.dueDate || "9999-12-31";
      if (leftDue !== rightDue) {
        return leftDue.localeCompare(rightDue);
      }
      return right.movementId - left.movementId;
    });
  const overdueDebtEntries = pendingDebtEntries.filter((entry) => Boolean(entry.dueDate && entry.dueDate < today));
  const dueTodayEntries = pendingDebtEntries.filter((entry) => entry.dueDate === today);
  const dueWeekEntries = pendingDebtEntries.filter((entry) => Boolean(entry.dueDate && entry.dueDate >= today && entry.dueDate <= weekEnd));
  const dueMonthEntries = pendingDebtEntries.filter(
    (entry) => Boolean(entry.dueDate && entry.dueDate >= today && entry.dueDate <= monthEnd)
  );
  const visibleDebtEntries = filterDebtEntries(pendingDebtEntries, debtReportRange, today);

  const topExpenseCenters = buildBuckets(
    reportEntries.filter((entry) => entry.movementType === "expense"),
    5
  );

  const topIncomeActivities = buildBuckets(
    reportEntries.filter((entry) => entry.movementType === "income" && entry.allocations.some((allocation) => allocation.destinationType === "activity")),
    5
  ).map((bucket) => {
    const matchingActivity = activities.find(
      (activity) => `${formatActivityCode(activity)} · ${activity.description}` === bucket.label || formatActivityCode(activity) === bucket.label
    );

    if (!matchingActivity) {
      return bucket;
    }

    return {
      ...bucket,
      label: `${formatActivityCode(matchingActivity)} · ${matchingActivity.description}`
    };
  });

  const accountReports = buildAccountReports(accounts, reportEntries);
  const activityResults = buildActivityResults(activities, reportEntries);
  const reportIncomeAmount = reportEntries
    .filter((entry) => entry.movementType === "income")
    .reduce((sum, entry) => sum + entry.totalAmount, 0);
  const reportExpenseAmount = reportEntries
    .filter((entry) => entry.movementType === "expense")
    .reduce((sum, entry) => sum + entry.totalAmount, 0);
  const reportActivityNetAmount = activityResults.reduce((sum, activity) => sum + activity.resultAmount, 0);
  const profitableActivitiesCount = activityResults.filter((activity) => activity.resultAmount > 0).length;
  const lossActivitiesCount = activityResults.filter((activity) => activity.resultAmount < 0).length;
  const commercialQuotedAmount = activities.reduce((sum, activity) => sum + activity.quotedAmount, 0);
  const commercialCollectedAmount = activities.reduce((sum, activity) => sum + activity.collectedAmount, 0);
  const commercialPendingAmount = activities.reduce((sum, activity) => sum + activity.pendingAmount, 0);
  const commercialCollectionRate =
    commercialQuotedAmount > 0 ? Number(((commercialCollectedAmount / commercialQuotedAmount) * 100).toFixed(1)) : 0;

  return {
    totalBalance,
    totalIncome,
    totalExpense,
    reportIncomeAmount,
    reportExpenseAmount,
    reportNetFlowAmount: reportIncomeAmount - reportExpenseAmount,
    reportActivityNetAmount,
    profitableActivitiesCount,
    lossActivitiesCount,
    commercialQuotedAmount,
    commercialCollectedAmount,
    commercialPendingAmount,
    commercialCollectionRate,
    activitiesCount: activities.length,
    pendingBillingCount: pendingBillingActivities.length,
    pendingBillingAmount: pendingBillingActivities.reduce((sum, activity) => sum + activity.quotedAmount, 0),
    pendingCollectionCount: pendingCollectionActivities.length,
    pendingCollectionAmount: pendingCollectionActivities.reduce((sum, activity) => sum + activity.pendingAmount, 0),
    pendingDebtCount: pendingDebtEntries.length,
    pendingDebtAmount: pendingDebtEntries.reduce((sum, entry) => sum + entry.pendingAmount, 0),
    overdueDebtCount: overdueDebtEntries.length,
    overdueDebtAmount: overdueDebtEntries.reduce((sum, entry) => sum + entry.pendingAmount, 0),
    dueTodayCount: dueTodayEntries.length,
    dueTodayAmount: dueTodayEntries.reduce((sum, entry) => sum + entry.pendingAmount, 0),
    dueWeekCount: dueWeekEntries.length,
    dueWeekAmount: dueWeekEntries.reduce((sum, entry) => sum + entry.pendingAmount, 0),
    dueMonthCount: dueMonthEntries.length,
    dueMonthAmount: dueMonthEntries.reduce((sum, entry) => sum + entry.pendingAmount, 0),
    selectedDebtRange: debtReportRange,
    selectedReportPeriodRange: reportPeriodFilter.range,
    selectedReportDateFrom: reportPeriodFilter.dateFrom,
    selectedReportDateTo: reportPeriodFilter.dateTo,
    pendingDebtEntries: visibleDebtEntries.slice(0, 12),
    pendingDebtByCard: buildDebtBuckets(visibleDebtEntries, 5),
    cardDebtSummaries: buildCardDebtSummaries(pendingDebtEntries, today, 6),
    recentCardSettlements: buildRecentCardSettlements(reportEntries, 8),
    accountReports,
    activityResults,
    topExpenseCenters,
    topIncomeActivities,
    reportCenterOptions: buildReportCenterOptions(reportEntries)
  };
}
