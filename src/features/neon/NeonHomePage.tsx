import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  createNeonAccount,
  createNeonActivity,
  createNeonClient,
  createNeonCreditEntry,
  createNeonJournalEntry,
  createNeonSupplier,
  deleteNeonAccount,
  deleteNeonJournalEntry,
  updateNeonActivity,
  updateNeonAccount,
  listNeonAccounts,
  listNeonActivities,
  listNeonCreditEntries,
  listNeonClients,
  listNeonJournal,
  listNeonSuppliers,
  resetNeonWorkspace
} from "./neon.client";
import { getTodayDateInputValue, toTitleCase } from "./neon.home.helpers";
import { pageStyle } from "./neon.home.styles";
import { NeonAccount, NeonActivity, NeonClient, NeonCreditEntry, NeonJournalAllocationInput, NeonJournalEntry, NeonSupplier } from "./neon.types";
import { buildDashboardSummary } from "./neon.v2.dashboard";
import { createEmptyJournalAllocation } from "./neon.v2.journal";
import { NeonV2HomeSections } from "./neon.v2.sections";
import {
  AccountFormState,
  ActivityFormState,
  CreditFormState,
  CostCenterFormState,
  ClientFormState,
  DebtReportRange,
  JournalFormState,
  NeonCostCenterRecord,
  NeonCompanyKey,
  PendingDeleteAccountState,
  PendingEditCostCenterState,
  PendingEditAccountState,
  PendingDeleteCostCenterState,
  NeonWorkspaceView,
  PendingDeleteJournalState,
  PendingResetWorkspaceState,
  ReportPeriodFilter,
  SupplierFormState
} from "./neon.v2.types";

const ACTIVE_COMPANY_STORAGE_KEY = "neon-active-company-v3";
const COST_CENTERS_STORAGE_KEY = "neon-cost-centers-v4";

const DEFAULT_COST_CENTERS: NeonCostCenterRecord[] = [
  {
    id: "vehicle-toyota-raa1111",
    companyKey: "empresa_verde",
    scope: "vehicle",
    typeLabel: null,
    label: "Toyota RAA1111",
    createdAt: "2026-05-02T08:00:00.000-03:00"
  },
  {
    id: "vehicle-micro-sah2222",
    companyKey: "empresa_verde",
    scope: "vehicle",
    typeLabel: null,
    label: "Micro SAH2222",
    createdAt: "2026-05-02T08:01:00.000-03:00"
  },
  {
    id: "personal-casa",
    companyKey: "empresa_verde",
    scope: "personal",
    typeLabel: null,
    label: "Casa",
    createdAt: "2026-05-02T08:02:00.000-03:00"
  },
  {
    id: "personal-uso-personal",
    companyKey: "empresa_verde",
    scope: "personal",
    typeLabel: null,
    label: "Uso personal",
    createdAt: "2026-05-02T08:03:00.000-03:00"
  },
  {
    id: "rental-alq1",
    companyKey: "empresa_verde",
    scope: "rental",
    typeLabel: null,
    label: "ALQ1",
    createdAt: "2026-05-02T08:04:00.000-03:00"
  },
  {
    id: "rental-alq2",
    companyKey: "empresa_verde",
    scope: "rental",
    typeLabel: null,
    label: "ALQ2",
    createdAt: "2026-05-02T08:05:00.000-03:00"
  },
  {
    id: "other-generador",
    companyKey: "empresa_verde",
    scope: "other",
    typeLabel: null,
    label: "Generador",
    createdAt: "2026-05-02T08:06:00.000-03:00"
  },
  {
    id: "other-herramientas",
    companyKey: "empresa_verde",
    scope: "other",
    typeLabel: null,
    label: "Herramientas",
    createdAt: "2026-05-02T08:07:00.000-03:00"
  }
];

function getInitialActiveCompany(): NeonCompanyKey {
  if (typeof window === "undefined") {
    return "empresa_verde";
  }

  const storedValue = window.localStorage.getItem(ACTIVE_COMPANY_STORAGE_KEY);
  if (storedValue === "empresa_negra") {
    return "empresa_negra";
  }

  if (storedValue === "empresa_c") {
    return "empresa_c";
  }

  return "empresa_verde";
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

    return parsed.map((center) => ({
      ...center,
      typeLabel: center.typeLabel || null
    }));
  } catch {
    return DEFAULT_COST_CENTERS;
  }
}

