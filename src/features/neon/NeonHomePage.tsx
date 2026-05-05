import { FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { UserTopBar } from "../../shared/components/UserTopBar";
import { BuildMetaCard } from "../../shared/components/BuildMetaCard";
import {
  createNeonActivity,
  createNeonActivityPayment,
  createNeonClient,
  getNeonActivity,
  getNeonStatus,
  listNeonAccounts,
  listNeonActivities,
  listNeonClients
} from "./neon.client";
import { NeonAccount, NeonActivity, NeonClient, NeonStatus } from "./neon.types";

const ACTIVITY_TYPE_OPTIONS = [
  { value: "neon", label: "Neon" },
  { value: "movil_audiovisual", label: "Movil audiovisual" },
  { value: "otros", label: "Otros" }
] as const;

const COMMERCIAL_STATUS_OPTIONS = [
  { value: "pendiente_de_facturar", label: "Pendiente de facturar" },
  { value: "facturado", label: "Facturado" },
  { value: "pendiente_de_cobrar", label: "Pendiente de cobrar" },
  { value: "cobrado", label: "Cobrado" }
] as const;

type ClientFormState = {
  name: string;
  phone: string;
  notes: string;
};

type ActivityFormState = {
  activityDate: string;
  description: string;
  clientId: string;
  activityType: "neon" | "movil_audiovisual" | "otros";
  quotedAmount: string;
  commercialStatus: "pendiente_de_facturar" | "facturado" | "pendiente_de_cobrar" | "cobrado";
};

type PaymentFormState = {
  accountId: string;
  paymentDate: string;
  paidAmount: string;
  description: string;
};

function getTodayDateInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 2
  }).format(value);
}

function formatActivityCode(activity: NeonActivity) {
  return `#${activity.activityNumber}/${activity.activityYear}`;
}

