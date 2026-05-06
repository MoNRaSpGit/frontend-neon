import { formatActivityCode } from "./neon.home.helpers";
import { NeonAccount, NeonActivity, NeonJournalAllocation, NeonJournalEntry } from "./neon.types";

export type DashboardBucket = {
  label: string;
  amount: number;
  count: number;
};

export type DashboardSummary = {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  activitiesCount: number;
  pendingBillingCount: number;
  pendingBillingAmount: number;
  pendingCollectionCount: number;
  pendingCollectionAmount: number;
  topExpenseCenters: DashboardBucket[];
  topIncomeActivities: DashboardBucket[];
};

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

export function buildDashboardSummary(accounts: NeonAccount[], activities: NeonActivity[], journalEntries: NeonJournalEntry[]): DashboardSummary {
  const totalBalance = accounts.reduce((sum, account) => sum + account.currentBalance, 0);
  const totalIncome = journalEntries
    .filter((entry) => entry.movementType === "income")
    .reduce((sum, entry) => sum + entry.totalAmount, 0);
  const totalExpense = journalEntries
    .filter((entry) => entry.movementType === "expense")
    .reduce((sum, entry) => sum + entry.totalAmount, 0);

  const pendingBillingActivities = activities.filter((activity) => activity.commercialStatus === "pendiente_de_facturar");
  const pendingCollectionActivities = activities.filter(
    (activity) => activity.commercialStatus === "pendiente_de_cobrar" && activity.pendingAmount > 0
  );

  const topExpenseCenters = buildBuckets(
    journalEntries.filter((entry) => entry.movementType === "expense"),
    5
  );

  const topIncomeActivities = buildBuckets(
    journalEntries.filter((entry) => entry.movementType === "income" && entry.allocations.some((allocation) => allocation.destinationType === "activity")),
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

  return {
    totalBalance,
    totalIncome,
    totalExpense,
    activitiesCount: activities.length,
    pendingBillingCount: pendingBillingActivities.length,
    pendingBillingAmount: pendingBillingActivities.reduce((sum, activity) => sum + activity.quotedAmount, 0),
    pendingCollectionCount: pendingCollectionActivities.length,
    pendingCollectionAmount: pendingCollectionActivities.reduce((sum, activity) => sum + activity.pendingAmount, 0),
    topExpenseCenters,
    topIncomeActivities
  };
}
