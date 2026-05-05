import { type Dispatch, type FormEvent, type SetStateAction } from "react";
import {
  ACTIVITY_TYPE_OPTIONS,
  COLORS,
  type ActivityFormState,
  type ClientFormState,
  type ExpenseFormState,
  type NeonSectionKey,
  type PaymentFormState
} from "./neon.home.config";
import {
  formatActivityCode,
  getExpensePreviewLabel,
  formatMoney,
  formatShortDate,
  getExpenseScopeLabel
} from "./neon.home.helpers";
import {
  activityActionStyle,
  activityClientStyle,
  activityCodeStyle,
  activityDescriptionStyle,
  activityListStyle,
  activityMoneyRowStyle,
  activityPreviewItemStyle,
  activityPreviewListStyle,
  activityPreviewMoreStyle,
  activityRowStyle,
  activityRowTopStyle,
  activityStatusStyle,
  cardGridStyle,
  contentGridStyle,
  detailBlockStyle,
  detailGridStyle,
  detailLabelStyle,
  detailValueStyle,
  emptyTextStyle,
  expenseSummaryButtonStyle,
  fieldStyle,
  formStyle,
  inputStyle,
  movementDetailButtonStyle,
  movementItemStyle,
  movementListStyle,
  movementSummaryStyle,
  panelCaptionStyle,
  panelHeaderStyle,
  panelStyle,
  panelTitleStyle,
  paymentRowStyle,
  primaryButtonStyle,
  summaryBodyStyle,
  summaryCardButtonStyle,
  summaryCardStyle,
  summaryControlButtonStyle,
  summaryControlRowStyle,
  summaryLabelStyle,
  summaryLinkStyle,
  summaryValueStyle,
  textareaStyle,
  wideActivityGridStyle
} from "./neon.home.styles";
import { type NeonAccount, type NeonActivity, type NeonClient, type NeonExpense } from "./neon.types";

type SectionCard = {
  key: NeonSectionKey;
  label: string;
  value: string;
  caption: string;
  accent: string;
  background: string;
};

type IncomeSummary = {
  key: string;
  activityId: number;
  activityCode: string;
  activityDescription: string;
  clientLabel: string;
  collectedAmount: number;
  pendingAmount: number;
  latestPaymentDate: string;
  latestPaymentAccountName: string;
  latestPaymentDescription: string;
  paymentsCount: number;
};

type SharedCardsProps = {
  sectionCards: SectionCard[];
  selectedSection: NeonSectionKey | null;
  onSelectSection: (section: NeonSectionKey) => void;
};

export function NeonOverviewCards({ sectionCards, selectedSection, onSelectSection }: SharedCardsProps) {
  return (
    <section style={cardGridStyle}>
      {sectionCards.map((card) => {
        const isActive = selectedSection === card.key;
        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onSelectSection(card.key)}
            style={{
              ...summaryCardButtonStyle,
              ...summaryCardStyle,
              background: card.background,
              borderColor: isActive ? card.accent : COLORS.border,
              boxShadow: isActive ? `0 20px 38px color-mix(in srgb, ${card.accent} 22%, transparent)` : summaryCardStyle.boxShadow
            }}
          >
            <span style={{ ...summaryLabelStyle, color: card.accent }}>{card.label}</span>
            <strong style={summaryValueStyle}>{card.value}</strong>
            <p style={summaryBodyStyle}>{card.caption}</p>
            <span style={{ ...summaryLinkStyle, color: card.accent }}>{isActive ? "Seleccionada" : "Elegir"}</span>
          </button>
        );
      })}
    </section>
  );
}

type ActivitiesSectionProps = {
  showSummary: boolean;
  loading: boolean;
  clients: NeonClient[];
  clientForm: ClientFormState;
  setClientForm: Dispatch<SetStateAction<ClientFormState>>;
  savingClient: boolean;
  onCreateClient: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  activityForm: ActivityFormState;
  setActivityForm: Dispatch<SetStateAction<ActivityFormState>>;
  savingActivity: boolean;
  onCreateActivity: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  activitySummaries: NeonActivity[];
  visibleActivities: NeonActivity[];
  selectedActivity: NeonActivity | null;
  getExpensesForActivity: (activityId: number) => NeonExpense[];
  onOpenActivityFlow: (activityId: number) => void;
  visibleActivitySummaries: number;
  onExpandActivities: () => void;
};