function formatShortDate(dateIso: string) {
  return new Intl.DateTimeFormat("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(dateIso));
}

export function NeonHomePage() {
  const [status, setStatus] = useState<NeonStatus | null>(null);
  const [clients, setClients] = useState<NeonClient[]>([]);
  const [accounts, setAccounts] = useState<NeonAccount[]>([]);
  const [activities, setActivities] = useState<NeonActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<NeonActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingClient, setSavingClient] = useState(false);
  const [savingActivity, setSavingActivity] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
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

  function syncPaymentDefaults(nextAccounts: NeonAccount[], nextActivity: NeonActivity | null) {
    const defaultAccountId = nextAccounts[0] ? String(nextAccounts[0].id) : "";
    setPaymentForm((current) => ({
      ...current,
      accountId: current.accountId || defaultAccountId,
      paidAmount:
        nextActivity && nextActivity.pendingAmount > 0 && !current.paidAmount ? String(nextActivity.pendingAmount) : current.paidAmount
    }));
  }

  const loadHomeData = useCallback(async (preferredActivityId?: number) => {
    setLoading(true);

    try {
      const [nextStatus, nextClients, nextAccounts, nextActivities] = await Promise.all([
        getNeonStatus(),
        listNeonClients(),
        listNeonAccounts(),
        listNeonActivities()
      ]);

      setStatus(nextStatus);
      setClients(nextClients);
      setAccounts(nextAccounts);
      setActivities(nextActivities);

      const activityIdToOpen = preferredActivityId ?? nextActivities[0]?.id;
      if (activityIdToOpen) {
        const detail = await getNeonActivity(activityIdToOpen);
        setSelectedActivity(detail);
        syncPaymentDefaults(nextAccounts, detail);
      } else {
        setSelectedActivity(null);
        syncPaymentDefaults(nextAccounts, null);
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

    const name = clientForm.name.trim();
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
      toast.success("Pago registrado");
      await loadHomeData(updatedActivity.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo registrar el pago");
    } finally {
      setSavingPayment(false);
    }
  }

  async function handleSelectActivity(activityId: number) {
    try {
      const detail = await getNeonActivity(activityId);
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

  const pendingActivities = activities.filter((activity) => activity.pendingAmount > 0).length;
  const activityTotal = activities.reduce((sum, activity) => sum + activity.quotedAmount, 0);
  const collectedTotal = activities.reduce((sum, activity) => sum + activity.collectedAmount, 0);
  const accountsBalance = accounts.reduce((sum, account) => sum + account.currentBalance, 0);

  return (
    <main style={pageStyle}>
      <UserTopBar />

      <section style={heroStyle}>
        <span style={heroEyebrowStyle}>Neon</span>
        <h1 style={heroTitleStyle}>Control por actividades</h1>
        <p style={heroTextStyle}>
          Ya tenemos clientes, actividades y ahora tambien `Registrar pago`, para mover de verdad el cobrado y el pendiente.
        </p>
      </section>

      <section style={cardGridStyle}>
        <article style={{ ...summaryCardStyle, background: "linear-gradient(180deg, #effbff 0%, #d7f1fb 100%)" }}>
          <span style={summaryLabelStyle}>Actividades</span>
          <strong style={summaryValueStyle}>{activities.length}</strong>
          <p style={summaryBodyStyle}>{pendingActivities} con pendiente por cobrar.</p>
        </article>

        <article style={summaryCardStyle}>
          <span style={summaryLabelStyle}>Ingresos</span>
          <strong style={summaryValueStyle}>{formatMoney(collectedTotal)}</strong>
          <p style={summaryBodyStyle}>Lo cobrado real ya impacta desde actividad.</p>
        </article>

        <article style={summaryCardStyle}>
          <span style={summaryLabelStyle}>Cuentas</span>
          <strong style={summaryValueStyle}>{formatMoney(accountsBalance)}</strong>
          <p style={summaryBodyStyle}>{accounts.length} cuenta{accounts.length === 1 ? "" : "s"} activas.</p>
        </article>

        <article style={summaryCardStyle}>
          <span style={summaryLabelStyle}>Reportes</span>
          <strong style={summaryValueStyle}>{formatMoney(activityTotal)}</strong>
          <p style={summaryBodyStyle}>Total presupuestado hoy en actividades.</p>
        </article>
      </section>

      <section style={contentGridStyle}>
        <article style={panelStyle}>
          <header style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>Agregar cliente</h2>
            <span style={panelCaptionStyle}>Primero el cliente, despues la actividad.</span>
          </header>
          <form onSubmit={handleCreateClient} style={formStyle}>
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
            <span style={panelCaptionStyle}>Este sigue siendo el verdadero inicio del flujo.</span>
          </header>
          <form onSubmit={handleCreateActivity} style={formStyle}>
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
            <label style={fieldStyle}>
              <span>Estado comercial</span>
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
                {COMMERCIAL_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" disabled={savingActivity} style={primaryButtonStyle}>
              {savingActivity ? "Guardando..." : "Guardar actividad"}
            </button>
          </form>
        </article>
      </section>

      <section style={contentGridStyle}>
        <article style={panelStyle}>
          <header style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>Actividades</h2>
            <span style={panelCaptionStyle}>{loading ? "Cargando..." : `${activities.length} registradas`}</span>
          </header>

          {activities.length > 0 ? (
            <div style={activityListStyle}>
              {activities.map((activity) => {
                const isSelected = selectedActivity?.id === activity.id;
                return (
                  <button
                    key={activity.id}
                    type="button"
                    onClick={() => void handleSelectActivity(activity.id)}
                    style={{
                      ...activityRowStyle,
                      borderColor: isSelected ? "#0f5b73" : "#d7e6ef",
                      background: isSelected ? "#eef8fc" : "#ffffff"
                    }}
                  >
                    <div style={activityRowTopStyle}>
                      <strong style={activityCodeStyle}>{formatActivityCode(activity)}</strong>
                      <span style={activityStatusStyle}>
                        {COMMERCIAL_STATUS_OPTIONS.find((option) => option.value === activity.commercialStatus)?.label}
                      </span>
                    </div>
                    <strong style={activityDescriptionStyle}>{activity.description}</strong>
                    <span style={activityClientStyle}>{activity.clientName || "Sin cliente"}</span>
                    <div style={activityMoneyRowStyle}>
                      <span>{formatMoney(activity.quotedAmount)}</span>
                      <span>Pendiente {formatMoney(activity.pendingAmount)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <p style={emptyTextStyle}>Todavia no hay actividades. La primera carga empieza aca.</p>
          )}
        </article>

        <article style={panelStyle}>
          <header style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>Detalle de actividad</h2>
            <span style={panelCaptionStyle}>Precio, cobrado y pendiente visibles rapido.</span>
          </header>

          {selectedActivity ? (
            <>
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
                  <span style={detailLabelStyle}>Tipo</span>
                  <strong style={detailValueStyle}>
                    {ACTIVITY_TYPE_OPTIONS.find((option) => option.value === selectedActivity.activityType)?.label}
                  </strong>
                </div>
                <div style={detailBlockStyle}>
                  <span style={detailLabelStyle}>Estado comercial</span>
                  <strong style={detailValueStyle}>
                    {COMMERCIAL_STATUS_OPTIONS.find((option) => option.value === selectedActivity.commercialStatus)?.label}
                  </strong>
                </div>
                <div style={detailBlockStyle}>
                  <span style={detailLabelStyle}>Precio total</span>
                  <strong style={detailValueStyle}>{formatMoney(selectedActivity.quotedAmount)}</strong>
                </div>
                <div style={detailBlockStyle}>
                  <span style={detailLabelStyle}>Cobrado</span>
                  <strong style={detailValueStyle}>{formatMoney(selectedActivity.collectedAmount)}</strong>
                </div>
                <div style={detailBlockStyle}>
                  <span style={detailLabelStyle}>Pendiente</span>
                  <strong style={detailValueStyle}>{formatMoney(selectedActivity.pendingAmount)}</strong>
                </div>
                <div style={detailBlockStyle}>
                  <span style={detailLabelStyle}>Base</span>
                  <strong style={detailValueStyle}>{status?.backend.database || "connected"}</strong>
                </div>
                <div style={{ ...detailBlockStyle, gridColumn: "1 / -1" }}>
                  <span style={detailLabelStyle}>Descripcion</span>
                  <strong style={detailValueStyle}>{selectedActivity.description}</strong>
                </div>
              </div>

              <section style={nestedPanelStyle}>
                <header style={panelHeaderStyle}>
                  <h3 style={nestedTitleStyle}>Registrar pago</h3>
                  <span style={panelCaptionStyle}>Solo entra dinero real cuando lo marcas como cobrado.</span>
                </header>
                <form onSubmit={handleCreatePayment} style={formStyle}>
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
                      placeholder="Pago seña, saldo final..."
                    />
                  </label>
                  <button type="submit" disabled={savingPayment} style={primaryButtonStyle}>
                    {savingPayment ? "Guardando..." : "Registrar pago"}
                  </button>
                </form>
              </section>

              <section style={nestedPanelStyle}>
                <header style={panelHeaderStyle}>
                  <h3 style={nestedTitleStyle}>Pagos registrados</h3>
                  <span style={panelCaptionStyle}>
                    {selectedActivity.payments?.length ? `${selectedActivity.payments.length} cargado(s)` : "Todavia sin pagos"}
                  </span>
                </header>

                {selectedActivity.payments && selectedActivity.payments.length > 0 ? (
                  <div style={paymentListStyle}>
                    {selectedActivity.payments.map((payment) => (
                      <div key={payment.id} style={paymentRowStyle}>
                        <div style={activityRowTopStyle}>
                          <strong style={activityCodeStyle}>{formatMoney(payment.paidAmount)}</strong>
                          <span style={activityStatusStyle}>{formatShortDate(payment.paymentDate)}</span>
                        </div>
                        <strong style={activityDescriptionStyle}>{payment.accountName}</strong>
                        <span style={activityClientStyle}>{payment.description || "Pago sin nota"}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={emptyTextStyle}>Todavia no se registro ningun pago para esta actividad.</p>
                )}
              </section>
            </>
          ) : (
            <p style={emptyTextStyle}>Elegi una actividad para ver su detalle.</p>
          )}
        </article>

        <article style={panelStyle}>
          <header style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>Cuentas</h2>
            <span style={panelCaptionStyle}>Saldo automatico en base a movimientos.</span>
          </header>
          {accounts.length > 0 ? (
            <div style={accountListStyle}>
              {accounts.map((account) => (
                <div key={account.id} style={accountRowStyle}>
                  <strong style={activityDescriptionStyle}>{account.name}</strong>
                  <span style={activityClientStyle}>{account.accountType === "cash" ? "Caja" : "Banco"}</span>
                  <strong style={detailValueStyle}>{formatMoney(account.currentBalance)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p style={emptyTextStyle}>Cargando cuentas base...</p>
          )}
        </article>

        <BuildMetaCard />
      </section>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "clamp(16px, 4vw, 32px)",
  display: "grid",
  gap: 18,
  fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif",
  background:
    "radial-gradient(circle at top left, rgba(34, 211, 238, 0.15), transparent 24%), radial-gradient(circle at top right, rgba(14, 165, 233, 0.14), transparent 24%), linear-gradient(180deg, #fbfeff 0%, #f1f8fc 100%)"
};

const heroStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 1080,
  margin: "0 auto",
  display: "grid",
  gap: 10
};

const heroEyebrowStyle: React.CSSProperties = {
  width: "fit-content",
  padding: "6px 10px",
  borderRadius: 999,
  background: "#dff7ff",
  color: "#0f5b73",
  fontWeight: 800,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.08em"
};

const heroTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "clamp(34px, 6vw, 58px)",
  lineHeight: 0.94,
  color: "#102534"
};

const heroTextStyle: React.CSSProperties = {
  margin: 0,
  color: "#4d6472",
  lineHeight: 1.6,
  maxWidth: 760
};

const cardGridStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 1080,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
  gap: 14
};

const summaryCardStyle: React.CSSProperties = {
  minHeight: 150,
  padding: 18,
  borderRadius: 24,
  border: "1px solid #d8e6ed",
  background: "#ffffff",
  boxShadow: "0 16px 34px rgba(41, 64, 88, 0.06)",
  display: "grid",
  gap: 10,
  alignContent: "space-between"
};

const summaryLabelStyle: React.CSSProperties = {
  color: "#5f7280",
  fontSize: 13,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.08em"
};

const summaryValueStyle: React.CSSProperties = {
  fontSize: "clamp(24px, 5vw, 32px)",
  lineHeight: 1,
  color: "#102534"
};

const summaryBodyStyle: React.CSSProperties = {
  margin: 0,
  color: "#4d6472",
  lineHeight: 1.5
};

const contentGridStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 1080,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
  gap: 16
};

const panelStyle: React.CSSProperties = {
  padding: 20,
  borderRadius: 24,
  border: "1px solid #d8e6ed",
  background: "#ffffff",
  boxShadow: "0 16px 34px rgba(41, 64, 88, 0.06)",
  display: "grid",
  gap: 14
};

const nestedPanelStyle: React.CSSProperties = {
  padding: 16,
  borderRadius: 20,
  border: "1px solid #dbe8ef",
  background: "#f8fcff",
  display: "grid",
  gap: 12
};

const panelHeaderStyle: React.CSSProperties = {
  display: "grid",
  gap: 4
};

const panelTitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#102534"
};

const nestedTitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#102534",
  fontSize: 18
};

const panelCaptionStyle: React.CSSProperties = {
  color: "#617582",
  fontSize: 14
};

const formStyle: React.CSSProperties = {
  display: "grid",
  gap: 12
};

const fieldStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  color: "#17384a",
  fontWeight: 700
};

const inputStyle: React.CSSProperties = {
  minHeight: 46,
  borderRadius: 16,
  border: "1px solid #c6d8e2",
  padding: "0 14px",
  fontSize: 15,
  background: "#fff"
};

const textareaStyle: React.CSSProperties = {
  minHeight: 88,
  borderRadius: 16,
  border: "1px solid #c6d8e2",
  padding: "12px 14px",
  fontSize: 15,
  resize: "vertical",
  fontFamily: "inherit"
};

const primaryButtonStyle: React.CSSProperties = {
  minHeight: 48,
  borderRadius: 999,
  border: "none",
  background: "#0f5b73",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer"
};

const activityListStyle: React.CSSProperties = {
  display: "grid",
  gap: 10
};

const activityRowStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "16px 16px 14px",
  borderRadius: 18,
  border: "1px solid",
  background: "#ffffff",
  display: "grid",
  gap: 8,
  cursor: "pointer"
};

const activityRowTopStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  flexWrap: "wrap"
};

const activityCodeStyle: React.CSSProperties = {
  color: "#0f5b73"
};

const activityStatusStyle: React.CSSProperties = {
  color: "#607582",
  fontSize: 13,
  fontWeight: 700
};

const activityDescriptionStyle: React.CSSProperties = {
  color: "#132735"
};

const activityClientStyle: React.CSSProperties = {
  color: "#607582"
};

const activityMoneyRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  flexWrap: "wrap",
  color: "#17384a",
  fontWeight: 700
};

const detailGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))",
  gap: 12
};

const detailBlockStyle: React.CSSProperties = {
  padding: "14px 14px 12px",
  borderRadius: 18,
  background: "#f6fbfe",
  border: "1px solid #d8e6ed",
  display: "grid",
  gap: 6
};

const detailLabelStyle: React.CSSProperties = {
  color: "#617582",
  fontSize: 13,
  fontWeight: 700
};

const detailValueStyle: React.CSSProperties = {
  color: "#102534",
  lineHeight: 1.35
};

const paymentListStyle: React.CSSProperties = {
  display: "grid",
  gap: 10
};

const paymentRowStyle: React.CSSProperties = {
  padding: "14px 14px 12px",
  borderRadius: 16,
  border: "1px solid #d8e6ed",
  background: "#ffffff",
  display: "grid",
  gap: 6
};

const accountListStyle: React.CSSProperties = {
  display: "grid",
  gap: 10
};

const accountRowStyle: React.CSSProperties = {
  padding: "14px 14px 12px",
  borderRadius: 16,
  border: "1px solid #d8e6ed",
  background: "#ffffff",
  display: "grid",
  gap: 4
};

const emptyTextStyle: React.CSSProperties = {
  margin: 0,
  color: "#617582",
  lineHeight: 1.6
};
