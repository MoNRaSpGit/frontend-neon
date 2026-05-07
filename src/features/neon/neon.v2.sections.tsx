import { useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { ACTIVITY_TYPE_OPTIONS, COLORS } from "./neon.home.config";
import {
  addDaysToDateInputValue,
  formatActivityCode,
  formatHour,
  formatDirectionalMoney,
  formatMoney,
  formatSignedMoney,
  formatShortDate,
  getMonthEndDateInputValue,
  getTodayDateInputValue
} from "./neon.home.helpers";
import { NeonAccount, NeonActivity, NeonClient, NeonJournalEntry } from "./neon.types";
import {
  buildReportStory,
  DashboardSummary,
  deriveCommercialStatus,
  getCommercialStatusLabel,
  getCompanyLabel
} from "./neon.v2.dashboard";
import { createEmptyJournalAllocation, getJournalAllocationDestinationLabel } from "./neon.v2.journal";
import {
  companySwitcherButtonStyle,
  companySwitcherButtonsStyle,
  companySwitcherInnerStyle,
  companySwitcherLabelStyle,
  companySwitcherStyle,
  contentGridStyle,
  dashboardGridStyle,
  emptyTextStyle,
  fieldStyle,
  formStyle,
  inputStyle,
  listItemMetaStyle,
  listItemMoneyStyle,
  listItemStyle,
  listItemTitleStyle,
  listStyle,
  metricCaptionStyle,
  metricCardStyle,
  metricLabelStyle,
  metricValueStyle,
  modalActionsStyle,
  modalBodyStyle,
  modalCardStyle,
  modalOverlayStyle,
  modalTitleStyle,
  panelCaptionStyle,
  panelHeaderStyle,
  panelStyle,
  panelTitleStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
  subPanelStyle,
  subPanelTitleStyle,
  workspaceNavButtonStyle,
  workspaceNavStyle,
  workspaceNavWrapStyle
} from "./neon.v2.styles";
import {
  AccountFormState,
  ActivityFormState,
  CostCenterFormState,
  ClientFormState,
  DebtReportRange,
  JournalAllocationFormState,
  JournalFormState,
  NeonCostCenterRecord,
  NeonCompanyKey,
  NeonCostCenterScope,
  PendingEditCostCenterState,
  PendingDeleteCostCenterState,
  NeonWorkspaceView,
  ReportCenterScope,
  ReportPeriodFilter,
  ReportPeriodRange
} from "./neon.v2.types";

type HomeSectionsProps = {
  loading: boolean;
  savingClient: boolean;
  savingAccount: boolean;
  savingActivity: boolean;
  savingJournal: boolean;
  clients: NeonClient[];
  accounts: NeonAccount[];
  activities: NeonActivity[];
  journalEntries: NeonJournalEntry[];
  costCenters: NeonCostCenterRecord[];
  clientForm: ClientFormState;
  setClientForm: Dispatch<SetStateAction<ClientFormState>>;
  accountForm: AccountFormState;
  setAccountForm: Dispatch<SetStateAction<AccountFormState>>;
  activityForm: ActivityFormState;
  setActivityForm: Dispatch<SetStateAction<ActivityFormState>>;
  journalForm: JournalFormState;
  setJournalForm: Dispatch<SetStateAction<JournalFormState>>;
  costCenterForm: CostCenterFormState;
  setCostCenterForm: Dispatch<SetStateAction<CostCenterFormState>>;
  activeCompany: NeonCompanyKey;
  setActiveCompany: Dispatch<SetStateAction<NeonCompanyKey>>;
  pendingEditCostCenter: PendingEditCostCenterState;
  pendingDeleteCostCenter: PendingDeleteCostCenterState;
  activeView: NeonWorkspaceView;
  setActiveView: Dispatch<SetStateAction<NeonWorkspaceView>>;
  debtReportRange: DebtReportRange;
  setDebtReportRange: Dispatch<SetStateAction<DebtReportRange>>;
  reportPeriodFilter: ReportPeriodFilter;
  setReportPeriodFilter: Dispatch<SetStateAction<ReportPeriodFilter>>;
  journalAllocationTotal: number;
  dashboard: DashboardSummary;
  onCreateClient: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onCreateAccount: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onCreateActivity: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onCreateJournalEntry: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onCreateCostCenter: (event: FormEvent<HTMLFormElement>) => void;
  onEditCostCenter: (centerId: string) => void;
  onCancelCostCenterEdit: () => void;
  onConfirmCostCenterEdit: (event: FormEvent<HTMLFormElement>) => void;
  onDeleteCostCenter: (centerId: string) => void;
  onConfirmDeleteCostCenter: () => void;
  onCancelDeleteCostCenter: () => void;
};

function updateJournalAllocation(
  setJournalForm: Dispatch<SetStateAction<JournalFormState>>,
  index: number,
  updater: (current: JournalAllocationFormState) => JournalAllocationFormState
) {
  setJournalForm((current) => ({
    ...current,
    allocations: current.allocations.map((allocation, allocationIndex) =>
      allocationIndex === index ? updater(allocation) : allocation
    )
  }));
}

function getAccountTypeLabel(accountType: NeonAccount["accountType"]) {
  if (accountType === "cash") return "Caja";
  if (accountType === "bank") return "Banco";
  return "Credito";
}

function getResultTone(value: number) {
  if (value > 0) return COLORS.incomeAccent;
  if (value < 0) return COLORS.expenseAccent;
  return COLORS.ink;
}

function getCenterScopeSelectPlaceholder(scope: ReportCenterScope) {
  if (scope === "activity") return "Elegir actividad";
  if (scope === "vehicle") return "Elegir vehiculo";
  if (scope === "personal") return "Elegir centro personal";
  if (scope === "rental") return "Elegir alquiler";
  if (scope === "other") return "Elegir centro";
  return "Elegir centro";
}

function getInvoiceSummary(activity: Pick<NeonActivity, "invoiceDate" | "invoicedAmount" | "invoiceCompanyKey">) {
  if (!activity.invoiceDate || activity.invoicedAmount === null || !activity.invoiceCompanyKey) {
    return null;
  }

  return `Facturado ${formatShortDate(activity.invoiceDate)} · ${formatMoney(activity.invoicedAmount)} · ${getCompanyLabel(
    activity.invoiceCompanyKey
  )}`;
}

const WORKSPACE_VIEWS: Array<{ value: NeonWorkspaceView; label: string; description: string }> = [
  { value: "journal", label: "Diario", description: "Cuentas y carga de movimientos" },
  { value: "overview", label: "Resumen", description: "Metricas, deuda y panorama general" },
  { value: "activities", label: "Actividades", description: "Clientes y trabajos" },
  { value: "reports", label: "Reportes", description: "Lectura financiera y operativa" },
  { value: "centers", label: "Centros", description: "Centros de costo por empresa" }
];
const COMPANY_OPTIONS: Array<{ value: NeonCompanyKey; label: string; hint: string }> = [
  { value: "neon", label: "Neon", hint: "Carteleria, neon y operacion general" },
  { value: "audiovisual", label: "Audiovisual", hint: "Movil audiovisual y reportes separados" }
];

const SUGGESTED_ACCOUNT_PRESETS: Array<{ name: string; accountType: AccountFormState["accountType"] }> = [
  { name: "Caja $", accountType: "cash" },
  { name: "BROU $", accountType: "bank" },
  { name: "BBVA $", accountType: "bank" },
  { name: "ITAU U$S", accountType: "bank" },
  { name: "Credito", accountType: "credit" }
];
const CREDIT_CARD_PRESETS = ["Visa Itau", "Master BBVA", "Porto Seguro"];
const ACTIVITY_STATUS_OPTIONS: Array<{
  value: ActivityFormState["commercialStatus"];
  label: string;
}> = [
  { value: "pendiente_de_facturar", label: "Pendiente de facturar" },
  { value: "facturado", label: "Facturado" }
];

function getEditableCenterScopeLabel(scope: NeonCostCenterScope) {
  if (scope === "vehicle") return "Vehiculos";
  if (scope === "personal") return "Personal";
  if (scope === "rental") return "Alquileres";
  return "Otros";
}

function matchesReportPeriod(entry: NeonJournalEntry, filter: ReportPeriodFilter) {
  if (filter.dateFrom && entry.movementDate < filter.dateFrom) {
    return false;
  }

  if (filter.dateTo && entry.movementDate > filter.dateTo) {
    return false;
  }

  if (filter.dateFrom || filter.dateTo) {
    return true;
  }

  const today = getTodayDateInputValue();

  if (filter.range === "today") {
    return entry.movementDate === today;
  }

  if (filter.range === "week") {
    return entry.movementDate >= today && entry.movementDate <= addDaysToDateInputValue(today, 6);
  }

  if (filter.range === "month") {
    return entry.movementDate >= today && entry.movementDate <= getMonthEndDateInputValue(today);
  }

  return true;
}

export function NeonV2HomeSections({
  loading,
  savingClient,
  savingAccount,
  savingActivity,
  savingJournal,
  clients,
  accounts,
  activities,
  journalEntries,
  costCenters,
  clientForm,
  setClientForm,
  accountForm,
  setAccountForm,
  activityForm,
  setActivityForm,
  journalForm,
  setJournalForm,
  costCenterForm,
  setCostCenterForm,
  activeCompany,
  setActiveCompany,
  pendingEditCostCenter,
  pendingDeleteCostCenter,
  activeView,
  setActiveView,
  debtReportRange,
  setDebtReportRange,
  reportPeriodFilter,
  setReportPeriodFilter,
  journalAllocationTotal,
  dashboard,
  onCreateClient,
  onCreateAccount,
  onCreateActivity,
  onCreateJournalEntry,
  onCreateCostCenter,
  onEditCostCenter,
  onCancelCostCenterEdit,
  onConfirmCostCenterEdit,
  onDeleteCostCenter,
  onConfirmDeleteCostCenter,
  onCancelDeleteCostCenter
}: HomeSectionsProps) {
  const activeCompanyLabel = getCompanyLabel(activeCompany);
  const journalDifference = Number(journalForm.totalAmount || 0) - journalAllocationTotal;
  const selectedJournalAccount = accounts.find((account) => String(account.id) === journalForm.accountId);
  const journalUsesCredit = selectedJournalAccount?.accountType === "credit";
  const isCreditSettlement = journalForm.expenseKind === "credit_settlement";
  const filteredReportEntries = journalEntries.filter((entry) => matchesReportPeriod(entry, reportPeriodFilter));
  const [reportCenterScopeDraft, setReportCenterScopeDraft] = useState<ReportCenterScope>("activity");
  const [reportCenterKeyDraft, setReportCenterKeyDraft] = useState("");
  const [reportAccountIdDraft, setReportAccountIdDraft] = useState("");
  const [reportSearchDraft, setReportSearchDraft] = useState("");
  const [reportCenterScope, setReportCenterScope] = useState<ReportCenterScope>("activity");
  const [reportCenterKey, setReportCenterKey] = useState("");
  const [reportAccountId, setReportAccountId] = useState("");
  const [reportSearch, setReportSearch] = useState("");
  const costCenterOptionsByScope = useMemo(() => {
    const grouped = {
      vehicle: [] as string[],
      personal: [] as string[],
      rental: [] as string[],
      other: [] as string[]
    };

    for (const center of costCenters) {
      if (!grouped[center.scope].includes(center.label)) {
        grouped[center.scope].push(center.label);
      }
    }

    for (const scope of Object.keys(grouped) as NeonCostCenterScope[]) {
      grouped[scope].sort((left, right) => left.localeCompare(right));
    }

    return grouped;
  }, [costCenters]);
  const visibleReportCenterOptions = useMemo(
    () => {
      const filteredOptions = dashboard.reportCenterOptions.filter((option) =>
        reportCenterScopeDraft === "all" ? true : option.scope === reportCenterScopeDraft
      );

      if (reportCenterScopeDraft === "all" || reportCenterScopeDraft === "activity") {
        return filteredOptions;
      }

      const dynamicOptions = costCenterOptionsByScope[reportCenterScopeDraft]
        .filter((label) => !filteredOptions.some((option) => option.scope === reportCenterScopeDraft && option.label === label))
        .map((label) => ({
          key: `${reportCenterScopeDraft}:${label}`,
          label,
          scope: reportCenterScopeDraft
        }));

      return [...dynamicOptions, ...filteredOptions];
    },
    [dashboard.reportCenterOptions, reportCenterScopeDraft, costCenterOptionsByScope]
  );
  const reportStory = useMemo(
    () =>
      buildReportStory(
        activities,
        journalEntries,
        reportPeriodFilter,
        reportCenterScope,
        reportCenterKey,
        reportAccountId ? Number(reportAccountId) : null,
        reportSearch
      ),
    [activities, journalEntries, reportPeriodFilter, reportCenterScope, reportCenterKey, reportAccountId, reportSearch]
  );
  const reportStoryIsVehicle = reportStory.centerScope === "vehicle";
  const reportStoryIsActivity = reportStory.centerScope === "activity";
  const reportStoryIsRental = reportStory.centerScope === "rental";
  const reportStoryIsPersonal = reportStory.centerScope === "personal";
  const pendingCommercialActivities = activities.filter((activity) => {
    const status = deriveCommercialStatus(activity);
    return status === "pendiente_de_facturar" || status === "pendiente_de_cobrar";
  });

  return (
    <>
      <section style={workspaceNavWrapStyle}>
        <div style={companySwitcherStyle}>
          <div style={companySwitcherInnerStyle}>
            <span style={companySwitcherLabelStyle}>Empresa activa: {activeCompanyLabel}</span>
            <div style={companySwitcherButtonsStyle}>
              {COMPANY_OPTIONS.map((company) => {
                const isActive = activeCompany === company.value;

                return (
                  <button
                    key={company.value}
                    type="button"
                    onClick={() => setActiveCompany(company.value)}
                    style={{
                      ...companySwitcherButtonStyle,
                      background: isActive ? COLORS.button : companySwitcherButtonStyle.background,
                      color: isActive ? COLORS.buttonText : companySwitcherButtonStyle.color,
                      borderColor: isActive ? COLORS.button : COLORS.border
                    }}
                    title={company.hint}
                  >
                    {company.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div style={workspaceNavStyle}>
          {WORKSPACE_VIEWS.map((view) => {
            const isActive = activeView === view.value;

            return (
              <button
                key={view.value}
                type="button"
                onClick={() => setActiveView(view.value)}
                style={{
                  ...workspaceNavButtonStyle,
                  background: isActive ? COLORS.button : workspaceNavButtonStyle.background,
                  color: isActive ? COLORS.buttonText : workspaceNavButtonStyle.color,
                  borderColor: isActive ? COLORS.button : COLORS.border
                }}
                title={view.description}
              >
                {view.label}
              </button>
            );
          })}
        </div>
      </section>

      <section style={activeView === "overview" ? contentGridStyle : { display: "none" }}>
        <article style={{ ...panelStyle, gap: 20 }}>
          <header style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>Resumen</h2>
            <span style={panelCaptionStyle}>Saldo y alertas principales para arrancar rapido en {activeCompanyLabel}.</span>
          </header>

          <div
            style={{
              padding: 22,
              borderRadius: 24,
              border: `1px solid ${COLORS.border}`,
              background: "linear-gradient(135deg, rgba(236, 243, 232, 0.98) 0%, rgba(247, 242, 233, 0.98) 100%)",
              display: "grid",
              gap: 8
            }}
          >
            <span style={metricLabelStyle}>Saldo total</span>
            <strong style={{ ...metricValueStyle, fontSize: "clamp(34px, 6vw, 52px)" }}>{formatMoney(dashboard.totalBalance)}</strong>
            <span style={metricCaptionStyle}>{accounts.length} cuenta(s) activas con saldo actualizado.</span>
          </div>

          <div style={listStyle}>
            <div style={listItemStyle}>
              <div>
                <strong style={listItemTitleStyle}>Movimiento acumulado</strong>
                <span style={listItemMetaStyle}>
                  Ingresos {formatDirectionalMoney(dashboard.totalIncome, "income")} / Gastos{" "}
                  {formatDirectionalMoney(dashboard.totalExpense, "expense")}
                </span>
              </div>
              <strong style={{ ...listItemMoneyStyle, color: getResultTone(dashboard.totalIncome - dashboard.totalExpense) }}>
                {formatSignedMoney(dashboard.totalIncome - dashboard.totalExpense)}
              </strong>
            </div>
            <div style={listItemStyle}>
              <div>
                <strong style={listItemTitleStyle}>Pendiente de facturar</strong>
                <span style={listItemMetaStyle}>{dashboard.pendingBillingCount} actividad(es) todavia sin factura</span>
              </div>
              <strong style={listItemMoneyStyle}>{formatMoney(dashboard.pendingBillingAmount)}</strong>
            </div>
            <div style={listItemStyle}>
              <div>
                <strong style={listItemTitleStyle}>Pendiente de cobrar</strong>
                <span style={listItemMetaStyle}>{dashboard.pendingCollectionCount} actividad(es) con saldo abierto</span>
              </div>
              <strong style={{ ...listItemMoneyStyle, color: COLORS.expenseAccent }}>{formatMoney(dashboard.pendingCollectionAmount)}</strong>
            </div>
            <div style={listItemStyle}>
              <div>
                <strong style={listItemTitleStyle}>Deuda pendiente</strong>
                <span style={listItemMetaStyle}>{dashboard.pendingDebtCount} movimiento(s) a credito / vencido {formatMoney(dashboard.overdueDebtAmount)}</span>
              </div>
              <strong style={{ ...listItemMoneyStyle, color: COLORS.expenseAccent }}>{formatMoney(dashboard.pendingDebtAmount)}</strong>
            </div>
          </div>
        </article>
      </section>
      <section style={activeView === "centers" ? contentGridStyle : { display: "none" }}>
        <article style={panelStyle}>
          <header style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>Centros de costo</h2>
            <span style={panelCaptionStyle}>Alta, correccion y control de centros propios para {activeCompanyLabel}.</span>
          </header>

          <form onSubmit={onCreateCostCenter} style={formStyle}>
            <label style={fieldStyle}>
              <span>Tipo</span>
              <select
                value={costCenterForm.scope}
                onChange={(event) =>
                  setCostCenterForm((current) => ({
                    ...current,
                    scope: event.target.value as NeonCostCenterScope
                  }))
                }
                style={inputStyle}
              >
                <option value="vehicle">Vehiculo</option>
                <option value="personal">Personal</option>
                <option value="rental">Alquiler</option>
                <option value="other">Otro</option>
              </select>
            </label>
            <label style={fieldStyle}>
                <span>Nombre</span>
                <input
                  value={costCenterForm.label}
                  onChange={(event) => setCostCenterForm((current) => ({ ...current, label: event.target.value, editingId: null }))}
                  style={inputStyle}
                  placeholder="UTE, OSE, Toyota, Otros..."
                />
              </label>
            <button type="submit" style={primaryButtonStyle}>
              Guardar centro
            </button>
          </form>

          <div style={listStyle}>
            {(["vehicle", "personal", "rental", "other"] as NeonCostCenterScope[]).map((scope) => {
              const scopedCenters = costCenters.filter((center) => center.scope === scope);

              return (
                <div key={`cost-centers-${scope}`} style={subPanelStyle}>
                  <h3 style={subPanelTitleStyle}>{getEditableCenterScopeLabel(scope)}</h3>
                  <div style={listStyle}>
                    {scopedCenters.map((center) => (
                      <div key={center.id} style={listItemStyle}>
                        <div>
                          <strong style={listItemTitleStyle}>{center.label}</strong>
                          <span style={listItemMetaStyle}>
                            {activeCompanyLabel} · {scope === "other" ? "Centro generico" : getEditableCenterScopeLabel(scope)}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button type="button" onClick={() => onEditCostCenter(center.id)} style={secondaryButtonStyle}>
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteCostCenter(center.id)}
                            style={{
                              ...secondaryButtonStyle,
                              borderColor: COLORS.expenseAccent,
                              color: COLORS.expenseAccent
                            }}
                          >
                            Borrar
                          </button>
                        </div>
                      </div>
                    ))}
                    {scopedCenters.length === 0 ? (
                      <p style={emptyTextStyle}>Todavia no hay centros de este tipo para esta empresa.</p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>
      {pendingDeleteCostCenter ? (
        <div style={modalOverlayStyle}>
          <div style={modalCardStyle}>
            <h3 style={modalTitleStyle}>Confirmar borrado</h3>
            <p style={modalBodyStyle}>
              Vas a borrar el centro de costo <strong>{pendingDeleteCostCenter.label}</strong>. Esta accion no se puede deshacer.
            </p>
            <div style={modalActionsStyle}>
              <button type="button" onClick={onCancelDeleteCostCenter} style={secondaryButtonStyle}>
                Cancelar
              </button>
              <button
                type="button"
                onClick={onConfirmDeleteCostCenter}
                style={{
                  ...primaryButtonStyle,
                  background: COLORS.expenseAccent
                }}
              >
                Si, borrar
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {pendingEditCostCenter ? (
        <div style={modalOverlayStyle}>
          <div style={modalCardStyle}>
            <h3 style={modalTitleStyle}>Editar centro de costo</h3>
            <form onSubmit={onConfirmCostCenterEdit} style={{ display: "grid", gap: 14 }}>
              <label style={fieldStyle}>
                <span>Tipo</span>
                <select
                  value={costCenterForm.scope}
                  onChange={(event) =>
                    setCostCenterForm((current) => ({
                      ...current,
                      scope: event.target.value as NeonCostCenterScope
                    }))
                  }
                  style={inputStyle}
                >
                  <option value="vehicle">Vehiculo</option>
                  <option value="personal">Personal</option>
                  <option value="rental">Alquiler</option>
                  <option value="other">Otro</option>
                </select>
              </label>
              <label style={fieldStyle}>
                <span>Nombre</span>
                <input
                  value={costCenterForm.label}
                  onChange={(event) => setCostCenterForm((current) => ({ ...current, label: event.target.value }))}
                  style={inputStyle}
                  placeholder="UTE, OSE, Toyota, Otros..."
                />
              </label>
              <div style={modalActionsStyle}>
                <button type="button" onClick={onCancelCostCenterEdit} style={secondaryButtonStyle}>
                  Cancelar
                </button>
                <button type="submit" style={primaryButtonStyle}>
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
      <section style={activeView === "journal" ? contentGridStyle : { display: "none" }}>
        <article style={panelStyle}>
          <header style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>Cuentas</h2>
            <span style={panelCaptionStyle}>Caja, bancos y credito con saldo actualizado automaticamente.</span>
          </header>

          <form onSubmit={onCreateAccount} style={formStyle}>
            <label style={fieldStyle}>
              <span>Nombre</span>
              <input
                value={accountForm.name}
                onChange={(event) => setAccountForm((current) => ({ ...current, name: event.target.value }))}
                style={inputStyle}
                placeholder="Caja, BBVA, BROU..."
              />
            </label>
            <label style={fieldStyle}>
              <span>1. Tipo</span>
              <select
                value={accountForm.accountType}
                onChange={(event) =>
                  setAccountForm((current) => ({
                    ...current,
                    accountType: event.target.value as AccountFormState["accountType"]
                  }))
                }
                style={inputStyle}
              >
                <option value="cash">Caja</option>
                <option value="bank">Banco</option>
                <option value="credit">Credito</option>
              </select>
            </label>
            <label style={fieldStyle}>
              <span>Saldo inicial</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={accountForm.openingBalance}
                onChange={(event) => setAccountForm((current) => ({ ...current, openingBalance: event.target.value }))}
                style={inputStyle}
                placeholder="0"
              />
            </label>
            <button type="submit" disabled={savingAccount} style={primaryButtonStyle}>
              {savingAccount ? "Guardando..." : "Crear cuenta"}
            </button>
          </form>

          <div style={{ ...subPanelStyle, gap: 10 }}>
            <strong style={listItemTitleStyle}>Sugeridas para probar rapido</strong>
            <div style={{ ...formStyle, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))" }}>
              {SUGGESTED_ACCOUNT_PRESETS.map((preset) => (
                <button
                  key={`account-preset-${preset.name}`}
                  type="button"
                  style={secondaryButtonStyle}
                  onClick={() =>
                    setAccountForm((current) => ({
                      ...current,
                      name: preset.name,
                      accountType: preset.accountType
                    }))
                  }
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div style={listStyle}>
            {accounts.map((account) => (
              <div key={account.id} style={listItemStyle}>
                <div>
                  <strong style={listItemTitleStyle}>{account.name}</strong>
                  <span style={listItemMetaStyle}>{getAccountTypeLabel(account.accountType)}</span>
                </div>
                <strong style={listItemMoneyStyle}>{formatMoney(account.currentBalance)}</strong>
              </div>
            ))}
            {!loading && accounts.length === 0 ? <p style={emptyTextStyle}>Todavia no hay cuentas.</p> : null}
          </div>
        </article>

        <article style={panelStyle}>
          <header style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>Libro diario</h2>
            <span style={panelCaptionStyle}>Primero registras el movimiento. Despues indicas de donde sale o entra y finalmente a que centros va.</span>
          </header>

          <form onSubmit={onCreateJournalEntry} style={formStyle}>
            <label style={fieldStyle}>
              <span>Tipo</span>
              <select
                value={journalForm.movementType}
                onChange={(event) =>
                  setJournalForm((current) => ({
                    ...current,
                    movementType: event.target.value as JournalFormState["movementType"]
                  }))
                }
                style={inputStyle}
              >
                <option value="expense">Gasto</option>
                <option value="income">Ingreso</option>
              </select>
            </label>
            <label style={fieldStyle}>
              <span>1. Fecha</span>
              <input
                type="date"
                value={journalForm.movementDate}
                onChange={(event) => setJournalForm((current) => ({ ...current, movementDate: event.target.value }))}
                style={inputStyle}
              />
            </label>
            <label style={fieldStyle}>
              <span>2. De donde sale o entra</span>
              <select
                value={journalForm.accountId}
                onChange={(event) => setJournalForm((current) => ({ ...current, accountId: event.target.value }))}
                style={inputStyle}
              >
                <option value="">Elegir cuenta</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} - {getAccountTypeLabel(account.accountType)} - {formatMoney(account.currentBalance)}
                  </option>
                ))}
              </select>
            </label>
            <label style={fieldStyle}>
              <span>1. Importe total</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={journalForm.totalAmount}
                onChange={(event) => setJournalForm((current) => ({ ...current, totalAmount: event.target.value }))}
                style={inputStyle}
                placeholder="0"
              />
            </label>
            {journalForm.movementType !== "expense" ? (
              <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                <span>1. Detalle</span>
                <input
                  value={journalForm.description}
                  onChange={(event) => setJournalForm((current) => ({ ...current, description: event.target.value }))}
                  style={inputStyle}
                  placeholder="Cobro, pago, transferencia..."
                />
              </label>
            ) : null}

            {journalForm.movementType === "expense" ? (
              <div style={{ ...subPanelStyle, gridColumn: "1 / -1" }}>
                <div style={{ display: "grid", gap: 4 }}>
                  <h3 style={subPanelTitleStyle}>3. Datos de la salida</h3>
                  <span style={panelCaptionStyle}>
                    Completa tipo de gasto, proveedor y moneda. Si corresponde, agrega tarjeta y vencimiento.
                  </span>
                </div>

                <div style={formStyle}>
                  <label style={fieldStyle}>
                    <span>Tipo de gasto</span>
                    <select
                      value={journalForm.expenseKind}
                      onChange={(event) =>
                        setJournalForm((current) => ({
                          ...current,
                          expenseKind: event.target.value as JournalFormState["expenseKind"],
                          dueDate: event.target.value === "credit_settlement" ? "" : current.dueDate
                        }))
                      }
                      style={inputStyle}
                    >
                      <option value="operational">Gasto operativo</option>
                      <option value="credit_settlement">Pago de tarjeta</option>
                    </select>
                  </label>
                  <label style={fieldStyle}>
                    <span>{isCreditSettlement ? "Referencia" : "Proveedor"}</span>
                    <input
                      value={journalForm.providerName}
                      onChange={(event) => setJournalForm((current) => ({ ...current, providerName: event.target.value }))}
                      style={inputStyle}
                      placeholder={isCreditSettlement ? "Pago de resumen, cierre..." : "Proveedor o comercio"}
                    />
                  </label>
                  <label style={fieldStyle}>
                    <span>Detalle</span>
                    <input
                      value={journalForm.description}
                      onChange={(event) => setJournalForm((current) => ({ ...current, description: event.target.value }))}
                      style={inputStyle}
                      placeholder="Combustible, materiales, reparacion, pago..."
                    />
                  </label>
                  <label style={fieldStyle}>
                    <span>Moneda</span>
                    <select
                      value={journalForm.currencyCode}
                      onChange={(event) =>
                        setJournalForm((current) => ({
                          ...current,
                          currencyCode: event.target.value as JournalFormState["currencyCode"]
                        }))
                      }
                      style={inputStyle}
                    >
                      <option value="UYU">Pesos (UYU)</option>
                      <option value="USD">Dolares (USD)</option>
                    </select>
                  </label>

                  {journalUsesCredit || isCreditSettlement ? (
                    <>
                      <label style={fieldStyle}>
                        <span>Tarjeta</span>
                        <input
                          list="credit-card-presets"
                          value={journalForm.creditCardLabel}
                          onChange={(event) =>
                            setJournalForm((current) => ({ ...current, creditCardLabel: event.target.value }))
                          }
                          style={inputStyle}
                          placeholder="Oca, Visa, Master..."
                        />
                        <datalist id="credit-card-presets">
                          {CREDIT_CARD_PRESETS.map((cardLabel) => (
                            <option key={`credit-card-${cardLabel}`} value={cardLabel} />
                          ))}
                        </datalist>
                      </label>
                      {!isCreditSettlement ? (
                        <label style={fieldStyle}>
                          <span>Vencimiento</span>
                          <input
                            type="date"
                            value={journalForm.dueDate}
                            onChange={(event) => setJournalForm((current) => ({ ...current, dueDate: event.target.value }))}
                            style={inputStyle}
                          />
                        </label>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div style={{ ...subPanelStyle, gridColumn: "1 / -1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display: "grid", gap: 4 }}>
                  <h3 style={subPanelTitleStyle}>4. A donde va este dinero</h3>
                  <span style={panelCaptionStyle}>
                    Cada linea representa una parte del movimiento. Si no usás una linea, dejala sin centro y sin monto.
                  </span>
                </div>
                <button
                  type="button"
                  style={secondaryButtonStyle}
                  onClick={() =>
                    setJournalForm((current) => ({
                      ...current,
                      allocations: [...current.allocations, createEmptyJournalAllocation()]
                    }))
                  }
                >
                  Agregar linea
                </button>
              </div>

              <div style={listStyle}>
                {journalForm.allocations.map((allocation, index) => (
                  <div key={`allocation-${index}`} style={{ ...subPanelStyle, gap: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                      <strong style={listItemTitleStyle}>Linea {index + 1}</strong>
                      {journalForm.allocations.length > 1 ? (
                        <button
                          type="button"
                          style={secondaryButtonStyle}
                          onClick={() =>
                            setJournalForm((current) => ({
                              ...current,
                              allocations: current.allocations.filter((_, allocationIndex) => allocationIndex !== index)
                            }))
                          }
                        >
                          Quitar
                        </button>
                      ) : null}
                    </div>

                    <div style={formStyle}>
                      <label style={fieldStyle}>
                        <span>Centro</span>
                        <select
                          value={allocation.destinationType}
                          onChange={(event) =>
                            updateJournalAllocation(setJournalForm, index, () => ({
                              destinationType: event.target.value as JournalAllocationFormState["destinationType"],
                              destinationActivityId: "",
                              destinationLabel: "",
                              amount: allocation.amount,
                              kilometers: "",
                              liters: ""
                            }))
                          }
                          style={inputStyle}
                        >
                          <option value="">Sin asignar</option>
                          <option value="activity">Actividad</option>
                          <option value="vehicle">Vehiculo</option>
                          <option value="personal">Personal</option>
                          <option value="rental">Alquiler</option>
                          <option value="other">Otros</option>
                        </select>
                      </label>

                      <label style={fieldStyle}>
                        <span>Monto</span>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={allocation.amount}
                          onChange={(event) =>
                            updateJournalAllocation(setJournalForm, index, (current) => ({
                              ...current,
                              amount: event.target.value
                            }))
                          }
                          style={inputStyle}
                          placeholder="0"
                        />
                      </label>

                      {allocation.destinationType === "activity" ? (
                        <label style={fieldStyle}>
                          <span>Actividad</span>
                          <select
                            value={allocation.destinationActivityId}
                            onChange={(event) =>
                              updateJournalAllocation(setJournalForm, index, (current) => ({
                                ...current,
                                destinationActivityId: event.target.value
                              }))
                            }
                            style={inputStyle}
                          >
                            <option value="">Elegir actividad</option>
                            {activities.map((activity) => (
                              <option key={activity.id} value={activity.id}>
                                {formatActivityCode(activity)} · {activity.description}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : null}

                      {allocation.destinationType === "vehicle" ? (
                        <label style={fieldStyle}>
                          <span>Vehiculo</span>
                          <select
                            value={allocation.destinationLabel}
                            onChange={(event) =>
                              updateJournalAllocation(setJournalForm, index, (current) => ({
                                ...current,
                                destinationLabel: event.target.value
                              }))
                            }
                            style={inputStyle}
                          >
                            <option value="">Elegir vehiculo</option>
                            {costCenterOptionsByScope.vehicle.map((vehicleLabel) => (
                              <option key={`vehicle-option-${vehicleLabel}`} value={vehicleLabel}>
                                {vehicleLabel}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : null}

                      {allocation.destinationType === "personal" ? (
                        <label style={fieldStyle}>
                          <span>Personal / Casa</span>
                          <select
                            value={allocation.destinationLabel}
                            onChange={(event) =>
                              updateJournalAllocation(setJournalForm, index, (current) => ({
                                ...current,
                                destinationLabel: event.target.value
                              }))
                            }
                            style={inputStyle}
                          >
                            <option value="">Elegir destino</option>
                            {costCenterOptionsByScope.personal.map((label) => (
                              <option key={`personal-option-${label}`} value={label}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : null}

                      {allocation.destinationType === "rental" ? (
                        <label style={fieldStyle}>
                          <span>Alquiler</span>
                          <select
                            value={allocation.destinationLabel}
                            onChange={(event) =>
                              updateJournalAllocation(setJournalForm, index, (current) => ({
                                ...current,
                                destinationLabel: event.target.value
                              }))
                            }
                            style={inputStyle}
                          >
                            <option value="">Elegir alquiler</option>
                            {costCenterOptionsByScope.rental.map((label) => (
                              <option key={`rental-option-${label}`} value={label}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : null}

                      {allocation.destinationType === "other" ? (
                        <label style={fieldStyle}>
                          <span>Otros</span>
                          <select
                            value={allocation.destinationLabel}
                            onChange={(event) =>
                              updateJournalAllocation(setJournalForm, index, (current) => ({
                                ...current,
                                destinationLabel: event.target.value
                              }))
                            }
                            style={inputStyle}
                          >
                            <option value="">Elegir destino</option>
                            {costCenterOptionsByScope.other.map((label) => (
                              <option key={`other-option-${label}`} value={label}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : null}

                      {allocation.destinationType === "vehicle" ? (
                        <>
                          <label style={fieldStyle}>
                            <span>Kilometraje</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={allocation.kilometers}
                              onChange={(event) =>
                                updateJournalAllocation(setJournalForm, index, (current) => ({
                                  ...current,
                                  kilometers: event.target.value
                                }))
                              }
                              style={inputStyle}
                              placeholder="0"
                            />
                          </label>
                          <label style={fieldStyle}>
                            <span>Litros</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={allocation.liters}
                              onChange={(event) =>
                                updateJournalAllocation(setJournalForm, index, (current) => ({
                                  ...current,
                                  liters: event.target.value
                                }))
                              }
                              style={inputStyle}
                              placeholder="0"
                            />
                          </label>
                        </>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <span style={listItemMetaStyle}>Total dividido: {formatMoney(journalAllocationTotal)}</span>
                <span
                  style={{
                    ...listItemMetaStyle,
                    color: Math.round(journalDifference * 100) === 0 ? COLORS.incomeAccent : COLORS.expenseAccent
                  }}
                >
                  Diferencia: {formatSignedMoney(journalDifference)}
                </span>
              </div>
            </div>

            <button type="submit" disabled={savingJournal} style={{ ...primaryButtonStyle, gridColumn: "1 / -1" }}>
              {savingJournal ? "Guardando..." : "Registrar movimiento"}
            </button>
          </form>
        </article>
      </section>

      <section style={activeView === "activities" || activeView === "reports" ? contentGridStyle : { display: "none" }}>
        <article style={activeView === "activities" ? panelStyle : { ...panelStyle, display: "none" }}>
          <header style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>Actividades</h2>
            <span style={panelCaptionStyle}>Las actividades siguen vivas, pero ahora como centro de costo.</span>
          </header>

          <div style={subPanelStyle}>
            <h3 style={subPanelTitleStyle}>Crear cliente</h3>
            <form onSubmit={onCreateClient} style={formStyle}>
              <label style={fieldStyle}>
                <span>Nombre</span>
                <input
                  value={clientForm.name}
                  onChange={(event) => setClientForm((current) => ({ ...current, name: event.target.value }))}
                  style={inputStyle}
                  placeholder="Cliente o empresa"
                />
              </label>
              <label style={fieldStyle}>
                <span>Telefono</span>
                <input
                  value={clientForm.phone}
                  onChange={(event) => setClientForm((current) => ({ ...current, phone: event.target.value }))}
                  style={inputStyle}
                  placeholder="099..."
                />
              </label>
              <label style={fieldStyle}>
                <span>Notas</span>
                <input
                  value={clientForm.notes}
                  onChange={(event) => setClientForm((current) => ({ ...current, notes: event.target.value }))}
                  style={inputStyle}
                  placeholder="Dato util si hace falta"
                />
              </label>
              <button type="submit" disabled={savingClient} style={secondaryButtonStyle}>
                {savingClient ? "Guardando..." : "Guardar cliente"}
              </button>
            </form>
          </div>

          <div style={subPanelStyle}>
            <h3 style={subPanelTitleStyle}>Crear actividad</h3>
            <span style={panelCaptionStyle}>
              Usa esta parte solo para trabajos numerados. Los alquileres entran por libro diario y se asignan a ALQ1, ALQ2 u otro centro.
            </span>
            <form onSubmit={onCreateActivity} style={formStyle}>
              <label style={fieldStyle}>
                <span>Fecha</span>
                <input
                  type="date"
                  value={activityForm.activityDate}
                  onChange={(event) => setActivityForm((current) => ({ ...current, activityDate: event.target.value }))}
                  style={inputStyle}
                />
              </label>
              <label style={fieldStyle}>
                <span>Cliente</span>
                <select
                  value={activityForm.clientId}
                  onChange={(event) => setActivityForm((current) => ({ ...current, clientId: event.target.value }))}
                  style={inputStyle}
                >
                  <option value="">Sin cliente por ahora</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </label>
              <label style={fieldStyle}>
                <span>Tipo</span>
                <select
                  value={activityForm.activityType}
                  onChange={(event) =>
                    setActivityForm((current) => ({
                      ...current,
                      activityType: event.target.value as ActivityFormState["activityType"]
                    }))
                  }
                  style={inputStyle}
                >
                  {ACTIVITY_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                <span>Descripcion</span>
                <input
                  value={activityForm.description}
                  onChange={(event) => setActivityForm((current) => ({ ...current, description: event.target.value }))}
                  style={inputStyle}
                  placeholder="Trabajo, cartel, pantalla, servicio..."
                />
              </label>
              <label style={fieldStyle}>
                <span>Monto del trabajo</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={activityForm.quotedAmount}
                  onChange={(event) => setActivityForm((current) => ({ ...current, quotedAmount: event.target.value }))}
                  style={inputStyle}
                  placeholder="0"
                />
              </label>
              <label style={fieldStyle}>
                <span>Estado</span>
                <select
                  value={activityForm.commercialStatus}
                  onChange={(event) =>
                    setActivityForm((current) => ({
                      ...current,
                      commercialStatus: event.target.value as ActivityFormState["commercialStatus"]
                    }))
                  }
                  style={inputStyle}
                >
                  {ACTIVITY_STATUS_OPTIONS.map((option) => (
                    <option key={`activity-status-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              {activityForm.commercialStatus === "facturado" ? (
                <>
                  <label style={fieldStyle}>
                    <span>Fecha factura</span>
                    <input
                      type="date"
                      value={activityForm.invoiceDate}
                      onChange={(event) => setActivityForm((current) => ({ ...current, invoiceDate: event.target.value }))}
                      style={inputStyle}
                    />
                  </label>
                  <label style={fieldStyle}>
                    <span>Importe facturado</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={activityForm.invoicedAmount}
                      onChange={(event) => setActivityForm((current) => ({ ...current, invoicedAmount: event.target.value }))}
                      style={inputStyle}
                      placeholder="0"
                    />
                  </label>
                </>
              ) : null}
              <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                <span>Control automatico</span>
                <input
                  value="Cuando entra dinero por el diario asignado a la actividad, el sistema la mueve segun lo cobrado."
                  readOnly
                  style={{ ...inputStyle, opacity: 0.85 }}
                />
              </label>
              <button type="submit" disabled={savingActivity} style={secondaryButtonStyle}>
                {savingActivity ? "Guardando..." : "Guardar actividad"}
              </button>
            </form>
          </div>

          <div style={subPanelStyle}>
            <h3 style={subPanelTitleStyle}>Seguimiento comercial</h3>
            <div style={dashboardGridStyle}>
              <article style={{ ...metricCardStyle, background: COLORS.panelAlt }}>
                <span style={metricLabelStyle}>Pendiente de facturar</span>
                <strong style={metricValueStyle}>{formatMoney(dashboard.pendingBillingAmount)}</strong>
                <span style={metricCaptionStyle}>{dashboard.pendingBillingCount} actividad(es)</span>
              </article>
              <article style={{ ...metricCardStyle, background: COLORS.accountBg }}>
                <span style={metricLabelStyle}>Pendiente de cobrar</span>
                <strong style={metricValueStyle}>{formatMoney(dashboard.pendingCollectionAmount)}</strong>
                <span style={metricCaptionStyle}>{dashboard.pendingCollectionCount} actividad(es)</span>
              </article>
              <article style={{ ...metricCardStyle, background: COLORS.incomeBg }}>
                <span style={metricLabelStyle}>Cobrado acumulado</span>
                <strong style={metricValueStyle}>{formatMoney(dashboard.commercialCollectedAmount)}</strong>
                <span style={metricCaptionStyle}>Entra desde el libro diario</span>
              </article>
            </div>
          </div>

          <div style={subPanelStyle}>
            <h3 style={subPanelTitleStyle}>Actividades pendientes</h3>
            <div style={listStyle}>
              {pendingCommercialActivities.slice(0, 12).map((activity) => (
                  <div key={`activity-pending-${activity.id}`} style={listItemStyle}>
                    <div>
                      <strong style={listItemTitleStyle}>
                        {formatActivityCode(activity)} · {activity.description}
                      </strong>
                      <span style={listItemMetaStyle}>{activity.clientName || "Sin cliente"}</span>
                      <span style={listItemMetaStyle}>
                        Estado: {getCommercialStatusLabel(deriveCommercialStatus(activity))} · Cotizado {formatMoney(activity.quotedAmount)}
                      </span>
                      {getInvoiceSummary(activity) ? <span style={listItemMetaStyle}>{getInvoiceSummary(activity)}</span> : null}
                      <span style={listItemMetaStyle}>Estado operativo: {getCommercialStatusLabel(deriveCommercialStatus(activity))}</span>
                      <span style={listItemMetaStyle}>
                        Cobrado {formatMoney(activity.collectedAmount)} · Pendiente {formatMoney(activity.pendingAmount)}
                      </span>
                    </div>
                    <strong style={{ ...listItemMoneyStyle, color: getResultTone(activity.pendingAmount > 0 ? -activity.pendingAmount : activity.collectedAmount) }}>
                      {activity.pendingAmount > 0 ? formatMoney(activity.pendingAmount) : formatMoney(activity.collectedAmount)}
                    </strong>
                  </div>
                ))}
              {!loading && pendingCommercialActivities.length === 0 ? <p style={emptyTextStyle}>No hay actividades pendientes ahora.</p> : null}
            </div>
          </div>

          <div style={subPanelStyle}>
            <h3 style={subPanelTitleStyle}>Todas las actividades</h3>
            <div style={listStyle}>
              {activities.slice(0, 16).map((activity) => (
                <div key={`activity-all-${activity.id}`} style={listItemStyle}>
                  <div>
                    <strong style={listItemTitleStyle}>
                      {formatActivityCode(activity)} · {activity.description}
                    </strong>
                    <span style={listItemMetaStyle}>
                      {activity.clientName || "Sin cliente"} · {getCommercialStatusLabel(deriveCommercialStatus(activity))}
                    </span>
                    {getInvoiceSummary(activity) ? <span style={listItemMetaStyle}>{getInvoiceSummary(activity)}</span> : null}
                    <span style={listItemMetaStyle}>Estado operativo: {getCommercialStatusLabel(deriveCommercialStatus(activity))}</span>
                    <span style={listItemMetaStyle}>
                      Cotizado {formatMoney(activity.quotedAmount)} · Cobrado {formatMoney(activity.collectedAmount)} · Pendiente {formatMoney(activity.pendingAmount)}
                    </span>
                  </div>
                  <strong style={{ ...listItemMoneyStyle, color: getResultTone(activity.pendingAmount > 0 ? -activity.pendingAmount : activity.collectedAmount) }}>
                    {formatMoney(activity.quotedAmount)}
                  </strong>
                </div>
              ))}
              {!loading && activities.length === 0 ? <p style={emptyTextStyle}>Todavia no hay actividades.</p> : null}
            </div>
          </div>
        </article>

        <article style={activeView === "reports" ? panelStyle : { ...panelStyle, display: "none" }}>
          <header style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>Reportes</h2>
            <span style={panelCaptionStyle}>Saldos, deudas, centros de costo y control comercial de {activeCompanyLabel}.</span>
          </header>

          <div style={subPanelStyle}>
            <h3 style={subPanelTitleStyle}>Periodo de reportes</h3>
            <div style={formStyle}>
              <label style={fieldStyle}>
                <span>Ver datos de</span>
                <select
                  value={reportPeriodFilter.range}
                  onChange={(event) =>
                    setReportPeriodFilter((current) => ({
                      ...current,
                      range: event.target.value as ReportPeriodRange
                    }))
                  }
                  style={inputStyle}
                >
                  <option value="all">Todo</option>
                  <option value="today">Hoy</option>
                  <option value="week">Esta semana</option>
                  <option value="month">Este mes</option>
                </select>
              </label>
              <label style={fieldStyle}>
                <span>Desde</span>
                <input
                  type="date"
                  value={reportPeriodFilter.dateFrom}
                  onChange={(event) =>
                    setReportPeriodFilter((current) => ({
                      ...current,
                      dateFrom: event.target.value
                    }))
                  }
                  style={inputStyle}
                />
              </label>
              <label style={fieldStyle}>
                <span>Hasta</span>
                <input
                  type="date"
                  value={reportPeriodFilter.dateTo}
                  onChange={(event) =>
                    setReportPeriodFilter((current) => ({
                      ...current,
                      dateTo: event.target.value
                    }))
                  }
                  style={inputStyle}
                />
              </label>
            </div>
          </div>

          <div style={subPanelStyle}>
            <h3 style={subPanelTitleStyle}>Cortes principales</h3>
            <div style={dashboardGridStyle}>
              <article style={{ ...metricCardStyle, background: COLORS.incomeBg }}>
                <span style={metricLabelStyle}>Total ingresos</span>
                <strong style={{ ...metricValueStyle, color: COLORS.incomeAccent }}>
                  {formatDirectionalMoney(dashboard.reportIncomeAmount, "income")}
                </strong>
                <span style={metricCaptionStyle}>Ingresos del periodo filtrado</span>
              </article>
              <article style={{ ...metricCardStyle, background: COLORS.expenseBg }}>
                <span style={metricLabelStyle}>Total gastos</span>
                <strong style={{ ...metricValueStyle, color: COLORS.expenseAccent }}>
                  {formatDirectionalMoney(dashboard.reportExpenseAmount, "expense")}
                </strong>
                <span style={metricCaptionStyle}>Gastos del periodo filtrado</span>
              </article>
              <article style={{ ...metricCardStyle, background: COLORS.accountBg }}>
                <span style={metricLabelStyle}>Saldo en cuentas</span>
                <strong style={metricValueStyle}>{formatMoney(dashboard.totalBalance)}</strong>
                <span style={metricCaptionStyle}>{accounts.length} cuenta(s) activas</span>
              </article>
              <article style={{ ...metricCardStyle, background: COLORS.panelAlt }}>
                <span style={metricLabelStyle}>Pendientes comerciales</span>
                <strong style={metricValueStyle}>{formatMoney(dashboard.pendingBillingAmount + dashboard.pendingCollectionAmount)}</strong>
                <span style={metricCaptionStyle}>
                  {dashboard.pendingBillingCount} por facturar / {dashboard.pendingCollectionCount} por cobrar
                </span>
              </article>
            </div>
          </div>

          <div style={subPanelStyle}>
            <h3 style={subPanelTitleStyle}>Gastos e ingresos por centro de costo</h3>
            <div style={formStyle}>
              <label style={fieldStyle}>
                <span>Tipo de centro</span>
                <select
                  value={reportCenterScopeDraft}
                  onChange={(event) => {
                    setReportCenterScopeDraft(event.target.value as ReportCenterScope);
                    setReportCenterKeyDraft("");
                  }}
                  style={inputStyle}
                >
                  <option value="activity">Actividades</option>
                  <option value="vehicle">Vehiculos</option>
                  <option value="personal">Personal</option>
                  <option value="rental">Alquileres</option>
                  <option value="other">Otros</option>
                </select>
              </label>
              <label style={fieldStyle}>
                <span>Centro de costo</span>
                <select
                  value={reportCenterKeyDraft}
                  onChange={(event) => setReportCenterKeyDraft(event.target.value)}
                  style={inputStyle}
                >
                  <option value="">{getCenterScopeSelectPlaceholder(reportCenterScopeDraft)}</option>
                  {visibleReportCenterOptions.map((option) => (
                    <option key={option.key} value={option.label}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label style={fieldStyle}>
                <span>Cuenta</span>
                <select
                  value={reportAccountIdDraft}
                  onChange={(event) => setReportAccountIdDraft(event.target.value)}
                  style={inputStyle}
                >
                  <option value="">Todas las cuentas</option>
                  {accounts.map((account) => (
                    <option key={`report-account-${account.id}`} value={String(account.id)}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </label>
              <label style={fieldStyle}>
                <span>Buscar</span>
                <input
                  value={reportSearchDraft}
                  onChange={(event) => setReportSearchDraft(event.target.value)}
                  style={inputStyle}
                  placeholder="Proveedor, detalle, documento..."
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  setReportCenterScope(reportCenterScopeDraft);
                  setReportCenterKey(reportCenterKeyDraft);
                  setReportAccountId(reportAccountIdDraft);
                  setReportSearch(reportSearchDraft.trim());
                }}
                style={primaryButtonStyle}
              >
                Buscar
              </button>
            </div>
            <span style={panelCaptionStyle}>
              Primero elegis el tipo y despues el centro puntual. Esto ya toma los centros creados en la pestaña `Centros`.
            </span>
          </div>

          <div style={subPanelStyle}>
            <h3 style={subPanelTitleStyle}>{reportStory.title}</h3>
            {!reportCenterKey ? (
              <p style={emptyTextStyle}>Elegi un centro de costo para ver su historia completa.</p>
            ) : (
              <>
                <span style={panelCaptionStyle}>{reportStory.subtitle}</span>
                <div style={dashboardGridStyle}>
                  {reportStoryIsVehicle ? (
                    <>
                      <article style={{ ...metricCardStyle, background: COLORS.expenseBg }}>
                        <span style={metricLabelStyle}>Total gastado</span>
                        <strong style={{ ...metricValueStyle, color: COLORS.expenseAccent }}>
                          {formatDirectionalMoney(reportStory.totalExpenseAmount, "expense")}
                        </strong>
                        <span style={metricCaptionStyle}>{reportStory.movementCount} movimiento(s) del vehiculo</span>
                      </article>
                      <article style={{ ...metricCardStyle, background: COLORS.panelAlt }}>
                        <span style={metricLabelStyle}>Total litros</span>
                        <strong style={metricValueStyle}>{reportStory.totalLiters.toFixed(0)} L</strong>
                        <span style={metricCaptionStyle}>Carga acumulada del periodo</span>
                      </article>
                      <article style={{ ...metricCardStyle, background: COLORS.accountBg }}>
                        <span style={metricLabelStyle}>Kilometraje registrado</span>
                        <strong style={metricValueStyle}>{reportStory.totalKilometers.toFixed(0)} km</strong>
                        <span style={metricCaptionStyle}>Solo las lineas que cargaron kilometraje</span>
                      </article>
                      <article style={{ ...metricCardStyle, background: COLORS.incomeBg }}>
                        <span style={metricLabelStyle}>Consumo estimado</span>
                        <strong style={metricValueStyle}>
                          {reportStory.totalLiters > 0 ? `${(reportStory.totalKilometers / reportStory.totalLiters).toFixed(1)} km/L` : "-"}
                        </strong>
                        <span style={metricCaptionStyle}>Referencia simple del periodo</span>
                      </article>
                    </>
                  ) : reportStoryIsActivity ? (
                    <>
                      <article style={{ ...metricCardStyle, background: COLORS.panelAlt }}>
                        <span style={metricLabelStyle}>Cotizado</span>
                        <strong style={metricValueStyle}>{formatMoney(reportStory.quotedAmount || 0)}</strong>
                        <span style={metricCaptionStyle}>Valor comercial de la actividad</span>
                      </article>
                      <article style={{ ...metricCardStyle, background: COLORS.incomeBg }}>
                        <span style={metricLabelStyle}>Total cobrado</span>
                        <strong style={{ ...metricValueStyle, color: COLORS.incomeAccent }}>
                          {formatDirectionalMoney(reportStory.totalIncomeAmount, "income")}
                        </strong>
                        <span style={metricCaptionStyle}>Solo lo asignado a esta actividad</span>
                      </article>
                      <article style={{ ...metricCardStyle, background: COLORS.expenseBg }}>
                        <span style={metricLabelStyle}>Total gastado</span>
                        <strong style={{ ...metricValueStyle, color: COLORS.expenseAccent }}>
                          {formatDirectionalMoney(reportStory.totalExpenseAmount, "expense")}
                        </strong>
                        <span style={metricCaptionStyle}>Gastos imputados a la actividad</span>
                      </article>
                      <article style={{ ...metricCardStyle, background: COLORS.accountBg }}>
                        <span style={metricLabelStyle}>Resultado</span>
                        <strong style={{ ...metricValueStyle, color: getResultTone(reportStory.balanceAmount) }}>
                          {formatSignedMoney(reportStory.balanceAmount)}
                        </strong>
                        <span style={metricCaptionStyle}>Cobrado menos gastado</span>
                      </article>
                      <article style={{ ...metricCardStyle, background: COLORS.panelAlt }}>
                        <span style={metricLabelStyle}>Pendiente</span>
                        <strong style={metricValueStyle}>{formatMoney(reportStory.pendingAmount || 0)}</strong>
                        <span style={metricCaptionStyle}>Segun el estado actual de la actividad</span>
                      </article>
                    </>
                  ) : reportStoryIsRental ? (
                    <>
                      <article style={{ ...metricCardStyle, background: COLORS.incomeBg }}>
                        <span style={metricLabelStyle}>Ingresos por alquiler</span>
                        <strong style={{ ...metricValueStyle, color: COLORS.incomeAccent }}>
                          {formatDirectionalMoney(reportStory.totalIncomeAmount, "income")}
                        </strong>
                        <span style={metricCaptionStyle}>{reportStory.movementCount} movimiento(s) del alquiler</span>
                      </article>
                      <article style={{ ...metricCardStyle, background: COLORS.expenseBg }}>
                        <span style={metricLabelStyle}>Gastos del alquiler</span>
                        <strong style={{ ...metricValueStyle, color: COLORS.expenseAccent }}>
                          {formatDirectionalMoney(reportStory.totalExpenseAmount, "expense")}
                        </strong>
                        <span style={metricCaptionStyle}>Costos asignados a este alquiler</span>
                      </article>
                      <article style={{ ...metricCardStyle, background: COLORS.accountBg }}>
                        <span style={metricLabelStyle}>Resultado del alquiler</span>
                        <strong style={{ ...metricValueStyle, color: getResultTone(reportStory.balanceAmount) }}>
                          {formatSignedMoney(reportStory.balanceAmount)}
                        </strong>
                        <span style={metricCaptionStyle}>Ingreso menos gasto</span>
                      </article>
                    </>
                  ) : reportStoryIsPersonal ? (
                    <>
                      <article style={{ ...metricCardStyle, background: COLORS.expenseBg }}>
                        <span style={metricLabelStyle}>Gasto personal</span>
                        <strong style={{ ...metricValueStyle, color: COLORS.expenseAccent }}>
                          {formatDirectionalMoney(reportStory.totalExpenseAmount, "expense")}
                        </strong>
                        <span style={metricCaptionStyle}>{reportStory.movementCount} movimiento(s)</span>
                      </article>
                      <article style={{ ...metricCardStyle, background: COLORS.accountBg }}>
                        <span style={metricLabelStyle}>Ingresos personales</span>
                        <strong style={{ ...metricValueStyle, color: COLORS.incomeAccent }}>
                          {formatDirectionalMoney(reportStory.totalIncomeAmount, "income")}
                        </strong>
                        <span style={metricCaptionStyle}>Si hubo entradas imputadas aqui</span>
                      </article>
                      <article style={{ ...metricCardStyle, background: COLORS.panelAlt }}>
                        <span style={metricLabelStyle}>Impacto neto</span>
                        <strong style={{ ...metricValueStyle, color: getResultTone(reportStory.balanceAmount) }}>
                          {formatSignedMoney(reportStory.balanceAmount)}
                        </strong>
                        <span style={metricCaptionStyle}>Entradas menos gastos personales</span>
                      </article>
                    </>
                  ) : (
                    <>
                      <article style={{ ...metricCardStyle, background: COLORS.expenseBg }}>
                        <span style={metricLabelStyle}>Total gastado</span>
                        <strong style={{ ...metricValueStyle, color: COLORS.expenseAccent }}>
                          {formatDirectionalMoney(reportStory.totalExpenseAmount, "expense")}
                        </strong>
                        <span style={metricCaptionStyle}>{reportStory.movementCount} movimiento(s)</span>
                      </article>
                      <article style={{ ...metricCardStyle, background: COLORS.incomeBg }}>
                        <span style={metricLabelStyle}>Total ingresado</span>
                        <strong style={{ ...metricValueStyle, color: COLORS.incomeAccent }}>
                          {formatDirectionalMoney(reportStory.totalIncomeAmount, "income")}
                        </strong>
                        <span style={metricCaptionStyle}>Solo lo asignado a este centro</span>
                      </article>
                      <article style={{ ...metricCardStyle, background: COLORS.accountBg }}>
                        <span style={metricLabelStyle}>Resultado</span>
                        <strong style={{ ...metricValueStyle, color: getResultTone(reportStory.balanceAmount) }}>
                          {formatSignedMoney(reportStory.balanceAmount)}
                        </strong>
                        <span style={metricCaptionStyle}>Ingreso menos gasto</span>
                      </article>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <div style={subPanelStyle}>
            <h3 style={subPanelTitleStyle}>Movimientos del centro</h3>
            <div style={listStyle}>
              {reportCenterKey ? reportStory.items.map((item) => (
                <div key={`story-${item.centerScope}-${item.movementId}-${item.centerLabel}`} style={listItemStyle}>
                  <div>
                    <strong style={listItemTitleStyle}>
                      {formatShortDate(item.movementDate)} · {item.providerName || item.description || item.centerLabel}
                    </strong>
                    <span style={listItemMetaStyle}>
                      Cargado {formatHour(item.createdAt)} ·{" "}
                      {item.movementType === "income" ? "Ingreso" : "Gasto"} · {item.accountName} · {item.centerLabel}
                    </span>
                    {item.description && item.providerName ? <span style={listItemMetaStyle}>{item.description}</span> : null}
                    {item.documentRef || item.quantity || item.liters || item.kilometers ? (
                      <span style={listItemMetaStyle}>
                        {[
                          item.documentRef,
                          item.quantity ? `${item.quantity} ${item.unitLabel || ""}`.trim() : null,
                          item.liters ? `Litros: ${item.liters}` : null,
                          item.kilometers ? `Km: ${item.kilometers}` : null
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    ) : null}
                  </div>
                  <strong
                    style={{
                      ...listItemMoneyStyle,
                      color: item.movementType === "income" ? COLORS.incomeAccent : COLORS.expenseAccent
                    }}
                  >
                    {item.movementType === "income"
                      ? formatDirectionalMoney(item.amount, "income")
                      : formatDirectionalMoney(item.amount, "expense")}
                  </strong>
                </div>
              )) : null}
              {reportCenterKey && reportStory.items.length === 0 ? (
                <p style={emptyTextStyle}>No hay movimientos para esa combinacion de fechas, centro, cuenta y busqueda.</p>
              ) : null}
              {!reportCenterKey ? <p style={emptyTextStyle}>Primero elegi un centro de costo arriba.</p> : null}
            </div>
          </div>

          <div style={subPanelStyle}>
            <h3 style={subPanelTitleStyle}>Libro diario filtrado</h3>
            <div style={listStyle}>
              {filteredReportEntries.slice(0, 12).map((entry) => {
                const allocationLabels = entry.allocations.slice(0, 2).map(getJournalAllocationDestinationLabel);
                const remainingAllocations = Math.max(entry.allocations.length - allocationLabels.length, 0);

                return (
                  <div key={entry.id} style={listItemStyle}>
                    <div>
                      <strong style={listItemTitleStyle}>
                        {entry.movementType === "income" ? "Ingreso" : "Gasto"} · {entry.accountName}
                      </strong>
                      <span style={listItemMetaStyle}>
                        {formatShortDate(entry.movementDate)} · {entry.description || "Sin descripcion"}
                      </span>
                      <span style={listItemMetaStyle}>Cargado {formatHour(entry.createdAt)}</span>
                      {entry.movementType === "expense" &&
                      (entry.providerName || entry.documentRef || entry.quantity || entry.currencyCode || entry.creditCardLabel) ? (
                        <span style={listItemMetaStyle}>
                          {[
                            entry.providerName,
                            entry.documentRef,
                            entry.quantity ? `${entry.quantity} ${entry.unitLabel || ""}`.trim() : null,
                            entry.currencyCode,
                            entry.creditCardLabel
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      ) : null}
                      {allocationLabels.length > 0 ? (
                        <span style={listItemMetaStyle}>
                          {allocationLabels.join(" · ")}
                          {remainingAllocations > 0 ? ` · +${remainingAllocations}` : ""}
                        </span>
                      ) : null}
                    </div>
                    <strong
                      style={{
                        ...listItemMoneyStyle,
                        color: entry.movementType === "income" ? COLORS.incomeAccent : COLORS.expenseAccent
                      }}
                    >
                      {entry.movementType === "income"
                        ? formatDirectionalMoney(entry.totalAmount, "income")
                        : formatDirectionalMoney(entry.totalAmount, "expense")}
                    </strong>
                  </div>
                );
              })}
              {!loading && filteredReportEntries.length === 0 ? <p style={emptyTextStyle}>No hay movimientos para el periodo elegido.</p> : null}
            </div>
          </div>

          <div style={subPanelStyle}>
            <h3 style={subPanelTitleStyle}>Actividades</h3>
            <div style={listStyle}>
              {activities.slice(0, 12).map((activity) => (
                <div key={activity.id} style={listItemStyle}>
                  <div>
                    <strong style={listItemTitleStyle}>
                      {formatActivityCode(activity)} · {activity.description}
                    </strong>
                    <span style={listItemMetaStyle}>{activity.clientName || "Sin cliente"}</span>
                    <span style={listItemMetaStyle}>
                      Cobrado {formatMoney(activity.collectedAmount)} · Pendiente {formatMoney(activity.pendingAmount)}
                    </span>
                  </div>
                  <strong style={listItemMoneyStyle}>{formatMoney(activity.quotedAmount)}</strong>
                </div>
              ))}
              {!loading && activities.length === 0 ? <p style={emptyTextStyle}>Todavia no hay actividades.</p> : null}
            </div>
          </div>

          <div style={subPanelStyle}>
            <h3 style={subPanelTitleStyle}>Saldos de cuentas</h3>
            <div style={listStyle}>
              {dashboard.accountReports.map((account) => (
                <div key={`account-report-${account.accountId}`} style={listItemStyle}>
                  <div>
                    <strong style={listItemTitleStyle}>
                      {account.accountName} · {getAccountTypeLabel(account.accountType)}
                    </strong>
                    <span style={listItemMetaStyle}>
                      Inicial {formatMoney(account.openingBalance)} · Ingresos{" "}
                      {formatDirectionalMoney(account.incomeAmount, "income")}
                    </span>
                    <span style={listItemMetaStyle}>
                      Gastos {formatDirectionalMoney(account.expenseAmount, "expense")} · Flujo{" "}
                      {formatSignedMoney(account.netFlowAmount)}
                    </span>
                  </div>
                  <strong style={{ ...listItemMoneyStyle, color: getResultTone(account.currentBalance) }}>
                    {formatMoney(account.currentBalance)}
                  </strong>
                </div>
              ))}
              {dashboard.accountReports.length === 0 ? <p style={emptyTextStyle}>Todavia no hay cuentas para reportar.</p> : null}
            </div>
          </div>

          <div style={subPanelStyle}>
            <h3 style={subPanelTitleStyle}>Gastos por centro</h3>
            <div style={listStyle}>
              {dashboard.topExpenseCenters.map((bucket) => (
                <div key={`expense-${bucket.label}`} style={listItemStyle}>
                  <div>
                    <strong style={listItemTitleStyle}>{bucket.label}</strong>
                    <span style={listItemMetaStyle}>{bucket.count} linea(s) de gasto</span>
                  </div>
                  <strong style={{ ...listItemMoneyStyle, color: COLORS.expenseAccent }}>
                    {formatDirectionalMoney(bucket.amount, "expense")}
                  </strong>
                </div>
              ))}
              {dashboard.topExpenseCenters.length === 0 ? (
                <p style={emptyTextStyle}>Todavia no hay gastos asignados a centros de costo.</p>
              ) : null}
            </div>
          </div>

          <div style={subPanelStyle}>
            <h3 style={subPanelTitleStyle}>Actividades pendientes</h3>
            <div style={listStyle}>
              {pendingCommercialActivities.slice(0, 12).map((activity) => (
                  <div key={`report-activity-pending-${activity.id}`} style={listItemStyle}>
                    <div>
                      <strong style={listItemTitleStyle}>
                        {formatActivityCode(activity)} · {activity.description}
                      </strong>
                      <span style={listItemMetaStyle}>{activity.clientName || "Sin cliente"}</span>
                      <span style={listItemMetaStyle}>
                        {getCommercialStatusLabel(deriveCommercialStatus(activity))} · Cotizado {formatMoney(activity.quotedAmount)}
                      </span>
                      {getInvoiceSummary(activity) ? <span style={listItemMetaStyle}>{getInvoiceSummary(activity)}</span> : null}
                    </div>
                    <strong style={{ ...listItemMoneyStyle, color: COLORS.expenseAccent }}>
                      {formatMoney(activity.pendingAmount)}
                    </strong>
                  </div>
                ))}
              {pendingCommercialActivities.length === 0 ? <p style={emptyTextStyle}>No hay actividades pendientes para controlar.</p> : null}
            </div>
          </div>

          <div style={subPanelStyle}>
            <h3 style={subPanelTitleStyle}>Resultados por actividad</h3>
            <div style={listStyle}>
              {dashboard.activityResults.slice(0, 12).map((activity) => (
                <div key={`activity-result-${activity.activityId}`} style={listItemStyle}>
                  <div>
                    <strong style={listItemTitleStyle}>{activity.activityLabel}</strong>
                    <span style={listItemMetaStyle}>{activity.clientName || "Sin cliente"}</span>
                    <span style={listItemMetaStyle}>
                      Ingresos {formatDirectionalMoney(activity.incomeAmount, "income")} · Gastos{" "}
                      {formatDirectionalMoney(activity.expenseAmount, "expense")}
                    </span>
                    <span style={listItemMetaStyle}>
                      Cotizado {formatMoney(activity.quotedAmount)} · Pendiente {formatMoney(activity.pendingAmount)}
                    </span>
                  </div>
                  <strong style={{ ...listItemMoneyStyle, color: getResultTone(activity.resultAmount) }}>
                    {formatSignedMoney(activity.resultAmount)}
                  </strong>
                </div>
              ))}
              {dashboard.activityResults.length === 0 ? (
                <p style={emptyTextStyle}>Todavia no hay actividades con resultado para mostrar.</p>
              ) : null}
            </div>
          </div>

          <div style={subPanelStyle}>
            <h3 style={subPanelTitleStyle}>Deuda pendiente</h3>
            <div style={formStyle}>
              <label style={fieldStyle}>
                <span>Periodo</span>
                <select
                  value={debtReportRange}
                  onChange={(event) => setDebtReportRange(event.target.value as DebtReportRange)}
                  style={inputStyle}
                >
                  <option value="all">Todo</option>
                  <option value="overdue">Vencido</option>
                  <option value="today">Vence hoy</option>
                  <option value="week">Esta semana</option>
                  <option value="month">Este mes</option>
                </select>
              </label>
            </div>
            <div style={listStyle}>
              <div style={listItemStyle}>
                <div>
                  <strong style={listItemTitleStyle}>Vence hoy</strong>
                  <span style={listItemMetaStyle}>{dashboard.dueTodayCount} movimiento(s)</span>
                </div>
                <strong style={{ ...listItemMoneyStyle, color: COLORS.expenseAccent }}>{formatMoney(dashboard.dueTodayAmount)}</strong>
              </div>
              <div style={listItemStyle}>
                <div>
                  <strong style={listItemTitleStyle}>Esta semana</strong>
                  <span style={listItemMetaStyle}>{dashboard.dueWeekCount} movimiento(s)</span>
                </div>
                <strong style={{ ...listItemMoneyStyle, color: COLORS.expenseAccent }}>{formatMoney(dashboard.dueWeekAmount)}</strong>
              </div>
              <div style={listItemStyle}>
                <div>
                  <strong style={listItemTitleStyle}>Este mes</strong>
                  <span style={listItemMetaStyle}>{dashboard.dueMonthCount} movimiento(s)</span>
                </div>
                <strong style={{ ...listItemMoneyStyle, color: COLORS.expenseAccent }}>{formatMoney(dashboard.dueMonthAmount)}</strong>
              </div>
              <div style={listItemStyle}>
                <div>
                  <strong style={listItemTitleStyle}>Vencido</strong>
                  <span style={listItemMetaStyle}>{dashboard.overdueDebtCount} movimiento(s)</span>
                </div>
                <strong style={{ ...listItemMoneyStyle, color: COLORS.expenseAccent }}>{formatMoney(dashboard.overdueDebtAmount)}</strong>
              </div>
            </div>
            <div style={listStyle}>
              {dashboard.pendingDebtEntries.map((entry) => {
                const isOverdue = Boolean(entry.dueDate && entry.dueDate < getTodayDateInputValue());

                return (
                  <div key={`debt-${entry.movementId}`} style={listItemStyle}>
                    <div>
                      <strong style={listItemTitleStyle}>{entry.cardLabel || entry.accountName}</strong>
                      <span style={listItemMetaStyle}>
                        {entry.providerName || "Sin proveedor"} · {entry.documentRef || "Sin documento"}
                      </span>
                      <span style={listItemMetaStyle}>
                        {entry.dueDate ? `Vence ${formatShortDate(entry.dueDate)}` : "Sin vencimiento"} ·{" "}
                        {entry.currencyCode || "UYU"}
                        {isOverdue ? " · Vencido" : ""}
                      </span>
                    </div>
                    <strong style={{ ...listItemMoneyStyle, color: isOverdue ? COLORS.expenseAccent : listItemMoneyStyle.color }}>
                      {formatMoney(entry.pendingAmount)}
                    </strong>
                  </div>
                );
              })}
              {dashboard.pendingDebtEntries.length === 0 ? (
                <p style={emptyTextStyle}>No hay deuda pendiente para el filtro elegido.</p>
              ) : null}
            </div>
          </div>

          <div style={subPanelStyle}>
            <h3 style={subPanelTitleStyle}>Deuda por tarjeta</h3>
            <div style={listStyle}>
              {dashboard.pendingDebtByCard.map((bucket) => (
                <div key={`debt-card-${bucket.label}`} style={listItemStyle}>
                  <div>
                    <strong style={listItemTitleStyle}>{bucket.label}</strong>
                    <span style={listItemMetaStyle}>{bucket.count} movimiento(s) pendientes</span>
                  </div>
                  <strong style={{ ...listItemMoneyStyle, color: COLORS.expenseAccent }}>{formatMoney(bucket.amount)}</strong>
                </div>
              ))}
              {dashboard.pendingDebtByCard.length === 0 ? (
                <p style={emptyTextStyle}>Todavia no hay tarjetas con deuda acumulada.</p>
              ) : null}
            </div>
          </div>

          <div style={subPanelStyle}>
            <h3 style={subPanelTitleStyle}>Tarjetas y vencimientos</h3>
            <div style={listStyle}>
              {dashboard.cardDebtSummaries.map((card) => (
                <div key={`card-summary-${card.cardLabel}`} style={listItemStyle}>
                  <div>
                    <strong style={listItemTitleStyle}>{card.cardLabel}</strong>
                    <span style={listItemMetaStyle}>{card.pendingCount} movimiento(s) pendientes</span>
                    <span style={listItemMetaStyle}>
                      {card.nextDueDate
                        ? `Proximo vencimiento ${formatShortDate(card.nextDueDate)} · ${formatMoney(card.nextDueAmount)}`
                        : "Sin vencimientos futuros cargados"}
                    </span>
                    <span style={listItemMetaStyle}>
                      {card.overdueCount > 0
                        ? `Vencido ${formatMoney(card.overdueAmount)} en ${card.overdueCount} movimiento(s)`
                        : "Sin deuda vencida"}
                    </span>
                  </div>
                  <strong style={{ ...listItemMoneyStyle, color: card.overdueCount > 0 ? COLORS.expenseAccent : COLORS.ink }}>
                    {formatMoney(card.pendingAmount)}
                  </strong>
                </div>
              ))}
              {dashboard.cardDebtSummaries.length === 0 ? (
                <p style={emptyTextStyle}>Todavia no hay tarjetas con vencimientos visibles.</p>
              ) : null}
            </div>
          </div>

          <div style={subPanelStyle}>
            <h3 style={subPanelTitleStyle}>Pagos de tarjeta recientes</h3>
            <div style={listStyle}>
              {dashboard.recentCardSettlements.map((settlement) => (
                <div key={`card-settlement-${settlement.movementId}`} style={listItemStyle}>
                  <div>
                    <strong style={listItemTitleStyle}>{settlement.cardLabel}</strong>
                    <span style={listItemMetaStyle}>
                      {formatShortDate(settlement.movementDate)} · {formatHour(settlement.createdAt)} · Sale desde {settlement.sourceAccountName}
                    </span>
                    <span style={listItemMetaStyle}>{settlement.description || "Pago de tarjeta sin descripcion"}</span>
                  </div>
                  <strong style={{ ...listItemMoneyStyle, color: COLORS.expenseAccent }}>
                    {formatDirectionalMoney(settlement.totalAmount, "expense")}
                  </strong>
                </div>
              ))}
              {dashboard.recentCardSettlements.length === 0 ? (
                <p style={emptyTextStyle}>Todavia no hay pagos de tarjeta registrados.</p>
              ) : null}
            </div>
          </div>

          <div style={subPanelStyle}>
            <h3 style={subPanelTitleStyle}>Ingresos por actividad</h3>
            <div style={listStyle}>
              {dashboard.topIncomeActivities.map((bucket) => (
                <div key={`income-${bucket.label}`} style={listItemStyle}>
                  <div>
                    <strong style={listItemTitleStyle}>{bucket.label}</strong>
                    <span style={listItemMetaStyle}>{bucket.count} linea(s) de ingreso</span>
                  </div>
                  <strong style={{ ...listItemMoneyStyle, color: COLORS.incomeAccent }}>
                    {formatDirectionalMoney(bucket.amount, "income")}
                  </strong>
                </div>
              ))}
              {dashboard.topIncomeActivities.length === 0 ? (
                <p style={emptyTextStyle}>Todavia no hay ingresos asignados a actividades.</p>
              ) : null}
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
