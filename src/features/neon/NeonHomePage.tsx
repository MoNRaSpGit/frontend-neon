import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  createNeonAccount,
  createNeonActivity,
  createNeonClient,
  createNeonJournalEntry,
  listNeonAccounts,
  listNeonActivities,
  listNeonClients,
  listNeonJournal
} from "./neon.client";
import { getTodayDateInputValue, toTitleCase } from "./neon.home.helpers";
import { pageStyle } from "./neon.home.styles";
import { NeonAccount, NeonActivity, NeonClient, NeonJournalAllocationInput, NeonJournalEntry } from "./neon.types";
import { buildDashboardSummary } from "./neon.v2.dashboard";
import { createEmptyJournalAllocation } from "./neon.v2.journal";
import { NeonV2HomeSections } from "./neon.v2.sections";
import { AccountFormState, ActivityFormState, ClientFormState, JournalFormState } from "./neon.v2.types";

export function NeonHomePage() {
  const [loading, setLoading] = useState(true);
  const [savingClient, setSavingClient] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingActivity, setSavingActivity] = useState(false);
  const [savingJournal, setSavingJournal] = useState(false);
  const [clients, setClients] = useState<NeonClient[]>([]);
  const [accounts, setAccounts] = useState<NeonAccount[]>([]);
  const [activities, setActivities] = useState<NeonActivity[]>([]);
  const [journalEntries, setJournalEntries] = useState<NeonJournalEntry[]>([]);
  const [clientForm, setClientForm] = useState<ClientFormState>({
    name: "",
    phone: "",
    notes: ""
  });
  const [accountForm, setAccountForm] = useState<AccountFormState>({
    name: "",
    accountType: "cash",
    openingBalance: ""
  });
  const [activityForm, setActivityForm] = useState<ActivityFormState>({
    activityDate: getTodayDateInputValue(),
    description: "",
    clientId: "",
    activityType: "neon",
    quotedAmount: "",
    commercialStatus: "pendiente_de_facturar"
  });
  const [journalForm, setJournalForm] = useState<JournalFormState>({
    movementType: "expense",
    movementDate: getTodayDateInputValue(),
    accountId: "",
    totalAmount: "",
    description: "",
    allocations: [createEmptyJournalAllocation()]
  });

  const loadHomeData = useCallback(async () => {
    setLoading(true);

    try {
      const [nextClients, nextAccounts, nextActivities, nextJournalEntries] = await Promise.all([
        listNeonClients(),
        listNeonAccounts(),
        listNeonActivities(),
        listNeonJournal({ limit: 100 })
      ]);

      setClients(nextClients);
      setAccounts(nextAccounts);
      setActivities(nextActivities);
      setJournalEntries(nextJournalEntries);

      const defaultAccountId = nextAccounts[0] ? String(nextAccounts[0].id) : "";
      setJournalForm((current) => ({
        ...current,
        accountId: current.accountId || defaultAccountId
      }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cargar Neon");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHomeData();
  }, [loadHomeData]);

  async function handleCreateClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = toTitleCase(clientForm.name);
    if (!name) {
      toast.error("Falta el nombre del cliente");
      return;
    }

    setSavingClient(true);
    try {
      const createdClient = await createNeonClient({
        name,
        phone: clientForm.phone.trim() || undefined,
        notes: clientForm.notes.trim() || undefined
      });

      setClients((current) => [...current, createdClient].sort((left, right) => left.name.localeCompare(right.name)));
      setClientForm({ name: "", phone: "", notes: "" });
      setActivityForm((current) => ({ ...current, clientId: String(createdClient.id) }));
      toast.success("Cliente guardado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el cliente");
    } finally {
      setSavingClient(false);
    }
  }

  async function handleCreateAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = accountForm.name.trim();
    const openingBalance = accountForm.openingBalance ? Number(accountForm.openingBalance) : 0;

    if (!name) {
      toast.error("Falta el nombre de la cuenta");
      return;
    }

    if (!Number.isFinite(openingBalance) || openingBalance < 0) {
      toast.error("El saldo inicial debe ser valido");
      return;
    }

    setSavingAccount(true);
    try {
      const createdAccount = await createNeonAccount({
        name,
        accountType: accountForm.accountType,
        openingBalance
      });

      setAccounts((current) => [...current, createdAccount].sort((left, right) => left.id - right.id));
      setAccountForm({ name: "", accountType: "cash", openingBalance: "" });
      setJournalForm((current) => ({
        ...current,
        accountId: current.accountId || String(createdAccount.id)
      }));
      toast.success("Cuenta guardada");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar la cuenta");
    } finally {
      setSavingAccount(false);
    }
  }

  async function handleCreateActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const description = activityForm.description.trim();
    const quotedAmount = Number(activityForm.quotedAmount);

    if (!description) {
      toast.error("Falta la descripcion de la actividad");
      return;
    }

    if (!Number.isFinite(quotedAmount) || quotedAmount < 0) {
      toast.error("El monto del trabajo debe ser valido");
      return;
    }

    setSavingActivity(true);
    try {
      const createdActivity = await createNeonActivity({
        activityDate: activityForm.activityDate,
        description,
        clientId: activityForm.clientId ? Number(activityForm.clientId) : undefined,
        activityType: activityForm.activityType,
        quotedAmount,
        commercialStatus: activityForm.commercialStatus
      });

      setActivities((current) => [createdActivity, ...current]);
      setActivityForm((current) => ({
        ...current,
        activityDate: getTodayDateInputValue(),
        description: "",
        quotedAmount: "",
        commercialStatus: "pendiente_de_facturar"
      }));
      toast.success("Actividad guardada");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar la actividad");
    } finally {
      setSavingActivity(false);
    }
  }

  async function handleCreateJournalEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const totalAmount = Number(journalForm.totalAmount);
    if (!journalForm.accountId) {
      toast.error("Falta elegir la cuenta");
      return;
    }

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      toast.error("El monto debe ser valido");
      return;
    }

    const normalizedAllocations: NeonJournalAllocationInput[] = journalForm.allocations
      .filter(
        (
          allocation
        ): allocation is typeof allocation & {
          destinationType: NeonJournalAllocationInput["destinationType"];
        } => Boolean(allocation.destinationType && allocation.amount.trim())
      )
      .map((allocation) => ({
        destinationType: allocation.destinationType,
        destinationActivityId: allocation.destinationActivityId ? Number(allocation.destinationActivityId) : undefined,
        destinationLabel: allocation.destinationLabel.trim() || undefined,
        amount: Number(allocation.amount),
        kilometers: allocation.kilometers ? Number(allocation.kilometers) : undefined,
        liters: allocation.liters ? Number(allocation.liters) : undefined
      }));

    for (const allocation of normalizedAllocations) {
      if (!Number.isFinite(allocation.amount) || allocation.amount <= 0) {
        toast.error("Cada linea debe tener un monto valido");
        return;
      }

      if (allocation.destinationType === "activity" && !allocation.destinationActivityId) {
        toast.error("Cada linea de actividad debe elegir una actividad");
        return;
      }

      if (
        (allocation.destinationType === "vehicle" ||
          allocation.destinationType === "personal" ||
          allocation.destinationType === "other") &&
        !allocation.destinationLabel
      ) {
        toast.error("Cada linea libre debe tener etiqueta");
        return;
      }
    }

    if (normalizedAllocations.length > 0) {
      const allocationTotal = normalizedAllocations.reduce((sum, allocation) => sum + allocation.amount, 0);
      if (Math.round(allocationTotal * 100) !== Math.round(totalAmount * 100)) {
        toast.error("La suma de las lineas debe coincidir con el monto total");
        return;
      }
    }

    setSavingJournal(true);
    try {
      const createdEntry = await createNeonJournalEntry({
        movementType: journalForm.movementType,
        movementDate: journalForm.movementDate,
        accountId: Number(journalForm.accountId),
        totalAmount,
        description: journalForm.description.trim() || undefined,
        allocations: normalizedAllocations.length > 0 ? normalizedAllocations : undefined
      });

      setJournalEntries((current) => [createdEntry, ...current]);
      await loadHomeData();
      setJournalForm((current) => ({
        ...current,
        movementDate: getTodayDateInputValue(),
        totalAmount: "",
        description: "",
        allocations: [createEmptyJournalAllocation()]
      }));
      toast.success("Movimiento guardado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el movimiento");
    } finally {
      setSavingJournal(false);
    }
  }

  const dashboard = useMemo(() => {
    return buildDashboardSummary(accounts, activities, journalEntries);
  }, [accounts, activities, journalEntries]);

  const journalAllocationTotal = useMemo(
    () =>
      journalForm.allocations.reduce((sum, allocation) => {
        const amount = Number(allocation.amount);
        return Number.isFinite(amount) ? sum + amount : sum;
      }, 0),
    [journalForm.allocations]
  );

  return (
    <main style={pageStyle}>
      <NeonV2HomeSections
        loading={loading}
        savingClient={savingClient}
        savingAccount={savingAccount}
        savingActivity={savingActivity}
        savingJournal={savingJournal}
        clients={clients}
        accounts={accounts}
        activities={activities}
        journalEntries={journalEntries}
        clientForm={clientForm}
        setClientForm={setClientForm}
        accountForm={accountForm}
        setAccountForm={setAccountForm}
        activityForm={activityForm}
        setActivityForm={setActivityForm}
        journalForm={journalForm}
        setJournalForm={setJournalForm}
        journalAllocationTotal={journalAllocationTotal}
        dashboard={dashboard}
        onCreateClient={handleCreateClient}
        onCreateAccount={handleCreateAccount}
        onCreateActivity={handleCreateActivity}
        onCreateJournalEntry={handleCreateJournalEntry}
      />
    </main>
  );
}
