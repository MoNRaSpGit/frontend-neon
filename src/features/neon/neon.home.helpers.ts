import { NeonActivity, NeonCategory, NeonExpense } from "./neon.types";

export function getTodayDateInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 2
  }).format(value);
}

export function formatActivityCode(activity: NeonActivity) {
  return `#${activity.activityNumber}/${activity.activityYear}`;
}

export function formatShortDate(dateIso: string) {
  return new Intl.DateTimeFormat("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(dateIso));
}

export function getDestinationLabel(expense: NeonExpense) {
  if (expense.destinationType === "activity") {
    return expense.destinationActivityCode
      ? `${expense.destinationActivityCode} ${expense.destinationActivityDescription || ""}`.trim()
      : "Actividad";
  }

  if (expense.destinationType === "personal") {
    return "Personal";
  }

  if (expense.destinationType === "vehicle") {
    return "Vehiculo";
  }

  return expense.destinationLabel || "Otro";
}

export function getExpenseScopeLabel(classification: "empresa" | "personal") {
  return classification === "personal" ? "Personal" : "Empresa";
}

export function getPreferredExpenseCategory(categories: NeonCategory[], scope: "empresa" | "personal") {
  const preferredSystemName = scope === "personal" ? "Gastos personales" : "Otros";

  return (
    categories.find(
      (category) =>
        category.classification === scope && category.name.toLowerCase() === preferredSystemName.toLowerCase()
    ) ||
    categories.find((category) => category.classification === scope) ||
    null
  );
}

export function getVisibleSummaryItems<T>(items: T[], visibleCount: number) {
  return items.slice(0, Math.min(visibleCount, items.length));
}

export function toTitleCase(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function getExpensePreviewLabel(description: string | null, classification: "empresa" | "personal") {
  const normalizedDescription = description?.trim();
  if (normalizedDescription) {
    return toTitleCase(normalizedDescription);
  }

  return classification === "personal" ? "Personal" : "Empresa";
}
