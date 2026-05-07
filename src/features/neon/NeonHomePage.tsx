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
import {
  buildDashboardSummary,
  filterActivitiesByCompany,
  filterJournalEntriesByCompany
} from "./neon.v2.dashboard";
import { createEmptyJournalAllocation } from "./neon.v2.journal";
import { NeonV2HomeSections } from "./neon.v2.sections";
import {
  AccountFormState,
  ActivityFormState,
  CostCenterFormState,
  ClientFormState,
  DebtReportRange,
  JournalFormState,
  NeonCostCenterRecord,
  NeonCompanyKey,
  PendingEditCostCenterState,
  PendingDeleteCostCenterState,
  NeonWorkspaceView,
  ReportPeriodFilter
} from "./neon.v2.types";

const ACTIVE_COMPANY_STORAGE_KEY = "neon-active-company-v2";
const COST_CENTERS_STORAGE_KEY = "neon-cost-centers-v2";

const DEFAULT_COST_CENTERS: NeonCostCenterRecord[] = [
  { id: "ev-vehicle-toyota", companyKey: "empresa_verde", scope: "vehicle", label: "Toyota RAA1111", createdAt: "2026-05-02T09:00:00.000-03:00" },
  { id: "ev-vehicle-micro", companyKey: "empresa_verde", scope: "vehicle", label: "Micro SAH2222", createdAt: "2026-05-02T09:00:00.000-03:00" },
  { id: "ev-vehicle-movil", companyKey: "empresa_verde", scope: "vehicle", label: "Movil RAE2323", createdAt: "2026-05-02T09:00:00.000-03:00" },
  { id: "ev-personal-casa", companyKey: "empresa_verde", scope: "personal", label: "Casa", createdAt: "2026-05-02T09:00:00.000-03:00" },
  { id: "ev-personal-uso", companyKey: "empresa_verde", scope: "personal", label: "Uso personal", createdAt: "2026-05-02T09:00:00.000-03:00" },
  { id: "ev-rental-alq1", companyKey: "empresa_verde", scope: "rental", label: "ALQ1", createdAt: "2026-05-02T09:00:00.000-03:00" },
  { id: "ev-rental-alq2", companyKey: "empresa_verde", scope: "rental", label: "ALQ2", createdAt: "2026-05-02T09:00:00.000-03:00" },
  { id: "ev-other-otros", companyKey: "empresa_verde", scope: "other", label: "Otros", createdAt: "2026-05-02T09:00:00.000-03:00" },
  { id: "en-vehicle-camioneta", companyKey: "empresa_negra", scope: "vehicle", label: "Camioneta AV1", createdAt: "2026-05-02T09:00:00.000-03:00" },
  { id: "en-personal-casa", companyKey: "empresa_negra", scope: "personal", label: "Casa", createdAt: "2026-05-02T09:00:00.000-03:00" },
  { id: "en-rental-equipo", companyKey: "empresa_negra", scope: "rental", label: "ALQ AV1", createdAt: "2026-05-02T09:00:00.000-03:00" },
  { id: "en-other-otros", companyKey: "empresa_negra", scope: "other", label: "Otros", createdAt: "2026-05-02T09:00:00.000-03:00" }
];

function getInitialActiveCompany(): NeonCompanyKey {
  if (typeof window === "undefined") {
    return "empresa_verde";
  }

  const storedValue = window.localStorage.getItem(ACTIVE_COMPANY_STORAGE_KEY);
  return storedValue === "empresa_negra" ? "empresa_negra" : "empresa_verde";
}

