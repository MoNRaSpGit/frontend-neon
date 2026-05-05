import { type CSSProperties, FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  createNeonActivity,
  createNeonActivityPayment,
  createNeonClient,
  createNeonExpense,
  getNeonActivity,
  listNeonAccounts,
  listNeonActivities,
  listNeonCategories,
  listNeonClients,
  listNeonExpenses
} from "./neon.client";
import {
  type ActivityFormState,
  type ClientFormState,
  COLORS,
  type ExpenseActivitySummary,
  type ExpenseFormState,
  type NeonSectionKey,
  type PaymentFormState
} from "./neon.home.config";
import {
  formatActivityCode,
  formatMoney,
  getExpensePreviewLabel,
  getPreferredExpenseCategory,
  getTodayDateInputValue,
  getVisibleSummaryItems,
  toTitleCase
} from "./neon.home.helpers";
import { heroStyle, heroTitleStyle, pageStyle } from "./neon.home.styles";
import {
  NeonAccountsSection,
  NeonActivitiesSection,
  NeonExpensesSection,
  NeonIncomeSection,
  NeonOverviewCards
} from "./neon.home.sections";
import { NeonAccount, NeonActivity, NeonCategory, NeonClient, NeonExpense } from "./neon.types";

export function NeonHomePage() {
  const [demoStage, setDemoStage] = useState<1 | 2 | 3>(1);
  const [clients, setClients] = useState<NeonClient[]>([]);
  const [accounts, setAccounts] = useState<NeonAccount[]>([]);
  const [categories, setCategories] = useState<NeonCategory[]>([]);
  const [activities, setActivities] = useState<NeonActivity[]>([]);
  const [expenses, setExpenses] = useState<NeonExpense[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<NeonActivity | null>(null);
  const [expandedMovementActivityId, setExpandedMovementActivityId] = useState<number | null>(null);
  const [activityDetailsById, setActivityDetailsById] = useState<Record<number, NeonActivity>>({});
  const [selectedSection, setSelectedSection] = useState<NeonSectionKey>("activities");
  const [visibleActivitySummaries, setVisibleActivitySummaries] = useState(3);
  const [visibleIncomeActivities, setVisibleIncomeActivities] = useState(3);
  const [visibleExpenseSummaries, setVisibleExpenseSummaries] = useState(3);
  const [loading, setLoading] = useState(true);
  const [savingClient, setSavingClient] = useState(false);
  const [savingActivity, setSavingActivity] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [savingExpense, setSavingExpense] = useState(false);
  const [clientForm, setClientForm] = useState<ClientFormState>({
    name: "",
    phone: "",
    notes: ""
  });
  const [activityForm, setActivityForm] = useState<ActivityFormState>({
    activityDate: getTodayDateInputValue(),
    description: "",
    clientId: "",
    activityType: "neon",
    quotedAmount: "",
    commercialStatus: "pendiente_de_facturar"
  });
  const [paymentForm, setPaymentForm] = useState<PaymentFormState>({
    accountId: "",
    paymentDate: getTodayDateInputValue(),
    paidAmount: "",
    description: ""
  });
  const [expenseForm, setExpenseForm] = useState<ExpenseFormState>({
    accountId: "",
    categoryScope: "empresa",
    expenseDate: getTodayDateInputValue(),
    totalAmount: "",
    description: ""
  });

  function syncFormDefaults(nextAccounts: NeonAccount[], nextCategories: NeonCategory[], nextActivity: NeonActivity | null) {
    const defaultAccountId = nextAccounts[0] ? String(nextAccounts[0].id) : "";
    const hasPersonalCategory = nextCategories.some((category) => category.classification === "personal");

    setPaymentForm((current) => ({
      ...current,
      accountId: current.accountId || defaultAccountId,
      paidAmount:
        nextActivity && nextActivity.pendingAmount > 0 && !current.paidAmount ? String(nextActivity.pendingAmount) : current.paidAmount
    }));

    setExpenseForm((current) => ({
      ...current,
      accountId: current.accountId || defaultAccountId,
      categoryScope: current.categoryScope === "personal" && !hasPersonalCategory ? "empresa" : current.categoryScope
    }));
  }

  const loadHomeData = useCallback(async (preferredActivityId?: number) => {
    setLoading(true);

    try {
      const [nextClients, nextAccounts, nextCategories, nextActivities, nextExpenses] = await Promise.all([
        listNeonClients(),
        listNeonAccounts(),
        listNeonCategories(),
        listNeonActivities(),
        listNeonExpenses()
      ]);

      setClients(nextClients);
      setAccounts(nextAccounts);
      setCategories(nextCategories);
      setActivities(nextActivities);
      setExpenses(nextExpenses);

      const activityIdToOpen = preferredActivityId ?? nextActivities[0]?.id;
      if (activityIdToOpen) {
        const detail = await getNeonActivity(activityIdToOpen);
        setActivityDetailsById((current) => ({ ...current, [detail.id]: detail }));
        setActivities((current) => current.map((activity) => (activity.id === detail.id ? { ...activity, ...detail } : activity)));
        setSelectedActivity(detail);
        syncFormDefaults(nextAccounts, nextCategories, detail);
      } else {
        setSelectedActivity(null);
        syncFormDefaults(nextAccounts, nextCategories, null);
      }
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

      setClientForm({ name: "", phone: "", notes: "" });
      setActivityForm((current) => ({ ...current, clientId: String(createdClient.id) }));
      toast.success("Cliente guardado");
      await loadHomeData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el cliente");
    } finally {
      setSavingClient(false);
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
      toast.error("El precio debe ser un numero valido");
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

      setActivityForm({
        activityDate: getTodayDateInputValue(),
        description: "",
        clientId: activityForm.clientId,
        activityType: "neon",
        quotedAmount: "",
        commercialStatus: "pendiente_de_facturar"
      });
      toast.success("Actividad guardada");
      await loadHomeData(createdActivity.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar la actividad");
    } finally {
      setSavingActivity(false);
    }
  }

  async function handleCreatePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedActivity) {
      toast.error("Primero elegi una actividad");
      return;
    }

    const paidAmount = Number(paymentForm.paidAmount);
    if (!paymentForm.accountId) {
      toast.error("Falta elegir la cuenta");
      return;
    }

    if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
      toast.error("El pago debe ser un numero valido");
      return;
    }

    setSavingPayment(true);
    try {
      const updatedActivity = await createNeonActivityPayment(selectedActivity.id, {
        accountId: Number(paymentForm.accountId),
        paymentDate: paymentForm.paymentDate,
        paidAmount,
        description: paymentForm.description.trim() || undefined
      });

      setPaymentForm((current) => ({
        ...current,
        paidAmount: updatedActivity.pendingAmount > 0 ? String(updatedActivity.pendingAmount) : "",
        description: ""
      }));
      setActivityDetailsById((current) => ({ ...current, [updatedActivity.id]: updatedActivity }));
      setActivities((current) => current.map((activity) => (activity.id === updatedActivity.id ? { ...activity, ...updatedActivity } : activity)));
      setSelectedActivity(updatedActivity);
      toast.success("Pago registrado");
      await loadHomeData(updatedActivity.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo registrar el pago");
    } finally {
      setSavingPayment(false);
    }
  }

  async function handleCreateExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const totalAmount = Number(expenseForm.totalAmount);
    const selectedCategory = getPreferredExpenseCategory(categories, expenseForm.categoryScope);

    if (!selectedActivity) {
      toast.error("Primero elegi una actividad para cargarle gastos");
      return;
    }

    if (!expenseForm.accountId) {
      toast.error("Falta elegir la cuenta");
      return;
    }

    if (!selectedCategory) {
      toast.error("No hay una categoria disponible para ese tipo de gasto");
      return;
    }

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      toast.error("El gasto debe ser un numero valido");
      return;
    }

    setSavingExpense(true);
    try {
      const createdExpense = await createNeonExpense({
        accountId: Number(expenseForm.accountId),
        categoryId: selectedCategory.id,
        expenseDate: expenseForm.expenseDate,
        totalAmount,
        description: expenseForm.description.trim() || undefined,
        destinationType: "activity",
        destinationActivityId: selectedActivity.id
      });

      setExpenseForm((current) => ({
        ...current,
        totalAmount: "",
        description: ""
      }));
      setExpenses((current) => [createdExpense, ...current]);
      setAccounts((current) =>
        current.map((account) =>
          account.id === createdExpense.accountId
            ? {
                ...account,
                currentBalance: Number((account.currentBalance - createdExpense.totalAmount).toFixed(2))
              }
            : account
        )
      );
      toast.success("Gasto registrado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo registrar el gasto");
    } finally {
      setSavingExpense(false);
    }
  }

  async function handleSelectActivity(activityId: number) {
    const summaryActivity = activities.find((activity) => activity.id === activityId) || null;
    const cachedDetail = activityDetailsById[activityId];
    const nextSelectedActivity = cachedDetail || summaryActivity;

    if (nextSelectedActivity) {
      setSelectedActivity(nextSelectedActivity);
      setPaymentForm((current) => ({
        ...current,
        paidAmount: nextSelectedActivity.pendingAmount > 0 ? String(nextSelectedActivity.pendingAmount) : "",
        description: ""
      }));
    }

    try {
      const detail = await getNeonActivity(activityId);
      setActivityDetailsById((current) => ({ ...current, [detail.id]: detail }));
      setActivities((current) => current.map((activity) => (activity.id === detail.id ? { ...activity, ...detail } : activity)));
      setSelectedActivity(detail);
      setPaymentForm((current) => ({
        ...current,
        paidAmount: detail.pendingAmount > 0 ? String(detail.pendingAmount) : "",
        description: ""
      }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cargar la actividad");
    }
  }

  function getExpensesForActivity(activityId: number) {
    return expenses.filter(
      (expense) => expense.destinationType === "activity" && expense.destinationActivityId === activityId
    );
  }

  function handleOpenActivityFlow(activityId: number) {
    const activity = activityDetailsById[activityId] || activities.find((item) => item.id === activityId) || null;

    if (activity) {
      setSelectedActivity(activity);
      setPaymentForm((current) => ({
        ...current,
        paidAmount: activity.pendingAmount > 0 ? String(activity.pendingAmount) : "",
        description: ""
      }));
    }

    setSelectedSection("expenses");
    setDemoStage(3);
    void handleSelectActivity(activityId);
  }

  function handleOpenIncomeForActivity(activity: NeonActivity) {
    setSelectedActivity(activity);
    setSelectedSection("income");
    setDemoStage(3);
    setPaymentForm((current) => ({
      ...current,
      paidAmount: activity.pendingAmount > 0 ? String(activity.pendingAmount) : "",
      description: ""
    }));
  }

  function handleExpandActivities() {
    setVisibleActivitySummaries((current) => {
      if (activities.length <= 3) {
        return 3;
      }

      if (current <= 3) {
        return Math.min(6, activities.length);
      }

      if (current < activities.length) {
        return activities.length;
      }

      return 3;
    });
  }

  function handleExpandExpenses() {
    setVisibleExpenseSummaries((current) => {
      if (expenseActivitySummaries.length <= 3) {
        return 3;
      }

      if (current <= 3) {
        return Math.min(6, expenseActivitySummaries.length);
      }

      if (current < expenseActivitySummaries.length) {
        return expenseActivitySummaries.length;
      }

      return 3;
    });
  }

  function handleExpandIncomeActivities() {
    setVisibleIncomeActivities((current) => {
      if (activities.length <= 3) {
        return 3;
      }

      if (current <= 3) {
        return Math.min(6, activities.length);
      }

      if (current < activities.length) {
        return activities.length;
      }

      return 3;
    });
  }

  const pendingActivities = activities.filter((activity) => activity.pendingAmount > 0).length;
  const collectedTotal = activities.reduce((sum, activity) => sum + activity.collectedAmount, 0);
  const accountsBalance = accounts.reduce((sum, account) => sum + account.currentBalance, 0);
  const expenseTotal = expenses.reduce((sum, expense) => sum + expense.totalAmount, 0);
  const recentPayments = Object.values(
    activities.reduce<Record<number, NeonActivity>>((map, activity) => {
      map[activity.id] = activity;
      return map;
    }, {})
  )
    .map((activity) => activityDetailsById[activity.id] || activity)
    .flatMap((activity) =>
    (activity.payments || []).map((payment) => ({
      ...payment,
      activityCode: formatActivityCode(activity),
      activityDescription: activity.description
    }))
  );
  const selectedActivityExpenses = selectedActivity ? getExpensesForActivity(selectedActivity.id) : [];
  const activitySummaries = activities.filter((activity) => activity.pendingAmount > 0);
  const visibleActivities = getVisibleSummaryItems(activitySummaries, visibleActivitySummaries);
  const visibleIncomeActivityItems = getVisibleSummaryItems(activities, visibleIncomeActivities);
  const movementActivities = activities.filter(
    (activity) => getExpensesForActivity(activity.id).length > 0 || activity.collectedAmount > 0
  );
  const expenseActivitySummaries = expenses.reduce<ExpenseActivitySummary[]>((summaries, expense) => {
    const activityId = expense.destinationType === "activity" ? expense.destinationActivityId : null;
    const activity =
      (activityId ? activityDetailsById[activityId] : null) ||
      (activityId ? activities.find((item) => item.id === activityId) : null) ||
      null;
    const existing = activityId ? summaries.find((summary) => summary.activityId === activityId) : null;
    const label = getExpensePreviewLabel(expense.description, expense.categoryClassification);

    if (existing) {
      existing.totalAmount += expense.totalAmount;
      existing.expensesCount += 1;
      existing.latestMovementDate = expense.movementDate > existing.latestMovementDate ? expense.movementDate : existing.latestMovementDate;
      existing.expenseDescriptions.push(label);
      return summaries;
    }

    summaries.push({
      key: activityId ? `activity:${activityId}` : `expense:${expense.id}`,
      activityId,
      activityLabel:
        activity?.description || expense.destinationActivityDescription || expense.destinationActivityCode || expense.accountName,
      clientLabel: activity?.clientName || expense.accountName,
      totalAmount: expense.totalAmount,
      latestMovementDate: expense.movementDate,
      expenseDescriptions: [label],
      expensesCount: 1
    });
    return summaries;
  }, []);
  const visibleExpenseGroups = getVisibleSummaryItems(expenseActivitySummaries, visibleExpenseSummaries);

  function handleOpenExpenseGroup(activityId: number | null) {
    if (!activityId) {
      return;
    }

    const activity = activityDetailsById[activityId] || activities.find((item) => item.id === activityId) || null;
    if (activity) {
      handleOpenIncomeForActivity(activity);
      return;
    }

    setSelectedSection("income");
    setDemoStage(3);
    void handleSelectActivity(activityId);
  }

  const sectionCards: Array<{
    key: NeonSectionKey;
    label: string;
    value: string;
    caption: string;
    accent: string;
    background: string;
  }> = [
    {
      key: "activities",
      label: "Actividades",
      value: String(activities.length),
      caption: `${pendingActivities} con pendiente por cobrar.`,
      accent: COLORS.activityAccent,
      background: COLORS.activityBg
    },
    {
      key: "income",
      label: "Ingresos",
      value: formatMoney(collectedTotal),
      caption: "Pagos reales cargados desde actividad.",
      accent: COLORS.incomeAccent,
      background: COLORS.incomeBg
    },
    {
      key: "expenses",
      label: "Gastos",
      value: formatMoney(expenseTotal),
      caption: `${expenses.length} gasto(s) registrados.`,
      accent: COLORS.expenseAccent,
      background: COLORS.expenseBg
    },
    {
      key: "accounts",
      label: "Movimientos",
      value: formatMoney(accountsBalance),
      caption: `${movementActivities.length} actividad${movementActivities.length === 1 ? "" : "es"} con movimiento.`,
      accent: COLORS.accountAccent,
      background: COLORS.accountBg
    }
  ];

  const sectionLabels: Record<NeonSectionKey, string> = {
    activities: "Actividades",
    income: "Ingresos",
    expenses: "Gastos",
    accounts: "Movimientos"
  };

  const demoPanelStyle: CSSProperties = {
    width: "100%",
    maxWidth: 1080,
    margin: "0 auto",
    display: "flex",
    justifyContent: "flex-end"
  };

  const demoButtonStyle: CSSProperties = {
    minHeight: 28,
    padding: "0 10px",
    borderRadius: 9999,
    border: `1px solid ${COLORS.border}`,
    background: "transparent",
    color: COLORS.inkSoft,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer"
  };

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <h1 style={heroTitleStyle}>Control por actividades</h1>
      </section>

      <NeonOverviewCards
        sectionCards={sectionCards}
        selectedSection={selectedSection}
        onSelectSection={(section) => {
          setSelectedSection(section);
          setDemoStage(1);
        }}
      />

      <section style={demoPanelStyle}>
        <button
          type="button"
          onClick={() => setDemoStage((current) => (current === 3 ? 1 : ((current + 1) as 1 | 2 | 3)))}
          style={demoButtonStyle}
          aria-label={`Cambiar vista demo de ${sectionLabels[selectedSection]}`}
          title={`Cambiar vista demo de ${sectionLabels[selectedSection]}`}
        >
          Ver siguiente
        </button>
      </section>

      {demoStage >= 2 && selectedSection === "activities" ? (
        <NeonActivitiesSection
          showSummary={demoStage >= 3}
          loading={loading}
          clients={clients}
          clientForm={clientForm}
          setClientForm={setClientForm}
          savingClient={savingClient}
          onCreateClient={handleCreateClient}
          activityForm={activityForm}
          setActivityForm={setActivityForm}
          savingActivity={savingActivity}
          onCreateActivity={handleCreateActivity}
          activitySummaries={activitySummaries}
          visibleActivities={visibleActivities}
          selectedActivity={selectedActivity}
          getExpensesForActivity={getExpensesForActivity}
          onOpenActivityFlow={handleOpenActivityFlow}
          visibleActivitySummaries={visibleActivitySummaries}
          onExpandActivities={handleExpandActivities}
        />
      ) : null}

      {demoStage >= 2 && selectedSection === "income" ? (
        <NeonIncomeSection
          showSummary={demoStage >= 3}
          selectedActivity={selectedActivity}
          selectedActivityExpenses={selectedActivityExpenses}
          activities={activities}
          visibleIncomeActivities={visibleIncomeActivityItems}
          visibleIncomeActivitiesCount={visibleIncomeActivities}
          onExpandIncomeActivities={handleExpandIncomeActivities}
          onSelectActivity={handleSelectActivity}
          paymentForm={paymentForm}
          setPaymentForm={setPaymentForm}
          accounts={accounts}
          savingPayment={savingPayment}
          onCreatePayment={handleCreatePayment}
          recentPayments={recentPayments}
        />
      ) : null}

      {demoStage >= 2 && selectedSection === "expenses" ? (
        <NeonExpensesSection
          showSummary={demoStage >= 3}
          selectedActivity={selectedActivity}
          selectedActivityExpenses={selectedActivityExpenses}
          expenseForm={expenseForm}
          setExpenseForm={setExpenseForm}
          accounts={accounts}
          savingExpense={savingExpense}
          onCreateExpense={handleCreateExpense}
          expenseSummaryCount={expenseActivitySummaries.length}
          visibleExpenseGroups={visibleExpenseGroups}
          onOpenExpenseGroup={handleOpenExpenseGroup}
          visibleExpenseSummaries={visibleExpenseSummaries}
          onExpandExpenses={handleExpandExpenses}
        />
      ) : null}

      {selectedSection === "accounts" ? (
        <NeonAccountsSection
          showSummary
          movementActivities={movementActivities}
          getExpensesForActivity={getExpensesForActivity}
          expandedMovementActivityId={expandedMovementActivityId}
          setExpandedMovementActivityId={setExpandedMovementActivityId}
        />
      ) : null}
    </main>
  );
}
