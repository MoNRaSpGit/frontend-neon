import { NeonJournalAllocation } from "./neon.types";
import { JournalAllocationFormState } from "./neon.v2.types";

export function createEmptyJournalAllocation(): JournalAllocationFormState {
  return {
    destinationType: "",
    destinationActivityId: "",
    destinationLabel: "",
    amount: "",
    kilometers: "",
    liters: ""
  };
}

export function getJournalAllocationDestinationLabel(allocation: NeonJournalAllocation) {
  if (allocation.destinationType === "activity") {
    return allocation.destinationActivityCode || allocation.destinationActivityDescription || "Actividad";
  }

  return allocation.destinationLabel || allocation.destinationType;
}