export function NeonActivitiesSection({
  showSummary,
  loading,
  clients,
  clientForm,
  setClientForm,
  savingClient,
  onCreateClient,
  activityForm,
  setActivityForm,
  savingActivity,
  onCreateActivity,
  activitySummaries,
  visibleActivities,
  selectedActivity,
  getExpensesForActivity,
  onOpenActivityFlow,
  visibleActivitySummaries,
  onExpandActivities
}: ActivitiesSectionProps) {
  return (
    <>
      <section style={contentGridStyle}>
        <article style={panelStyle}>
          <header style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>Agregar cliente</h2>
            <span style={panelCaptionStyle}>Primero el cliente, despues la actividad.</span>
          </header>
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
              <textarea
                value={clientForm.notes}
                onChange={(event) => setClientForm((current) => ({ ...current, notes: event.target.value }))}
                style={textareaStyle}
                placeholder="Dato rapido si hace falta"
              />
            </label>
            <button type="submit" disabled={savingClient} style={primaryButtonStyle}>
              {savingClient ? "Guardando..." : "Guardar cliente"}
            </button>
          </form>
        </article>

        <article style={panelStyle}>
          <header style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>Crear actividad</h2>
            <span style={panelCaptionStyle}>Este sigue siendo el inicio del flujo.</span>
          </header>
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
              <span>Descripcion</span>
              <input
                value={activityForm.description}
                onChange={(event) => setActivityForm((current) => ({ ...current, description: event.target.value }))}
                style={inputStyle}
                placeholder="Centro de barrio, tipo de pantalla..."
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
            <label style={fieldStyle}>
              <span>Precio del trabajo</span>
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
            <button type="submit" disabled={savingActivity} style={primaryButtonStyle}>
              {savingActivity ? "Guardando..." : "Guardar actividad"}
            </button>
          </form>
        </article>
      </section>

      {showSummary ? (
        <section style={contentGridStyle}>
          <article style={{ ...panelStyle, gridColumn: "1 / -1" }}>
            <header style={panelHeaderStyle}>
              <h2 style={panelTitleStyle}>Actividades</h2>
              <span style={panelCaptionStyle}>{loading ? "Cargando..." : `${activitySummaries.length} activas en resumen`}</span>
            </header>

            {activitySummaries.length > 0 ? (
              <div style={wideActivityGridStyle}>
                {visibleActivities.map((activity) => {
                  const isSelected = selectedActivity?.id === activity.id;
                  const relatedExpenses = getExpensesForActivity(activity.id);
                  const expensePreview = relatedExpenses.slice(0, 2);

                  return (
                    <button
                      key={activity.id}
                      type="button"
                      onClick={() => onOpenActivityFlow(activity.id)}
                      style={{
                        ...activityRowStyle,
                        borderColor: isSelected ? COLORS.activityAccent : COLORS.borderSoft,
                        background: isSelected ? "#e9eef0" : COLORS.panel
                      }}
                    >
                      <div style={activityRowTopStyle}>
                        <strong style={activityCodeStyle}>{formatActivityCode(activity)}</strong>
                        <span style={activityStatusStyle}>{formatShortDate(activity.activityDate)}</span>
                      </div>
                      <strong style={activityDescriptionStyle}>{activity.description}</strong>
                      <span style={activityClientStyle}>{activity.clientName || "Sin cliente"}</span>
                      <div style={activityMoneyRowStyle}>
                        <span>{formatMoney(activity.quotedAmount)}</span>
                        <span>Pendiente {formatMoney(activity.pendingAmount)}</span>
                      </div>
                      {expensePreview.length > 0 ? (
                        <div style={activityPreviewListStyle}>
                          {expensePreview.map((expense) => (
                            <span key={expense.id} style={activityPreviewItemStyle}>
                              {getExpensePreviewLabel(expense.description, expense.categoryClassification)}
                            </span>
                          ))}
                          {relatedExpenses.length > 2 ? <span style={activityPreviewMoreStyle}>...</span> : null}
                        </div>
                      ) : null}
                      <span style={activityActionStyle}>Abrir</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p style={emptyTextStyle}>Todavia no hay actividades pendientes por cobrar.</p>
            )}

            {activitySummaries.length > 3 ? (
              <div style={summaryControlRowStyle}>
                <button type="button" onClick={onExpandActivities} style={summaryControlButtonStyle}>
                  {visibleActivitySummaries <= 3 ? "Ver mas" : visibleActivitySummaries < activitySummaries.length ? "Ver todo" : "Ver menos"}
                </button>
              </div>
            ) : null}
          </article>
        </section>
      ) : null}
    </>
  );
}

type IncomeSectionProps = {
  showSummary: boolean;
  selectedActivity: NeonActivity | null;
  selectedActivityExpenses: NeonExpense[];
  activities: NeonActivity[];
  visibleIncomeActivities: NeonActivity[];
  visibleIncomeActivitiesCount: number;
  onExpandIncomeActivities: () => void;
  onSelectActivity: (activityId: number) => Promise<void>;
  paymentForm: PaymentFormState;
  setPaymentForm: Dispatch<SetStateAction<PaymentFormState>>;
  accounts: NeonAccount[];
  savingPayment: boolean;
  onCreatePayment: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  incomeSummaries: IncomeSummary[];
  visibleIncomeSummariesCount: number;
  totalIncomeSummaries: number;
  onExpandIncomeSummaries: () => void;
  onOpenRecentPayment: (activityId: number) => void;
};

export function NeonIncomeSection({
  showSummary,
  selectedActivity,
  selectedActivityExpenses,
  activities,
  visibleIncomeActivities,
  visibleIncomeActivitiesCount,
  onExpandIncomeActivities,
  onSelectActivity,
  paymentForm,
  setPaymentForm,
  accounts,
  savingPayment,
  onCreatePayment,
  incomeSummaries,
  visibleIncomeSummariesCount,
  totalIncomeSummaries,
  onExpandIncomeSummaries,
  onOpenRecentPayment
}: IncomeSectionProps) {
  return (
    <>
      <section style={contentGridStyle}>
        <article style={panelStyle}>
          <header style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>Elegir actividad</h2>
            <span style={panelCaptionStyle}>Cada ingreso parte de un trabajo concreto.</span>
          </header>
          {activities.length > 0 ? (
            <div style={activityListStyle}>
              {visibleIncomeActivities.map((activity) => {
                const isSelected = selectedActivity?.id === activity.id;
                return (
                  <button
                    key={activity.id}
                    type="button"
                    onClick={() => {
                      void onSelectActivity(activity.id);
                    }}
                    style={{
                      ...activityRowStyle,
                      borderColor: isSelected ? COLORS.incomeAccent : COLORS.borderSoft,
                      background: isSelected ? "#e8eee9" : COLORS.panel
                    }}
                  >
                    <div style={activityRowTopStyle}>
                      <strong style={{ ...activityCodeStyle, color: COLORS.incomeAccent }}>{formatActivityCode(activity)}</strong>
                      <span style={activityStatusStyle}>{formatMoney(activity.collectedAmount)}</span>
                    </div>
                    <strong style={activityDescriptionStyle}>{activity.description}</strong>
                    <span style={activityClientStyle}>Pendiente {formatMoney(activity.pendingAmount)}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p style={emptyTextStyle}>Todavia no hay actividades para cobrar.</p>
          )}
          {activities.length > 3 ? (
            <div style={summaryControlRowStyle}>
              <button type="button" onClick={onExpandIncomeActivities} style={summaryControlButtonStyle}>
                {visibleIncomeActivitiesCount <= 3
                  ? "Ver mas"
                  : visibleIncomeActivitiesCount < activities.length
                    ? "Ver todo"
                    : "Ver menos"}
              </button>
            </div>
          ) : null}
        </article>

        <article style={panelStyle}>
          <header style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>Registrar pago</h2>
            <span style={panelCaptionStyle}>Solo entra dinero real cuando lo marcas como cobrado.</span>
          </header>
          {selectedActivity ? (
            <>
              <div style={detailGridStyle}>
                <div style={detailBlockStyle}>
                  <span style={detailLabelStyle}>Actividad</span>
                  <strong style={detailValueStyle}>{formatActivityCode(selectedActivity)}</strong>
                </div>
                <div style={detailBlockStyle}>
                  <span style={detailLabelStyle}>Cliente</span>
                  <strong style={detailValueStyle}>{selectedActivity.clientName || "Sin cliente"}</strong>
                </div>
                <div style={detailBlockStyle}>
                  <span style={detailLabelStyle}>Cobrado</span>
                  <strong style={detailValueStyle}>{formatMoney(selectedActivity.collectedAmount)}</strong>
                </div>
                <div style={detailBlockStyle}>
                  <span style={detailLabelStyle}>Pendiente</span>
                  <strong style={detailValueStyle}>{formatMoney(selectedActivity.pendingAmount)}</strong>
                </div>
              </div>

              <form onSubmit={onCreatePayment} style={formStyle}>
                <label style={fieldStyle}>
                  <span>Cuenta</span>
                  <select
                    value={paymentForm.accountId}
                    onChange={(event) => setPaymentForm((current) => ({ ...current, accountId: event.target.value }))}
                    style={inputStyle}
                  >
                    <option value="">Elegir cuenta</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name} · {formatMoney(account.currentBalance)}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={fieldStyle}>
                  <span>Fecha</span>
                  <input
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(event) => setPaymentForm((current) => ({ ...current, paymentDate: event.target.value }))}
                    style={inputStyle}
                  />
                </label>
                <label style={fieldStyle}>
                  <span>Monto cobrado</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={paymentForm.paidAmount}
                    onChange={(event) => setPaymentForm((current) => ({ ...current, paidAmount: event.target.value }))}
                    style={inputStyle}
                  />
                </label>
                <label style={fieldStyle}>
                  <span>Descripcion</span>
                  <input
                    value={paymentForm.description}
                    onChange={(event) => setPaymentForm((current) => ({ ...current, description: event.target.value }))}
                    style={inputStyle}
                    placeholder="Pago sena, saldo final..."
                  />
                </label>
                <button type="submit" disabled={savingPayment} style={primaryButtonStyle}>
                  {savingPayment ? "Guardando..." : "Registrar pago"}
                </button>
              </form>
            </>
          ) : (
            <p style={emptyTextStyle}>Elige una actividad para cargar ingresos.</p>
          )}
        </article>
      </section>

      {showSummary ? (
        <>
          <section style={contentGridStyle}>
            <article style={{ ...panelStyle, gridColumn: "1 / -1" }}>
              <header style={panelHeaderStyle}>
                <h2 style={panelTitleStyle}>Ingresos registrados</h2>
                <span style={panelCaptionStyle}>Ultimos pagos asociados a actividades.</span>
              </header>
              {incomeSummaries.length > 0 ? (
                <div style={wideActivityGridStyle}>
                  {incomeSummaries.map((summary) => (
                    <button
                      key={summary.key}
                      type="button"
                      onClick={() => onOpenRecentPayment(summary.activityId)}
                      style={{ ...paymentRowStyle, ...expenseSummaryButtonStyle }}
                    >
                      <div style={activityRowTopStyle}>
                        <strong style={{ ...activityCodeStyle, color: "#116149" }}>{formatMoney(summary.collectedAmount)}</strong>
                        <span style={activityStatusStyle}>{formatShortDate(summary.latestPaymentDate)}</span>
                      </div>
                      <strong style={activityDescriptionStyle}>{summary.activityCode}</strong>
                      <span style={activityClientStyle}>{summary.activityDescription}</span>
                      <span style={activityClientStyle}>Pendiente {formatMoney(summary.pendingAmount)}</span>
                      <span style={{ ...activityActionStyle, color: COLORS.accountAccent }}>Ir a movimientos</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p style={emptyTextStyle}>Todavia no hay ingresos registrados.</p>
              )}
              {totalIncomeSummaries > 3 ? (
                <div style={summaryControlRowStyle}>
                  <button type="button" onClick={onExpandIncomeSummaries} style={summaryControlButtonStyle}>
                    {visibleIncomeSummariesCount <= 3
                      ? "Ver mas"
                      : visibleIncomeSummariesCount < totalIncomeSummaries
                        ? "Ver todo"
                        : "Ver menos"}
                  </button>
                </div>
              ) : null}
            </article>
          </section>

          {selectedActivity ? (
            <section style={contentGridStyle}>
              <article style={{ ...panelStyle, gridColumn: "1 / -1" }}>
                <header style={panelHeaderStyle}>
                  <h2 style={panelTitleStyle}>Gastos ya asociados a esta actividad</h2>
                  <span style={panelCaptionStyle}>Para que el cobro no quede desconectado del costo real.</span>
                </header>
                {selectedActivityExpenses.length > 0 ? (
                  <div style={wideActivityGridStyle}>
                    {selectedActivityExpenses.map((expense) => (
                      <div key={expense.id} style={paymentRowStyle}>
                        <div style={activityRowTopStyle}>
                          <strong style={{ ...activityCodeStyle, color: COLORS.expenseAccent }}>{formatMoney(expense.totalAmount)}</strong>
                          <span style={activityStatusStyle}>{formatShortDate(expense.movementDate)}</span>
                        </div>
                        <strong style={activityDescriptionStyle}>{getExpenseScopeLabel(expense.categoryClassification)}</strong>
                        <span style={activityClientStyle}>{expense.accountName} · {expense.description || "Gasto sin nota"}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={emptyTextStyle}>Todavia no hay gastos asociados a esta actividad.</p>
                )}
              </article>
            </section>
          ) : null}
        </>
      ) : null}
    </>
  );
}

type ExpensesSectionProps = {
  showSummary: boolean;
  selectedActivity: NeonActivity | null;
  selectedActivityExpenses: NeonExpense[];
  expenseForm: ExpenseFormState;
  setExpenseForm: Dispatch<SetStateAction<ExpenseFormState>>;
  accounts: NeonAccount[];
  savingExpense: boolean;
  onCreateExpense: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  expenseSummaryCount: number;
  visibleExpenseGroups: Array<{
    key: string;
    activityId: number | null;
    activityLabel: string;
    clientLabel: string;
    totalAmount: number;
    latestMovementDate: string;
    expenseDescriptions: string[];
    expensesCount: number;
  }>;
  onOpenExpenseGroup: (activityId: number | null) => void;
  visibleExpenseSummaries: number;
  onExpandExpenses: () => void;
};

export function NeonExpensesSection({
  showSummary,
  selectedActivity,
  selectedActivityExpenses,
  expenseForm,
  setExpenseForm,
  accounts,
  savingExpense,
  onCreateExpense,
  expenseSummaryCount,
  visibleExpenseGroups,
  onOpenExpenseGroup,
  visibleExpenseSummaries,
  onExpandExpenses
}: ExpensesSectionProps) {
  return (
    <>
      <section style={contentGridStyle}>
        <article
          style={{
            ...panelStyle,
            opacity: selectedActivity ? 1 : 0.88
          }}
        >
          <header style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>Actividad cargada para gastos</h2>
            <span style={panelCaptionStyle}>
              {selectedActivity
                ? "Esta actividad ya quedo lista para seguir a ingresos."
                : "Esta actividad queda tomada como destino al entrar desde su resumen."}
            </span>
          </header>

          {selectedActivity ? (
            <div style={detailGridStyle}>
              <div style={detailBlockStyle}>
                <span style={detailLabelStyle}>Codigo</span>
                <strong style={detailValueStyle}>{formatActivityCode(selectedActivity)}</strong>
              </div>
              <div style={detailBlockStyle}>
                <span style={detailLabelStyle}>Cliente</span>
                <strong style={detailValueStyle}>{selectedActivity.clientName || "Sin cliente"}</strong>
              </div>
              <div style={detailBlockStyle}>
                <span style={detailLabelStyle}>Gastos cargados</span>
                <strong style={detailValueStyle}>{selectedActivityExpenses.length}</strong>
              </div>
              <div style={detailBlockStyle}>
                <span style={detailLabelStyle}>Total en gastos</span>
                <strong style={detailValueStyle}>
                  {formatMoney(selectedActivityExpenses.reduce((sum, expense) => sum + expense.totalAmount, 0))}
                </strong>
              </div>
              <div style={{ ...detailBlockStyle, gridColumn: "1 / -1" }}>
                <span style={detailLabelStyle}>Descripcion</span>
                <strong style={detailValueStyle}>{selectedActivity.description}</strong>
              </div>
            </div>
          ) : (
            <p style={emptyTextStyle}>Elige una actividad desde el resumen para cargarle gastos directos.</p>
          )}
        </article>

        <article style={panelStyle}>
          <header style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>Registrar gasto</h2>
            <span style={panelCaptionStyle}>
              {selectedActivity ? `Vas a cargar un gasto para ${formatActivityCode(selectedActivity)}.` : "Primer gasto simple, con cuenta y categoria."}
            </span>
          </header>
          <form onSubmit={onCreateExpense} style={formStyle}>
            <label style={fieldStyle}>
              <span>Cuenta</span>
              <select
                value={expenseForm.accountId}
                onChange={(event) => setExpenseForm((current) => ({ ...current, accountId: event.target.value }))}
                style={inputStyle}
              >
                <option value="">Elegir cuenta</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} · {formatMoney(account.currentBalance)}
                  </option>
                ))}
              </select>
            </label>
            <label style={fieldStyle}>
              <span>Categoria</span>
              <select
                value={expenseForm.categoryScope}
                onChange={(event) =>
                  setExpenseForm((current) => ({
                    ...current,
                    categoryScope: event.target.value as ExpenseFormState["categoryScope"]
                  }))
                }
                style={inputStyle}
              >
                <option value="empresa">Empresa</option>
                <option value="personal">Personal</option>
              </select>
            </label>
            <label style={fieldStyle}>
              <span>Fecha</span>
              <input
                type="date"
                value={expenseForm.expenseDate}
                onChange={(event) => setExpenseForm((current) => ({ ...current, expenseDate: event.target.value }))}
                style={inputStyle}
              />
            </label>
            <label style={fieldStyle}>
              <span>Monto</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={expenseForm.totalAmount}
                onChange={(event) => setExpenseForm((current) => ({ ...current, totalAmount: event.target.value }))}
                style={inputStyle}
                placeholder="0"
              />
            </label>
            <label style={fieldStyle}>
              <span>Descripcion</span>
              <input
                value={expenseForm.description}
                onChange={(event) => setExpenseForm((current) => ({ ...current, description: event.target.value }))}
                style={inputStyle}
                placeholder="Compra, traslado, sena..."
              />
            </label>
            <button type="submit" disabled={savingExpense} style={primaryButtonStyle}>
              {savingExpense ? "Guardando..." : "Registrar gasto"}
            </button>
          </form>
        </article>
      </section>

      {showSummary ? (
        <section style={contentGridStyle}>
          <article style={{ ...panelStyle, gridColumn: "1 / -1" }}>
            <header style={panelHeaderStyle}>
              <h2 style={panelTitleStyle}>Gastos registrados</h2>
              <span style={panelCaptionStyle}>Ya bajan saldo de cuenta y quedan clasificados.</span>
            </header>
            {expenseSummaryCount > 0 ? (
              <div style={wideActivityGridStyle}>
                {visibleExpenseGroups.map((summary) => (
                  <button
                    key={summary.key}
                    type="button"
                    disabled={!summary.activityId}
                    onClick={() => onOpenExpenseGroup(summary.activityId)}
                    style={{
                      ...paymentRowStyle,
                      ...expenseSummaryButtonStyle,
                      cursor: summary.activityId ? "pointer" : "default",
                      opacity: summary.activityId ? 1 : 0.86
                    }}
                  >
                    <div style={activityRowTopStyle}>
                      <strong style={{ ...activityCodeStyle, color: COLORS.expenseAccent }}>{formatMoney(summary.totalAmount)}</strong>
                      <span style={activityStatusStyle}>{formatShortDate(summary.latestMovementDate)}</span>
                    </div>
                    <strong style={activityDescriptionStyle}>{summary.activityLabel}</strong>
                    <span style={activityClientStyle}>{summary.clientLabel}</span>
                    <span style={activityClientStyle}>
                      {summary.expenseDescriptions.slice(0, 3).join(" - ")}
                      {summary.expensesCount > 3 ? " - ..." : ""}
                    </span>
                    <span style={{ ...activityActionStyle, color: COLORS.incomeAccent }}>
                      {summary.activityId ? "Ir a ingresos" : "Sin actividad"}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p style={emptyTextStyle}>Todavia no hay gastos registrados.</p>
            )}
            {expenseSummaryCount > 3 ? (
              <div style={summaryControlRowStyle}>
                <button type="button" onClick={onExpandExpenses} style={summaryControlButtonStyle}>
                  {visibleExpenseSummaries <= 3 ? "Ver mas" : visibleExpenseSummaries < expenseSummaryCount ? "Ver todo" : "Ver menos"}
                </button>
              </div>
            ) : null}
          </article>
        </section>
      ) : null}
    </>
  );
}

type AccountsSectionProps = {
  showSummary: boolean;
  movementActivities: NeonActivity[];
  getExpensesForActivity: (activityId: number) => NeonExpense[];
  expandedMovementActivityId: number | null;
  setExpandedMovementActivityId: Dispatch<SetStateAction<number | null>>;
};

export function NeonAccountsSection({
  showSummary,
  movementActivities,
  getExpensesForActivity,
  expandedMovementActivityId,
  setExpandedMovementActivityId
}: AccountsSectionProps) {
  return (
    <>
      <section style={contentGridStyle}>
        {showSummary ? (
          <article style={{ ...panelStyle, gridColumn: "1 / -1" }}>
            <header style={panelHeaderStyle}>
              <h2 style={panelTitleStyle}>Movimientos</h2>
              <span style={panelCaptionStyle}>Resumen corto del circuito actividad, gastos y cobro.</span>
            </header>
            {movementActivities.length > 0 ? (
              <div style={movementListStyle}>
                {movementActivities.map((activity) => {
                  const expensesForActivity = getExpensesForActivity(activity.id);
                  const totalSpent = expensesForActivity.reduce((sum, expense) => sum + expense.totalAmount, 0);
                  const isPaid = activity.pendingAmount <= 0;
                  const isExpanded = expandedMovementActivityId === activity.id;

                  return (
                    <div key={activity.id} style={movementItemStyle}>
                      <div style={movementSummaryStyle}>
                        <strong style={activityDescriptionStyle}>
                          {activity.description} {"->"} {isPaid ? "Pago" : "Pendiente"}
                        </strong>
                        <button
                          type="button"
                          onClick={() => setExpandedMovementActivityId((current) => (current === activity.id ? null : activity.id))}
                          style={movementDetailButtonStyle}
                        >
                          {isExpanded ? "Ocultar detalle" : "Detalle"}
                        </button>
                      </div>

                      {isExpanded ? (
                        <div style={detailGridStyle}>
                          <div style={detailBlockStyle}>
                            <span style={detailLabelStyle}>Actividad</span>
                            <strong style={detailValueStyle}>{formatActivityCode(activity)}</strong>
                          </div>
                          <div style={detailBlockStyle}>
                            <span style={detailLabelStyle}>Cobrado</span>
                            <strong style={detailValueStyle}>{formatMoney(activity.collectedAmount)}</strong>
                          </div>
                          <div style={detailBlockStyle}>
                            <span style={detailLabelStyle}>Gastado</span>
                            <strong style={detailValueStyle}>{formatMoney(totalSpent)}</strong>
                          </div>
                          <div style={detailBlockStyle}>
                            <span style={detailLabelStyle}>Pendiente</span>
                            <strong style={detailValueStyle}>{formatMoney(activity.pendingAmount)}</strong>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={emptyTextStyle}>Todavia no hay movimientos suficientes para resumir.</p>
            )}
          </article>
        ) : null}
      </section>
    </>
  );
}