export function NeonHomePage() {
  const [loading, setLoading] = useState(true);
  const [savingClient, setSavingClient] = useState(false);
  const [savingSupplier, setSavingSupplier] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingActivity, setSavingActivity] = useState(false);
  const [savingCreditEntry, setSavingCreditEntry] = useState(false);
  const [savingJournal, setSavingJournal] = useState(false);
  const [clients, setClients] = useState<NeonClient[]>([]);
  const [suppliers, setSuppliers] = useState<NeonSupplier[]>([]);
  const [accounts, setAccounts] = useState<NeonAccount[]>([]);
  const [activities, setActivities] = useState<NeonActivity[]>([]);
  const [creditEntries, setCreditEntries] = useState<NeonCreditEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<NeonJournalEntry[]>([]);
  const [debtReportRange, setDebtReportRange] = useState<DebtReportRange>("all");
  const [reportPeriodFilter, setReportPeriodFilter] = useState<ReportPeriodFilter>({
    range: "all",
    dateFrom: "",
    dateTo: ""
  });
  const [activeCompany, setActiveCompany] = useState<NeonCompanyKey>(getInitialActiveCompany);
  const [costCenters, setCostCenters] = useState<NeonCostCenterRecord[]>(getInitialCostCenters);
  const [editingActivityId, setEditingActivityId] = useState<number | null>(null);
  const [pendingEditAccount, setPendingEditAccount] = useState<PendingEditAccountState>(null);
  const [pendingDeleteAccount, setPendingDeleteAccount] = useState<PendingDeleteAccountState>(null);
  const [pendingEditCostCenter, setPendingEditCostCenter] = useState<PendingEditCostCenterState>(null);
  const [pendingDeleteCostCenter, setPendingDeleteCostCenter] = useState<PendingDeleteCostCenterState>(null);
  const [pendingDeleteJournal, setPendingDeleteJournal] = useState<PendingDeleteJournalState>(null);
  const [pendingResetWorkspace, setPendingResetWorkspace] = useState<PendingResetWorkspaceState>(null);
  const [activeView, setActiveView] = useState<NeonWorkspaceView>("idle");
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [clientForm, setClientForm] = useState<ClientFormState>({
    name: "",
    phone: "",
    notes: ""
  });
  const [supplierForm, setSupplierForm] = useState<SupplierFormState>({
    name: "",
    address: "",
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
    invoiceCompanyKey: "empresa_verde"
  });
  const [journalForm, setJournalForm] = useState<JournalFormState>({
    movementType: "expense",
    movementDate: getTodayDateInputValue(),
    accountId: "",
    transferAccountId: "",
    totalAmount: "",
    description: "",
    expenseKind: "operational",
    expenseFlow: "direct",
    paymentApplicationMode: "fifo",
    providerId: "",
    selectedCreditEntryId: "",
    documentRef: "",
    quantity: "",
    unitLabel: "",
    currencyCode: "UYU",
    allocations: [createEmptyJournalAllocation()]
  });
  const [creditForm, setCreditForm] = useState<CreditFormState>({
    creditKind: "purchase",
    creditDate: getTodayDateInputValue(),
    dueDate: getTodayDateInputValue(),
    supplierId: "",
    totalAmount: "",
    description: "",
    documentRef: "",
    currencyCode: "UYU",
    allocations: [createEmptyJournalAllocation()]
  });
  const [costCenterForm, setCostCenterForm] = useState<CostCenterFormState>({
    editingId: null,
    scope: "vehicle",
    customTypeLabel: "",
    label: ""
  });

  const loadHomeData = useCallback(async () => {
    setLoading(true);

    try {
      const [nextClients, nextSuppliers, nextAccounts, nextActivities, nextCreditEntries, nextJournalEntries] = await Promise.all([
        listNeonClients(),
        listNeonSuppliers(),
        listNeonAccounts(),
        listNeonActivities(),
        listNeonCreditEntries(),
        listNeonJournal({ limit: 100 })
      ]);

      setClients(nextClients);
      setSuppliers(nextSuppliers);
      setAccounts(nextAccounts);
      setActivities(nextActivities);
      setCreditEntries(nextCreditEntries);
      setJournalEntries(nextJournalEntries);

      const defaultAccountId = nextAccounts[0] ? String(nextAccounts[0].id) : "";
      const defaultSupplierId = nextSuppliers[0] ? String(nextSuppliers[0].id) : "";
      setJournalForm((current) => ({
        ...current,
        accountId: current.accountId || defaultAccountId,
        providerId: current.providerId || defaultSupplierId
      }));
      setCreditForm((current) => ({
        ...current,
        supplierId: current.supplierId || defaultSupplierId
      }));
      setSelectedAccountId((current) => (current && nextAccounts.some((account) => account.id === current) ? current : nextAccounts[0]?.id || null));
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

  async function handleCreateSupplier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = toTitleCase(supplierForm.name);
    if (!name) {
      toast.error("Falta el nombre del proveedor");
      return;
    }

    setSavingSupplier(true);
    try {
      const createdSupplier = await createNeonSupplier({
        name,
        address: supplierForm.address.trim() || undefined,
        phone: supplierForm.phone.trim() || undefined,
        notes: supplierForm.notes.trim() || undefined
      });

      setSuppliers((current) => [createdSupplier, ...current.filter((supplier) => supplier.id !== createdSupplier.id)]);
      setSupplierForm({ name: "", address: "", phone: "", notes: "" });
      setJournalForm((current) => ({ ...current, providerId: String(createdSupplier.id) }));
      setCreditForm((current) => ({ ...current, supplierId: String(createdSupplier.id) }));
      toast.success("Proveedor guardado", { autoClose: 2400 });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el proveedor");
    } finally {
      setSavingSupplier(false);
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
      const savedAccount = pendingEditAccount
        ? await updateNeonAccount(pendingEditAccount.id, {
            name,
            accountType: accountForm.accountType,
            openingBalance
          })
        : await createNeonAccount({
            name,
            accountType: accountForm.accountType,
            openingBalance
          });

      setAccounts((current) =>
        pendingEditAccount
          ? current.map((account) => (account.id === savedAccount.id ? savedAccount : account)).sort((left, right) => left.id - right.id)
          : [...current, savedAccount].sort((left, right) => left.id - right.id)
      );
      setAccountForm({ name: "", accountType: "cash", openingBalance: "" });
      setPendingEditAccount(null);
      setJournalForm((current) => ({
        ...current,
        accountId: current.accountId || String(savedAccount.id)
      }));
      toast.success(pendingEditAccount ? "Cuenta actualizada" : "Cuenta guardada", { autoClose: 2400 });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar la cuenta");
    } finally {
      setSavingAccount(false);
    }
  }

  function handleEditAccount(accountId: number) {
    const account = accounts.find((item) => item.id === accountId);
    if (!account) {
      toast.error("No se pudo cargar esa cuenta");
      return;
    }

    const isUsedInJournal = journalEntries.some((entry) => entry.accountId === account.id || entry.transferAccountId === account.id);
    if (isUsedInJournal) {
      toast.error("Esa cuenta ya tiene movimientos y no conviene editarla");
      return;
    }

    setAccountForm({
      name: account.name,
      accountType: account.accountType === "bank" ? "bank" : "cash",
      openingBalance: String(account.openingBalance)
    });
    setPendingEditAccount({ id: account.id });
  }

  function handleCancelAccountEdit() {
    setPendingEditAccount(null);
    setAccountForm({
      name: "",
      accountType: "cash",
      openingBalance: ""
    });
  }

  function handleRequestDeleteAccount(accountId: number) {
    const account = accounts.find((item) => item.id === accountId);
    if (!account) {
      toast.error("No se pudo encontrar esa cuenta");
      return;
    }

    const relatedMovementCount = journalEntries.filter(
      (entry) => entry.accountId === account.id || entry.transferAccountId === account.id
    ).length;

    setPendingDeleteAccount({
      id: account.id,
      label: account.name,
      relatedMovementCount
    });
  }

  async function handleConfirmDeleteAccount() {
    if (!pendingDeleteAccount) {
      return;
    }

    setSavingAccount(true);
    try {
      await deleteNeonAccount(pendingDeleteAccount.id);
      await loadHomeData();
      setPendingDeleteAccount(null);
      if (pendingEditAccount?.id === pendingDeleteAccount.id) {
        handleCancelAccountEdit();
      }
      toast.success("Cuenta y movimientos asociados borrados", { autoClose: 2400 });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo borrar la cuenta");
    } finally {
      setSavingAccount(false);
    }
  }

  function handleCancelDeleteAccount() {
    setPendingDeleteAccount(null);
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

    if (activityForm.commercialStatus === "facturado") {
      if (!activityForm.invoiceDate) {
        toast.error("Falta la fecha de facturacion");
        return;
      }

      if (!activityForm.invoiceCompanyKey) {
        toast.error("Falta la empresa de facturacion");
        return;
      }
    }

    setSavingActivity(true);
    try {
      const activityPayload = {
        activityDate: activityForm.activityDate,
        description,
        clientId: activityForm.clientId ? Number(activityForm.clientId) : undefined,
        activityType: activityForm.activityType,
        quotedAmount,
        commercialStatus: activityForm.commercialStatus,
        invoiceDate: activityForm.commercialStatus === "facturado" ? activityForm.invoiceDate : undefined,
        invoicedAmount: activityForm.commercialStatus === "facturado" ? quotedAmount : undefined,
        invoiceCompanyKey: activityForm.commercialStatus === "facturado" ? activityForm.invoiceCompanyKey : undefined
      };

      if (editingActivityId) {
        const updatedActivity = await updateNeonActivity(editingActivityId, activityPayload);
        setActivities((current) => current.map((activity) => (activity.id === updatedActivity.id ? updatedActivity : activity)));
        toast.success("Actividad actualizada", { autoClose: 2400 });
      } else {
        const createdActivity = await createNeonActivity({
          ...activityPayload,
          companyKey: activityForm.commercialStatus === "facturado" ? activityForm.invoiceCompanyKey : "empresa_c"
        });

        setActivities((current) => [createdActivity, ...current]);
        toast.success("Actividad guardada", { autoClose: 2400 });
      }

      setActivityForm((current) => ({
        ...current,
        activityDate: getTodayDateInputValue(),
        description: "",
        clientId: "",
        activityType: "neon",
        quotedAmount: "",
        commercialStatus: "pendiente_de_facturar",
        invoiceDate: getTodayDateInputValue(),
        invoiceCompanyKey: activeCompany
      }));
      setEditingActivityId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar la actividad");
    } finally {
      setSavingActivity(false);
    }
  }

  function handleStartActivityEdit(activityId: number) {
    const activity = activities.find((item) => item.id === activityId);
    if (!activity) {
      toast.error("No se pudo cargar esa actividad");
      return;
    }

    setEditingActivityId(activity.id);
    setActivityForm({
      activityDate: activity.activityDate,
      description: activity.description,
      clientId: activity.clientId ? String(activity.clientId) : "",
      activityType: activity.activityType,
      quotedAmount: String(activity.quotedAmount),
      commercialStatus: activity.invoiceCompanyKey ? "facturado" : "pendiente_de_facturar",
      invoiceDate: activity.invoiceDate || getTodayDateInputValue(),
      invoiceCompanyKey: activity.invoiceCompanyKey || activeCompany
    });
  }

  function handleCancelActivityEdit() {
    setEditingActivityId(null);
    setActivityForm({
      activityDate: getTodayDateInputValue(),
      description: "",
      clientId: "",
      activityType: "neon",
      quotedAmount: "",
      commercialStatus: "pendiente_de_facturar",
      invoiceDate: getTodayDateInputValue(),
      invoiceCompanyKey: activeCompany
    });
  }

  async function handleCreateCreditEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!creditForm.supplierId) {
      toast.error("Campo faltante: Proveedor. Elegi a quien corresponde el pendiente.");
      return;
    }

    if (!creditForm.dueDate) {
      toast.error("Campo faltante: Vencimiento. Indica cuando vence el pendiente.");
      return;
    }

    const normalizedAllocations: NeonJournalAllocationInput[] = creditForm.allocations
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
        customTypeLabel: allocation.customTypeLabel.trim() || undefined,
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
          allocation.destinationType === "other" ||
          allocation.destinationType === "custom") &&
        !allocation.destinationLabel
      ) {
        toast.error("Campo faltante: Etiqueta en linea de asignacion. Completa a que sector va ese gasto.");
        return;
      }

      if (allocation.destinationType === "custom" && !allocation.customTypeLabel) {
        toast.error("Campo faltante: Tipo de centro de costo. Elegi el tipo personalizado correspondiente.");
        return;
      }
    }

    const totalAmount = Number(creditForm.totalAmount);
    const allocationTotal = normalizedAllocations.reduce((sum, allocation) => sum + allocation.amount, 0);
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      toast.error("Campo invalido: Importe total. Ingresa un numero mayor a 0.");
      return;
    }

    if (normalizedAllocations.length === 0) {
      toast.error("Campo faltante: Destino del gasto. Agrega al menos una linea.");
      return;
    }

    if (Math.round(allocationTotal * 100) !== Math.round(totalAmount * 100)) {
      toast.error("Campos inconsistentes: Importe total y lineas de asignacion. La suma debe coincidir exactamente.");
      return;
    }

    setSavingCreditEntry(true);
    try {
      const createdEntry = await createNeonCreditEntry({
        companyKey: "empresa_verde",
        supplierId: Number(creditForm.supplierId),
        creditKind: creditForm.creditKind,
        creditDate: creditForm.creditDate,
        dueDate: creditForm.dueDate,
        totalAmount,
        description: creditForm.description.trim() || undefined,
        documentRef: creditForm.documentRef.trim() || undefined,
        currencyCode: creditForm.currencyCode,
        allocations: normalizedAllocations
      });

      setCreditEntries((current) => [createdEntry, ...current]);
      setCreditForm({
        creditKind: "purchase",
        creditDate: getTodayDateInputValue(),
        dueDate: getTodayDateInputValue(),
        supplierId: creditForm.supplierId,
        totalAmount: "",
        description: "",
        documentRef: "",
        currencyCode: "UYU",
        allocations: [createEmptyJournalAllocation()]
      });
      await loadHomeData();
      toast.success("Pendiente guardado", { autoClose: 2400 });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el pendiente");
    } finally {
      setSavingCreditEntry(false);
    }
  }

  async function handleCreateJournalEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!journalForm.accountId) {
      toast.error("Campo faltante: Cuenta. Elegi desde que cuenta sale o entra el movimiento.");
      return;
    }

    const requiresAllocations = journalForm.movementType !== "transfer" && !(journalForm.movementType === "expense" && journalForm.expenseFlow === "credit_payment");
    const normalizedAllocations: NeonJournalAllocationInput[] = requiresAllocations
      ? journalForm.allocations
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
            customTypeLabel: allocation.customTypeLabel.trim() || undefined,
            amount: Number(allocation.amount),
            kilometers: allocation.kilometers ? Number(allocation.kilometers) : undefined,
            liters: allocation.liters ? Number(allocation.liters) : undefined
          }))
      : [];

    if (requiresAllocations) {
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
            allocation.destinationType === "other" ||
            allocation.destinationType === "custom") &&
          !allocation.destinationLabel
        ) {
          toast.error("Campo faltante: Etiqueta en linea de asignacion. Completa a que corresponde esa linea.");
          return;
        }

        if (allocation.destinationType === "custom" && !allocation.customTypeLabel) {
          toast.error("Campo faltante: Tipo de centro de costo. Elegi el tipo personalizado correspondiente.");
          return;
        }

        if (journalForm.movementType === "income" && allocation.destinationType === "activity" && allocation.destinationActivityId) {
          const relatedActivity = activities.find((activity) => activity.id === allocation.destinationActivityId);
          if (relatedActivity && allocation.amount > relatedActivity.pendingAmount) {
            toast.error(
              `Campo inconsistente: Cobro mayor al pendiente. La actividad ${relatedActivity.activityNumber}/${relatedActivity.activityYear} tiene pendiente ${relatedActivity.pendingAmount.toFixed(2)}.`
            );
            return;
          }
        }
      }
    }

    const allocationTotal = normalizedAllocations.reduce((sum, allocation) => sum + allocation.amount, 0);
    const usesSingleIncomeActivityAllocation =
      journalForm.movementType === "income" &&
      normalizedAllocations.length === 1 &&
      normalizedAllocations[0]?.destinationType === "activity";
    const totalAmount = usesSingleIncomeActivityAllocation ? allocationTotal : Number(journalForm.totalAmount);

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      toast.error("Campo invalido: Monto total. Ingresa un numero mayor a 0.");
      return;
    }

    if (journalForm.movementType === "transfer") {
      if (!journalForm.transferAccountId) {
        toast.error("Campo faltante: Cuenta destino. Elegi a que cuenta entra el dinero.");
        return;
      }

      if (journalForm.transferAccountId === journalForm.accountId) {
        toast.error("Campo inconsistente: Cuenta origen y destino. En un traspaso deben ser distintas.");
        return;
      }
    }

    if (journalForm.movementType === "expense") {
      if (!journalForm.currencyCode) {
        toast.error("Campo faltante: Moneda. Elegi la moneda del gasto.");
        return;
      }

      if (!journalForm.providerId) {
        toast.error("Campo faltante: Proveedor. Elegi un proveedor registrado.");
        return;
      }

      if (journalForm.expenseFlow === "credit_payment") {
        const selectedSupplierId = Number(journalForm.providerId);
        const compatibleCreditEntries = creditEntries
          .filter(
            (entry) =>
              entry.supplierId === selectedSupplierId && entry.currencyCode === (journalForm.currencyCode || "UYU")
          );
        const supplierPendingAmount = compatibleCreditEntries.reduce((sum, entry) => sum + entry.pendingAmount, 0);

        if (supplierPendingAmount <= 0) {
          toast.error(`Ese proveedor no tiene pendientes para cancelar en ${journalForm.currencyCode || "UYU"}.`);
          return;
        }

        if (journalForm.paymentApplicationMode === "specific") {
          if (!journalForm.selectedCreditEntryId) {
            toast.error("Elegi el pendiente puntual que queres pagar.");
            return;
          }

          const selectedCreditEntry = compatibleCreditEntries.find((entry) => String(entry.id) === journalForm.selectedCreditEntryId);
          if (!selectedCreditEntry || selectedCreditEntry.pendingAmount <= 0) {
            toast.error("Ese pendiente ya no esta disponible para pagar.");
            return;
          }

          if (totalAmount > selectedCreditEntry.pendingAmount) {
            toast.error(
              `El pago supera el saldo del pendiente elegido en ${journalForm.currencyCode || "UYU"} (${selectedCreditEntry.pendingAmount.toFixed(2)}).`
            );
            return;
          }
        }

        if (totalAmount > supplierPendingAmount) {
          toast.error(
            `El pago supera el pendiente abierto para ese proveedor en ${journalForm.currencyCode || "UYU"} (${supplierPendingAmount.toFixed(2)}).`
          );
          return;
        }
      }
    }

    if (requiresAllocations && normalizedAllocations.length === 0) {
      toast.error("Campo faltante: Destino del gasto. Agrega al menos una linea.");
      return;
    }

    if (normalizedAllocations.length > 0) {
      if (Math.round(allocationTotal * 100) !== Math.round(totalAmount * 100)) {
        toast.error("Campos inconsistentes: Monto total y lineas de asignacion. La suma de las lineas debe coincidir exactamente con el monto total.");
        return;
      }
    }

    setSavingJournal(true);
    try {
      const createdEntry = await createNeonJournalEntry({
        companyKey: "empresa_verde",
        movementType: journalForm.movementType,
        movementDate: journalForm.movementDate,
        accountId: Number(journalForm.accountId),
        transferAccountId: journalForm.movementType === "transfer" ? Number(journalForm.transferAccountId) : undefined,
        totalAmount,
        description: journalForm.description.trim() || undefined,
        expenseKind:
          journalForm.movementType === "expense"
            ? journalForm.expenseFlow === "credit_payment"
              ? "credit_settlement"
              : "operational"
            : undefined,
        providerId: journalForm.movementType === "expense" ? Number(journalForm.providerId) : undefined,
        settlementCreditEntryId:
          journalForm.movementType === "expense" &&
          journalForm.expenseFlow === "credit_payment" &&
          journalForm.paymentApplicationMode === "specific" &&
          journalForm.selectedCreditEntryId
            ? Number(journalForm.selectedCreditEntryId)
            : undefined,
        documentRef: undefined,
        quantity: undefined,
        unitLabel: undefined,
        currencyCode: journalForm.movementType === "expense" ? journalForm.currencyCode || undefined : undefined,
        creditCardLabel: undefined,
        dueDate: undefined,
        allocations:
          journalForm.movementType === "transfer" || journalForm.expenseFlow === "credit_payment"
            ? undefined
            : normalizedAllocations.length > 0
              ? normalizedAllocations
              : undefined
      });

      setJournalEntries((current) => [createdEntry, ...current]);
      await loadHomeData();
      setJournalForm((current) => ({
        ...current,
        movementDate: getTodayDateInputValue(),
        totalAmount: "",
        transferAccountId: "",
        description: "",
        expenseKind: "operational",
        expenseFlow: "direct",
        paymentApplicationMode: "fifo",
        providerId: "",
        selectedCreditEntryId: "",
        documentRef: "",
        quantity: "",
        unitLabel: "",
        currencyCode: "UYU",
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
    const normalizedTypeLabel = costCenterForm.scope === "custom" ? toTitleCase(costCenterForm.customTypeLabel.trim()) : null;
    if (costCenterForm.scope === "custom" && !normalizedTypeLabel) {
      toast.error("Falta el tipo del centro de costo");
      return;
    }

    const exists = costCenters.some(
      (center) =>
        center.id !== costCenterForm.editingId &&
        center.scope === costCenterForm.scope &&
        (center.typeLabel || "") === (normalizedTypeLabel || "") &&
        center.label.toLowerCase() === normalizedLabel.toLowerCase()
    );

    if (exists) {
      toast.error("Ese centro ya existe");
      return;
    }

    const nextCenter: NeonCostCenterRecord = {
      id: `${costCenterForm.scope}-${Date.now()}`,
      companyKey: "empresa_verde",
      scope: costCenterForm.scope,
      typeLabel: normalizedTypeLabel,
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
      customTypeLabel: "",
      label: ""
    });
    toast.success("Centro de costo guardado", { autoClose: 2400 });
  }

  function handleEditCostCenter(centerId: string) {
    const center = costCenters.find((item) => item.id === centerId);
    if (!center) {
      toast.error("No se pudo cargar ese centro");
      return;
    }

    const isUsedInJournal = journalEntries.some(
      (entry) =>
        entry.allocations.some(
          (allocation) =>
            allocation.destinationType === center.scope &&
            allocation.destinationLabel?.trim() === center.label &&
            (center.scope !== "custom" || allocation.metadata?.typeLabel === center.typeLabel)
        )
    );

    if (isUsedInJournal) {
      toast.error("Ese centro ya tiene movimientos y no conviene editarlo");
      return;
    }

    setCostCenterForm({
      editingId: center.id,
      scope: center.scope,
      customTypeLabel: center.typeLabel || "",
      label: center.label
    });
    setPendingEditCostCenter({ id: center.id });
  }

  function handleCancelCostCenterEdit() {
    setCostCenterForm({
      editingId: null,
      scope: "vehicle",
      customTypeLabel: "",
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
    const normalizedTypeLabel = costCenterForm.scope === "custom" ? toTitleCase(costCenterForm.customTypeLabel.trim()) : null;
    if (costCenterForm.scope === "custom" && !normalizedTypeLabel) {
      toast.error("Falta el tipo del centro de costo");
      return;
    }

    const exists = costCenters.some(
      (center) =>
        center.id !== costCenterForm.editingId &&
        center.scope === costCenterForm.scope &&
        (center.typeLabel || "") === (normalizedTypeLabel || "") &&
        center.label.toLowerCase() === normalizedLabel.toLowerCase()
    );

    if (exists) {
      toast.error("Ese centro ya existe");
      return;
    }

    setCostCenters((current) =>
      current
        .map((center) =>
          center.id === costCenterForm.editingId
            ? {
                ...center,
                companyKey: center.companyKey,
                scope: costCenterForm.scope,
                typeLabel: normalizedTypeLabel,
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
    const center = costCenters.find((item) => item.id === centerId);
    if (!center) {
      toast.error("No se pudo encontrar ese centro");
      return;
    }

    const isUsedInJournal = journalEntries.some(
      (entry) =>
        entry.allocations.some(
          (allocation) =>
            allocation.destinationType === center.scope &&
            allocation.destinationLabel?.trim() === center.label &&
            (center.scope !== "custom" || allocation.metadata?.typeLabel === center.typeLabel)
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

  function handleRequestDeleteJournal(entryId: number, label: string) {
    setPendingDeleteJournal({
      id: entryId,
      label
    });
  }

  async function handleConfirmDeleteJournal() {
    if (!pendingDeleteJournal) {
      return;
    }

    setSavingJournal(true);
    try {
      await deleteNeonJournalEntry(pendingDeleteJournal.id);
      await loadHomeData();
      setPendingDeleteJournal(null);
      toast.success("Movimiento borrado", { autoClose: 2400 });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo borrar el movimiento");
    } finally {
      setSavingJournal(false);
    }
  }

  function handleCancelDeleteJournal() {
    setPendingDeleteJournal(null);
  }

  function handleRequestResetWorkspace(mode: "demo" | "empty") {
    setPendingResetWorkspace(
      mode === "empty"
        ? {
            mode,
            title: "Borrar datos de ejemplo",
            message: "Seguro que deseas borrar los datos de ejemplo? Luego vas a poder restaurarlos si los necesitas.",
            confirmLabel: "Si, borrar"
          }
        : {
            mode,
            title: "Restaurar demo",
            message: "Seguro que deseas volver a mostrar los datos de ejemplo?",
            confirmLabel: "Si, restaurar"
          }
    );
  }

  function handleCancelResetWorkspace() {
    setPendingResetWorkspace(null);
  }

  async function handleConfirmResetWorkspace() {
    if (!pendingResetWorkspace) {
      return;
    }

    const { mode } = pendingResetWorkspace;
    setLoading(true);
    try {
      await resetNeonWorkspace(mode);
      setCostCenters(mode === "demo" ? DEFAULT_COST_CENTERS : []);
      setCostCenterForm({
        editingId: null,
        scope: "vehicle",
        customTypeLabel: "",
        label: ""
      });
      setPendingEditAccount(null);
      setPendingDeleteAccount(null);
      setPendingDeleteCostCenter(null);
      setPendingEditCostCenter(null);
      setPendingDeleteJournal(null);
      setPendingResetWorkspace(null);
      await loadHomeData();
      toast.success(mode === "demo" ? "Datos demo restaurados" : "Workspace limpio para cargar datos propios", { autoClose: 2400 });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar el workspace");
      setLoading(false);
    }
  }

  const dashboard = useMemo(() => {
    return buildDashboardSummary(accounts, activities, journalEntries, creditEntries, debtReportRange, reportPeriodFilter);
  }, [accounts, activities, journalEntries, creditEntries, debtReportRange, reportPeriodFilter]);

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
        savingSupplier={savingSupplier}
        savingAccount={savingAccount}
        savingActivity={savingActivity}
        savingCreditEntry={savingCreditEntry}
        savingJournal={savingJournal}
        clients={clients}
        suppliers={suppliers}
        accounts={accounts}
        activities={activities}
        creditEntries={creditEntries}
        journalEntries={journalEntries}
        costCenters={costCenters}
        clientForm={clientForm}
        setClientForm={setClientForm}
        supplierForm={supplierForm}
        setSupplierForm={setSupplierForm}
        accountForm={accountForm}
        setAccountForm={setAccountForm}
        activityForm={activityForm}
        setActivityForm={setActivityForm}
        creditForm={creditForm}
        setCreditForm={setCreditForm}
        journalForm={journalForm}
        setJournalForm={setJournalForm}
        costCenterForm={costCenterForm}
        setCostCenterForm={setCostCenterForm}
        activeCompany={activeCompany}
        setActiveCompany={setActiveCompany}
        editingActivityId={editingActivityId}
        pendingEditAccount={pendingEditAccount}
        pendingDeleteAccount={pendingDeleteAccount}
        pendingEditCostCenter={pendingEditCostCenter}
        pendingDeleteCostCenter={pendingDeleteCostCenter}
        pendingDeleteJournal={pendingDeleteJournal}
        pendingResetWorkspace={pendingResetWorkspace}
        activeView={activeView}
        setActiveView={setActiveView}
        selectedAccountId={selectedAccountId}
        setSelectedAccountId={setSelectedAccountId}
        debtReportRange={debtReportRange}
        setDebtReportRange={setDebtReportRange}
        reportPeriodFilter={reportPeriodFilter}
        setReportPeriodFilter={setReportPeriodFilter}
        journalAllocationTotal={journalAllocationTotal}
        dashboard={dashboard}
        onCreateClient={handleCreateClient}
        onCreateSupplier={handleCreateSupplier}
        onCreateAccount={handleCreateAccount}
        onEditAccount={handleEditAccount}
        onCancelAccountEdit={handleCancelAccountEdit}
        onDeleteAccount={handleRequestDeleteAccount}
        onConfirmDeleteAccount={handleConfirmDeleteAccount}
        onCancelDeleteAccount={handleCancelDeleteAccount}
        onCreateActivity={handleCreateActivity}
        onStartActivityEdit={handleStartActivityEdit}
        onCancelActivityEdit={handleCancelActivityEdit}
        onCreateCreditEntry={handleCreateCreditEntry}
        onCreateJournalEntry={handleCreateJournalEntry}
        onCreateCostCenter={handleCreateCostCenter}
        onEditCostCenter={handleEditCostCenter}
        onCancelCostCenterEdit={handleCancelCostCenterEdit}
        onConfirmCostCenterEdit={handleConfirmCostCenterEdit}
        onDeleteCostCenter={handleRequestDeleteCostCenter}
        onConfirmDeleteCostCenter={handleConfirmDeleteCostCenter}
        onCancelDeleteCostCenter={handleCancelDeleteCostCenter}
        onDeleteJournalEntry={handleRequestDeleteJournal}
        onConfirmDeleteJournalEntry={handleConfirmDeleteJournal}
        onCancelDeleteJournalEntry={handleCancelDeleteJournal}
        onRequestResetWorkspace={handleRequestResetWorkspace}
        onConfirmResetWorkspace={handleConfirmResetWorkspace}
        onCancelResetWorkspace={handleCancelResetWorkspace}
      />
    </main>
  );
}

