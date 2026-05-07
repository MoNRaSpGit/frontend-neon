import { NeonActivity, NeonCategory, NeonExpense } from "./neon.types";

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

function parseLocalDateInput(dateIso: string) {
  const [year, month, day] = dateIso.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function getTodayDateInputValue(referenceDate = new Date()) {
  return `${referenceDate.getFullYear()}-${padDatePart(referenceDate.getMonth() + 1)}-${padDatePart(referenceDate.getDate())}`;
}

export function addDaysToDateInputValue(dateIso: string, days: number) {
  const baseDate = parseLocalDateInput(dateIso);
  baseDate.setDate(baseDate.getDate() + days);
  return getTodayDateInputValue(baseDate);
}

export function getMonthEndDateInputValue(dateIso: string) {
  const baseDate = parseLocalDateInput(dateIso);
  return getTodayDateInputValue(new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0));
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 2
  }).format(value);
}

export function formatSignedMoney(value: number) {
  if (value > 0) {
    return `+${formatMoney(value)}`;
  }

  if (value < 0) {
    return `-${formatMoney(Math.abs(value))}`;
  }

  return formatMoney(0);
}

export function formatDirectionalMoney(value: number, direction: "income" | "expense") {
  const absoluteValue = Math.abs(value);
  return direction === "income" ? `+${formatMoney(absoluteValue)}` : `-${formatMoney(absoluteValue)}`;
}

export function formatActivityCode(activity: NeonActivity) {
  return `#${activity.activityNumber}/${activity.activityYear}`;
}

export function formatShortDate(dateIso: string) {
  const localDate = parseLocalDateInput(dateIso);
  return new Intl.DateTimeFormat("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(localDate);
}

export function formatHour(dateTime: string) {
  return new Intl.DateTimeFormat("es-UY", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(dateTime));
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
