import { NeonJournalAllocation } from "./neon.types";
import { JournalAllocationFormState } from "./neon.v2.types";

export function createEmptyJournalAllocation(): JournalAllocationFormState {
  return {
    destinationType: "",
    destinationActivityId: "",
    destinationLabel: "",
    customTypeLabel: "",
    amount: "",
    kilometers: "",
    liters: ""
  };
}

export function getJournalAllocationDestinationLabel(allocation: NeonJournalAllocation) {
  if (allocation.destinationType === "activity") {
    return allocation.destinationActivityCode || allocation.destinationActivityDescription || "Actividad";
  }

  if (allocation.destinationType === "custom") {
    const typeLabel = typeof allocation.metadata?.typeLabel === "string" ? allocation.metadata.typeLabel.trim() : "";
    const destinationLabel = allocation.destinationLabel || "Centro personalizado";
    return typeLabel ? `${typeLabel} · ${destinationLabel}` : destinationLabel;
  }

  return allocation.destinationLabel || allocation.destinationType;
}
