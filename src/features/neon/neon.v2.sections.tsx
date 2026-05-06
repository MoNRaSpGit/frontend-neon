import { type Dispatch, type FormEvent, type SetStateAction } from "react";
import { ACTIVITY_TYPE_OPTIONS, COLORS } from "./neon.home.config";
import { formatActivityCode, formatMoney, formatShortDate } from "./neon.home.helpers";
import { NeonAccount, NeonActivity, NeonClient, NeonJournalEntry } from "./neon.types";
import { DashboardSummary } from "./neon.v2.dashboard";
import { createEmptyJournalAllocation, getJournalAllocationDestinationLabel } from "./neon.v2.journal";
import {
  contentGridStyle,
  dashboardGridStyle,
  emptyTextStyle,
  fieldStyle,
  formStyle,
  heroBodyStyle,
  heroCardStyle,
  heroEyebrowStyle,
  heroTitleStyle,
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
  panelCaptionStyle,
  panelHeaderStyle,
  panelStyle,
  panelTitleStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
  subPanelStyle,
  subPanelTitleStyle
} from "./neon.v2.styles";
import {
  AccountFormState,
  ActivityFormState,
  ClientFormState,
  JournalAllocationFormState,
  JournalFormState
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
  clientForm: ClientFormState;
  setClientForm: Dispatch<SetStateAction<ClientFormState>>;
  accountForm: AccountFormState;
  setAccountForm: Dispatch<SetStateAction<AccountFormState>>;
  activityForm: ActivityFormState;
  setActivityForm: Dispatch<SetStateAction<ActivityFormState>>;
  journalForm: JournalFormState;
  setJournalForm: Dispatch<SetStateAction<JournalFormState>>;
  journalAllocationTotal: number;
  dashboard: DashboardSummary;
  onCreateClient: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onCreateAccount: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onCreateActivity: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onCreateJournalEntry: (event: FormEvent<HTMLFormElement>) => Promise<void>;
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
  clientForm,
  setClientForm,
  accountForm,
  setAccountForm,
  activityForm,
  setActivityForm,
  journalForm,
  setJournalForm,
  journalAllocationTotal,
  dashboard,
  onCreateClient,
  onCreateAccount,
  onCreateActivity,
  onCreateJournalEntry
}: HomeSectionsProps) {
  const journalDifference = Number(journalForm.totalAmount || 0) - journalAllocationTotal;

  return (
    <>
      <section style={heroCardStyle}>
        <div style={heroEyebrowStyle}>Neon V2</div>
        <h1 style={heroTitleStyle}>Libro diario + cuentas + centros de costo</h1>
        <p style={heroBodyStyle}>
          El nucleo ahora es el movimiento economico. Desde aca se cargan ingresos y gastos, se elige cuenta y se divide
          cada registro entre actividades, vehiculos, personal u otros centros.
        </p>
      </section>

      <section style={dashboardGridStyle}>
        <article style={{ ...metricCardStyle, background: COLORS.activityBg }}>
          <span style={metricLabelStyle}>Saldo total</span>
          <strong style={metricValueStyle}>{formatMoney(dashboard.totalBalance)}</strong>
          <span style={metricCaptionStyle}>{accounts.length} cuenta(s) activas</span>
        </article>
        <article style={{ ...metricCardStyle, background: COLORS.incomeBg }}>
          <span style={metricLabelStyle}>Ingresos</span>
          <strong style={metricValueStyle}>{formatMoney(dashboard.totalIncome)}</strong>
          <span style={metricCaptionStyle}>Libro diario acumulado</span>
        </article>
        <article style={{ ...metricCardStyle, background: COLORS.expenseBg }}>
          <span style={metricLabelStyle}>Gastos</span>
          <strong style={metricValueStyle}>{formatMoney(dashboard.totalExpense)}</strong>
          <span style={metricCaptionStyle}>Libro diario acumulado</span>
        </article>
        <article style={{ ...metricCardStyle, background: COLORS.accountBg }}>
          <span style={metricLabelStyle}>Falta cobrar</span>
          <strong style={metricValueStyle}>{formatMoney(dashboard.pendingCollectionAmount)}</strong>
          <span style={metricCaptionStyle}>{dashboard.pendingCollectionCount} actividad(es) pendientes</span>
        </article>
        <article style={{ ...metricCardStyle, background: COLORS.panelAlt }}>
          <span style={metricLabelStyle}>Falta facturar</span>
          <strong style={metricValueStyle}>{formatMoney(dashboard.pendingBillingAmount)}</strong>
          <span style={metricCaptionStyle}>{dashboard.pendingBillingCount} actividad(es) por facturar</span>
        </article>
      </section>

      <section style={contentGridStyle}>
        <article style={panelStyle}>
          <header style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>Cuentas</h2>
            <span style={panelCaptionStyle}>Caja y bancos con saldo actualizado automaticamente.</span>
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
              <span>Tipo</span>
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

          <div style={listStyle}>
            {accounts.map((account) => (
              <div key={account.id} style={listItemStyle}>
                <div>
                  <strong style={listItemTitleStyle}>{account.name}</strong>
                  <span style={listItemMetaStyle}>{account.accountType === "cash" ? "Caja" : "Banco"}</span>
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
            <span style={panelCaptionStyle}>Ingreso o gasto, cuenta, descripcion y division por lineas.</span>
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
              <span>Fecha</span>
              <input
                type="date"
                value={journalForm.movementDate}
                onChange={(event) => setJournalForm((current) => ({ ...current, movementDate: event.target.value }))}
                style={inputStyle}
              />
            </label>
            <label style={fieldStyle}>
              <span>Cuenta</span>
              <select
                value={journalForm.accountId}
                onChange={(event) => setJournalForm((current) => ({ ...current, accountId: event.target.value }))}
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
              <span>Monto total</span>
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
            <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
              <span>Descripcion</span>
              <input
                value={journalForm.description}
                onChange={(event) => setJournalForm((current) => ({ ...current, description: event.target.value }))}
                style={inputStyle}
                placeholder="Cobro, pago, transferencia, combustible..."
              />
            </label>

            <div style={{ ...subPanelStyle, gridColumn: "1 / -1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display: "grid", gap: 4 }}>
                  <h3 style={subPanelTitleStyle}>Lineas de asignacion</h3>
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

                      {(allocation.destinationType === "vehicle" ||
                        allocation.destinationType === "personal" ||
                        allocation.destinationType === "other") ? (
                        <label style={fieldStyle}>
                          <span>Etiqueta</span>
                          <input
                            value={allocation.destinationLabel}
                            onChange={(event) =>
                              updateJournalAllocation(setJournalForm, index, (current) => ({
                                ...current,
                                destinationLabel: event.target.value
                              }))
                            }
                            style={inputStyle}
                            placeholder="Camioneta, uso personal, otros..."
                          />
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
                  Diferencia: {formatMoney(journalDifference)}
                </span>
              </div>
            </div>

            <button type="submit" disabled={savingJournal} style={{ ...primaryButtonStyle, gridColumn: "1 / -1" }}>
              {savingJournal ? "Guardando..." : "Registrar movimiento"}
            </button>
          </form>
        </article>
      </section>

      <section style={contentGridStyle}>
        <article style={panelStyle}>
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
                  <option value="pendiente_de_facturar">Pendiente de facturar</option>
                  <option value="facturado">Facturado</option>
                  <option value="pendiente_de_cobrar">Pendiente de cobrar</option>
                  <option value="cobrado">Cobrado</option>
                </select>
              </label>
              <button type="submit" disabled={savingActivity} style={secondaryButtonStyle}>
                {savingActivity ? "Guardando..." : "Guardar actividad"}
              </button>
            </form>
          </div>
        </article>

        <article style={panelStyle}>
          <header style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>Reportes base</h2>
            <span style={panelCaptionStyle}>Lectura rapida del libro diario, los centros de costo y el estado comercial.</span>
          </header>

          <div style={subPanelStyle}>
            <h3 style={subPanelTitleStyle}>Ultimos movimientos</h3>
            <div style={listStyle}>
              {journalEntries.slice(0, 12).map((entry) => {
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
                      {formatMoney(entry.totalAmount)}
                    </strong>
                  </div>
                );
              })}
              {!loading && journalEntries.length === 0 ? <p style={emptyTextStyle}>Todavia no hay movimientos.</p> : null}
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
            <h3 style={subPanelTitleStyle}>Gastos por centro</h3>
            <div style={listStyle}>
              {dashboard.topExpenseCenters.map((bucket) => (
                <div key={`expense-${bucket.label}`} style={listItemStyle}>
                  <div>
                    <strong style={listItemTitleStyle}>{bucket.label}</strong>
                    <span style={listItemMetaStyle}>{bucket.count} linea(s) de gasto</span>
                  </div>
                  <strong style={{ ...listItemMoneyStyle, color: COLORS.expenseAccent }}>{formatMoney(bucket.amount)}</strong>
                </div>
              ))}
              {dashboard.topExpenseCenters.length === 0 ? (
                <p style={emptyTextStyle}>Todavia no hay gastos asignados a centros de costo.</p>
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
                  <strong style={{ ...listItemMoneyStyle, color: COLORS.incomeAccent }}>{formatMoney(bucket.amount)}</strong>
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