function getInitialCostCenters(): NeonCostCenterRecord[] {
  if (typeof window === "undefined") {
    return DEFAULT_COST_CENTERS;
  }

  const storedValue = window.localStorage.getItem(COST_CENTERS_STORAGE_KEY);
  if (!storedValue) {
    return DEFAULT_COST_CENTERS;
  }

  try {
    const parsed = JSON.parse(storedValue) as NeonCostCenterRecord[];
    if (!Array.isArray(parsed)) {
      return DEFAULT_COST_CENTERS;
    }

    return parsed;
  } catch {
    return DEFAULT_COST_CENTERS;
  }
}

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
  const [debtReportRange, setDebtReportRange] = useState<DebtReportRange>("all");
  const [reportPeriodFilter, setReportPeriodFilter] = useState<ReportPeriodFilter>({
    range: "all",
    dateFrom: "",
    dateTo: ""
  });
  const [activeCompany, setActiveCompany] = useState<NeonCompanyKey>(getInitialActiveCompany);
  const [costCenters, setCostCenters] = useState<NeonCostCenterRecord[]>(getInitialCostCenters);
  const [pendingEditCostCenter, setPendingEditCostCenter] = useState<PendingEditCostCenterState>(null);
  const [pendingDeleteCostCenter, setPendingDeleteCostCenter] = useState<PendingDeleteCostCenterState>(null);
  const [activeView, setActiveView] = useState<NeonWorkspaceView>("idle");
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
    commercialStatus: "pendiente_de_facturar",
    invoiceDate: getTodayDateInputValue(),
    invoicedAmount: ""
  });
  const [journalForm, setJournalForm] = useState<JournalFormState>({
    movementType: "expense",
    movementDate: getTodayDateInputValue(),
    accountId: "",
    totalAmount: "",
    description: "",
    expenseKind: "operational",
    providerName: "",
    documentRef: "",
    quantity: "",
    unitLabel: "",
    currencyCode: "UYU",
    creditCardLabel: "",
    dueDate: "",
    allocations: [createEmptyJournalAllocation()]
  });
  const [costCenterForm, setCostCenterForm] = useState<CostCenterFormState>({
    editingId: null,
    scope: "vehicle",
    label: ""
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

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(ACTIVE_COMPANY_STORAGE_KEY, activeCompany);
  }, [activeCompany]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(COST_CENTERS_STORAGE_KEY, JSON.stringify(costCenters));
  }, [costCenters]);

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
      toast.success("Cliente guardado", { autoClose: 2400 });
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
      toast.success("Cuenta guardada", { autoClose: 2400 });
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
    const invoicedAmount = activityForm.invoicedAmount ? Number(activityForm.invoicedAmount) : null;

    if (!description) {
      toast.error("Falta la descripcion de la actividad");
      return;
    }

    if (!Number.isFinite(quotedAmount) || quotedAmount < 0) {
      toast.error("El monto del trabajo debe ser valido");
      return;
    }

    if (activityForm.commercialStatus === "facturado") {
      if (!activityForm.invoiceDate) {
        toast.error("Falta la fecha de facturacion");
        return;
      }

      if (!Number.isFinite(invoicedAmount) || invoicedAmount === null || invoicedAmount < 0) {
        toast.error("El importe facturado debe ser valido");
        return;
      }
    }

    setSavingActivity(true);
    try {
      const createdActivity = await createNeonActivity({
        activityDate: activityForm.activityDate,
        description,
        clientId: activityForm.clientId ? Number(activityForm.clientId) : undefined,
        companyKey: activeCompany,
        activityType: activityForm.activityType,
        quotedAmount,
        commercialStatus: activityForm.commercialStatus,
        invoiceDate: activityForm.commercialStatus === "facturado" ? activityForm.invoiceDate : undefined,
        invoicedAmount: activityForm.commercialStatus === "facturado" ? invoicedAmount ?? undefined : undefined,
        invoiceCompanyKey: activityForm.commercialStatus === "facturado" ? activeCompany : undefined
      });

      setActivities((current) => [createdActivity, ...current]);
      setActivityForm((current) => ({
        ...current,
        activityDate: getTodayDateInputValue(),
        description: "",
        quotedAmount: "",
        commercialStatus: "pendiente_de_facturar",
        invoiceDate: getTodayDateInputValue(),
        invoicedAmount: ""
      }));
      toast.success("Actividad guardada", { autoClose: 2400 });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar la actividad");
    } finally {
      setSavingActivity(false);
    }
  }

  async function handleCreateJournalEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const totalAmount = Number(journalForm.totalAmount);
    const selectedAccount = accounts.find((account) => account.id === Number(journalForm.accountId));
    if (!journalForm.accountId) {
      toast.error("Campo faltante: Cuenta. Elegi desde que cuenta sale o entra el movimiento.");
      return;
    }

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      toast.error("Campo invalido: Monto total. Ingresa un numero mayor a 0.");
      return;
    }

    if (journalForm.movementType === "expense") {
      if (!journalForm.currencyCode) {
        toast.error("Campo faltante: Moneda. Elegi la moneda del gasto.");
        return;
      }

      if (journalForm.expenseKind === "credit_settlement") {
        if (selectedAccount?.accountType === "credit") {
          toast.error("Campo inconsistente: Cuenta. Un pago de tarjeta debe salir desde Caja o Banco, no desde una cuenta de credito.");
          return;
        }

        if (!journalForm.creditCardLabel.trim()) {
          toast.error("Campo faltante: Tarjeta. Indica que tarjeta estas cancelando.");
          return;
        }
      } else {
        if (!journalForm.providerName.trim()) {
          toast.error("Campo faltante: Proveedor. Escribi a quien le hiciste el gasto.");
          return;
        }
      }

      if (selectedAccount?.accountType === "credit" && journalForm.expenseKind !== "credit_settlement") {
        if (!journalForm.creditCardLabel.trim()) {
          toast.error("Campo faltante: Tarjeta. En una compra a credito tenes que indicar la tarjeta.");
          return;
        }
        if (!journalForm.dueDate) {
          toast.error("Campo faltante: Vencimiento. En una compra a credito tenes que cargar la fecha de vencimiento.");
          return;
        }
      }
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
        toast.error("Campo invalido: Linea de asignacion. Cada linea debe tener un monto mayor a 0.");
        return;
      }

      if (allocation.destinationType === "activity" && !allocation.destinationActivityId) {
        toast.error("Campo faltante: Actividad en linea de asignacion. Elegi la actividad correspondiente.");
        return;
      }

      if (
        (allocation.destinationType === "vehicle" ||
          allocation.destinationType === "personal" ||
          allocation.destinationType === "rental" ||
          allocation.destinationType === "other") &&
        !allocation.destinationLabel
      ) {
        toast.error("Campo faltante: Etiqueta en linea de asignacion. Completa a que corresponde esa linea.");
        return;
      }
    }

    if (normalizedAllocations.length > 0) {
      const allocationTotal = normalizedAllocations.reduce((sum, allocation) => sum + allocation.amount, 0);
      if (Math.round(allocationTotal * 100) !== Math.round(totalAmount * 100)) {
        toast.error("Campos inconsistentes: Monto total y lineas de asignacion. La suma de las lineas debe coincidir exactamente con el monto total.");
        return;
      }
    }

    setSavingJournal(true);
    try {
      const createdEntry = await createNeonJournalEntry({
        companyKey: activeCompany,
        movementType: journalForm.movementType,
        movementDate: journalForm.movementDate,
        accountId: Number(journalForm.accountId),
        totalAmount,
        description: journalForm.description.trim() || undefined,
        expenseKind: journalForm.movementType === "expense" ? journalForm.expenseKind : undefined,
        providerName:
          journalForm.movementType === "expense" && journalForm.expenseKind !== "credit_settlement"
            ? journalForm.providerName.trim() || undefined
            : undefined,
        documentRef: undefined,
        quantity: undefined,
        unitLabel: undefined,
        currencyCode: journalForm.movementType === "expense" ? journalForm.currencyCode || undefined : undefined,
        creditCardLabel:
          journalForm.movementType === "expense" &&
          (selectedAccount?.accountType === "credit" || journalForm.expenseKind === "credit_settlement")
            ? journalForm.creditCardLabel.trim() || undefined
            : undefined,
        dueDate:
          journalForm.movementType === "expense" &&
          selectedAccount?.accountType === "credit" &&
          journalForm.expenseKind !== "credit_settlement"
            ? journalForm.dueDate || undefined
            : undefined,
        allocations: normalizedAllocations.length > 0 ? normalizedAllocations : undefined
      });

      setJournalEntries((current) => [createdEntry, ...current]);
      await loadHomeData();
      setJournalForm((current) => ({
        ...current,
        movementDate: getTodayDateInputValue(),
        totalAmount: "",
        description: "",
        expenseKind: "operational",
        providerName: "",
        documentRef: "",
        quantity: "",
        unitLabel: "",
        currencyCode: "UYU",
        creditCardLabel: "",
        dueDate: "",
        allocations: [createEmptyJournalAllocation()]
      }));
      toast.success("Movimiento guardado", { autoClose: 2400 });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el movimiento");
    } finally {
      setSavingJournal(false);
    }
  }

  function handleCreateCostCenter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const label = costCenterForm.label.trim();
    if (!label) {
      toast.error("Falta el nombre del centro de costo");
      return;
    }

    const normalizedLabel = toTitleCase(label);
    const exists = costCenters.some(
      (center) =>
        center.id !== costCenterForm.editingId &&
        center.companyKey === activeCompany &&
        center.scope === costCenterForm.scope &&
        center.label.toLowerCase() === normalizedLabel.toLowerCase()
    );

    if (exists) {
      toast.error("Ese centro ya existe para esta empresa");
      return;
    }

    const nextCenter: NeonCostCenterRecord = {
      id: `${activeCompany}-${costCenterForm.scope}-${Date.now()}`,
      companyKey: activeCompany,
      scope: costCenterForm.scope,
      label: normalizedLabel,
      createdAt: new Date().toISOString()
    };

    setCostCenters((current) =>
      [...current, nextCenter].sort((left, right) =>
        left.scope !== right.scope ? left.scope.localeCompare(right.scope) : left.label.localeCompare(right.label)
      )
    );
    setCostCenterForm({
      editingId: null,
      scope: "vehicle",
      label: ""
    });
    toast.success("Centro de costo guardado", { autoClose: 2400 });
  }

  function handleEditCostCenter(centerId: string) {
    const center = costCenters.find((item) => item.id === centerId && item.companyKey === activeCompany);
    if (!center) {
      toast.error("No se pudo cargar ese centro");
      return;
    }

    const isUsedInJournal = journalEntries.some(
      (entry) =>
        entry.companyKey === center.companyKey &&
        entry.allocations.some(
          (allocation) => allocation.destinationType === center.scope && allocation.destinationLabel?.trim() === center.label
        )
    );

    if (isUsedInJournal) {
      toast.error("Ese centro ya tiene movimientos y no conviene editarlo");
      return;
    }

    setCostCenterForm({
      editingId: center.id,
      scope: center.scope,
      label: center.label
    });
    setPendingEditCostCenter({ id: center.id });
  }

  function handleCancelCostCenterEdit() {
    setCostCenterForm({
      editingId: null,
      scope: "vehicle",
      label: ""
    });
    setPendingEditCostCenter(null);
  }

  function handleConfirmCostCenterEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!costCenterForm.editingId || !pendingEditCostCenter) {
      return;
    }

    const label = costCenterForm.label.trim();
    if (!label) {
      toast.error("Falta el nombre del centro de costo");
      return;
    }

    const normalizedLabel = toTitleCase(label);
    const exists = costCenters.some(
      (center) =>
        center.id !== costCenterForm.editingId &&
        center.companyKey === activeCompany &&
        center.scope === costCenterForm.scope &&
        center.label.toLowerCase() === normalizedLabel.toLowerCase()
    );

    if (exists) {
      toast.error("Ese centro ya existe para esta empresa");
      return;
    }

    setCostCenters((current) =>
      current
        .map((center) =>
          center.id === costCenterForm.editingId
            ? {
                ...center,
                companyKey: activeCompany,
                scope: costCenterForm.scope,
                label: normalizedLabel
              }
            : center
        )
        .sort((left, right) => (left.scope !== right.scope ? left.scope.localeCompare(right.scope) : left.label.localeCompare(right.label)))
    );
    handleCancelCostCenterEdit();
    toast.success("Centro de costo actualizado", { autoClose: 2400 });
  }

  function handleRequestDeleteCostCenter(centerId: string) {
    const center = costCenters.find((item) => item.id === centerId && item.companyKey === activeCompany);
    if (!center) {
      toast.error("No se pudo encontrar ese centro");
      return;
    }

    const isUsedInJournal = journalEntries.some(
      (entry) =>
        entry.companyKey === center.companyKey &&
        entry.allocations.some(
          (allocation) => allocation.destinationType === center.scope && allocation.destinationLabel?.trim() === center.label
        )
    );

    if (isUsedInJournal) {
      toast.error("Ese centro ya tiene movimientos y no conviene borrarlo");
      return;
    }

    setPendingDeleteCostCenter({
      id: center.id,
      label: center.label
    });
  }

  function handleConfirmDeleteCostCenter() {
    if (!pendingDeleteCostCenter) {
      return;
    }

    setCostCenters((current) => current.filter((item) => item.id !== pendingDeleteCostCenter.id));
    if (costCenterForm.editingId === pendingDeleteCostCenter.id) {
      handleCancelCostCenterEdit();
    }
    setPendingDeleteCostCenter(null);
    toast.success("Centro de costo borrado", { autoClose: 2400 });
  }

  function handleCancelDeleteCostCenter() {
    setPendingDeleteCostCenter(null);
  }

  const companyActivities = useMemo(() => filterActivitiesByCompany(activities, activeCompany), [activities, activeCompany]);
  const companyJournalEntries = useMemo(
    () => filterJournalEntriesByCompany(journalEntries, activities, activeCompany),
    [journalEntries, activities, activeCompany]
  );
  const companyCostCenters = useMemo(
    () => costCenters.filter((center) => center.companyKey === activeCompany),
    [costCenters, activeCompany]
  );

  const dashboard = useMemo(() => {
    return buildDashboardSummary(accounts, companyActivities, companyJournalEntries, debtReportRange, reportPeriodFilter);
  }, [accounts, companyActivities, companyJournalEntries, debtReportRange, reportPeriodFilter]);

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
        activities={companyActivities}
        journalEntries={companyJournalEntries}
        costCenters={companyCostCenters}
        clientForm={clientForm}
        setClientForm={setClientForm}
        accountForm={accountForm}
        setAccountForm={setAccountForm}
        activityForm={activityForm}
        setActivityForm={setActivityForm}
        journalForm={journalForm}
        setJournalForm={setJournalForm}
        costCenterForm={costCenterForm}
        setCostCenterForm={setCostCenterForm}
        activeCompany={activeCompany}
        setActiveCompany={setActiveCompany}
        pendingEditCostCenter={pendingEditCostCenter}
        pendingDeleteCostCenter={pendingDeleteCostCenter}
        activeView={activeView}
        setActiveView={setActiveView}
        debtReportRange={debtReportRange}
        setDebtReportRange={setDebtReportRange}
        reportPeriodFilter={reportPeriodFilter}
        setReportPeriodFilter={setReportPeriodFilter}
        journalAllocationTotal={journalAllocationTotal}
        dashboard={dashboard}
        onCreateClient={handleCreateClient}
        onCreateAccount={handleCreateAccount}
        onCreateActivity={handleCreateActivity}
        onCreateJournalEntry={handleCreateJournalEntry}
        onCreateCostCenter={handleCreateCostCenter}
        onEditCostCenter={handleEditCostCenter}
        onCancelCostCenterEdit={handleCancelCostCenterEdit}
        onConfirmCostCenterEdit={handleConfirmCostCenterEdit}
        onDeleteCostCenter={handleRequestDeleteCostCenter}
        onConfirmDeleteCostCenter={handleConfirmDeleteCostCenter}
        onCancelDeleteCostCenter={handleCancelDeleteCostCenter}
      />
    </main>
  );
}
