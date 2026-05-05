import { useMemo } from "react";
import { Link } from "react-router-dom";
import { UserTopBar } from "../../shared/components/UserTopBar";
import { getStoredUser } from "./auth.client";
import { getEnabledModules } from "./module-routing";
import { userCanAccessSaasAdmin } from "./tenant-capabilities";

const MODULE_CARDS = [
  {
    key: "neon",
    title: "Neon",
    description: "Nuevo modulo listo para bajar datos, reglas y flujo real.",
    route: "/neon",
    accent: "#0284c7",
    surface: "linear-gradient(180deg, #eef9ff 0%, #d7efff 100%)"
  }
];

export function DashboardPage() {
  const user = useMemo(() => getStoredUser(), []);
  const modules = getEnabledModules(user);
  const tenantName = user?.tenantContext?.tenant.name || "Sin tenant";
  const userLabel = user?.fullName?.trim() || user?.email || "Usuario";
  const canAccessSaasAdmin = userCanAccessSaasAdmin(user);
  const visibleCards = MODULE_CARDS.filter((moduleCard) => modules.includes(moduleCard.key));

  return (
    <main style={pageStyle}>
      <UserTopBar showDashboardLink={false} />
      <section style={heroStyle}>
        <span style={heroEyebrowStyle}>{tenantName}</span>
        <h1 style={heroTitleStyle}>Hola, {userLabel}</h1>
        <p style={heroTextStyle}>Este dashboard ya esta alineado al patrón SaaS para el futuro modulo `neon`.</p>
      </section>

      <section style={moduleSectionStyle}>
        {visibleCards.length > 0 ? (
          <div style={moduleGridStyle}>
            {visibleCards.map((moduleCard) => (
              <Link
                key={moduleCard.key}
                to={moduleCard.route}
                style={{
                  ...moduleCardStyle,
                  background: moduleCard.surface,
                  borderColor: `${moduleCard.accent}33`
                }}
              >
                <span style={{ ...moduleTagStyle, color: moduleCard.accent }}>{moduleCard.key}</span>
                <strong style={moduleTitleStyle}>{moduleCard.title}</strong>
                <p style={moduleBodyStyle}>{moduleCard.description}</p>
              </Link>
            ))}
            {canAccessSaasAdmin ? (
              <Link to="/saas-admin" style={{ ...moduleCardStyle, background: "#ffffff", borderColor: "#d8e1ea" }}>
                <span style={{ ...moduleTagStyle, color: "#334155" }}>staff</span>
                <strong style={moduleTitleStyle}>SaaS Admin</strong>
                <p style={moduleBodyStyle}>Tenants, billing y modulos.</p>
              </Link>
            ) : null}
          </div>
        ) : (
          <section style={emptyStateStyle}>
            <strong style={{ fontSize: 20, color: "#0f5b73" }}>Todavia no tenes `neon` habilitado</strong>
            <p style={emptyTextStyle}>Cuando el modulo se habilite desde el SaaS, aparecera listo para entrar.</p>
          </section>
        )}
      </section>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "clamp(16px, 4vw, 32px) clamp(12px, 3.6vw, 16px) clamp(32px, 7vw, 56px)",
  fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif",
  background:
    "radial-gradient(circle at top left, rgba(56, 189, 248, 0.18), transparent 24%), radial-gradient(circle at top right, rgba(6, 182, 212, 0.18), transparent 22%), linear-gradient(180deg, #fbfeff 0%, #f1f8fc 100%)",
  display: "grid",
  gap: 20
};

const heroStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 1080,
  margin: "0 auto",
  padding: "clamp(10px, 3vw, 18px) 2px 4px"
};

const heroEyebrowStyle: React.CSSProperties = {
  display: "inline-block",
  marginBottom: 10,
  padding: "6px 10px",
  borderRadius: 999,
  background: "#e0f6ff",
  color: "#0f5b73",
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.08em"
};

const heroTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "clamp(32px, 5vw, 54px)",
  lineHeight: 0.95,
  color: "#172433"
};

const heroTextStyle: React.CSSProperties = {
  margin: "10px 0 0",
  color: "#5f6d7a",
  fontSize: "clamp(15px, 3.6vw, 18px)",
  lineHeight: 1.45,
  maxWidth: 560
};

const moduleSectionStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 1080,
  margin: "0 auto"
};

const moduleGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
  gap: "clamp(12px, 3vw, 16px)"
};

const moduleCardStyle: React.CSSProperties = {
  minHeight: 188,
  padding: "clamp(16px, 4vw, 20px) clamp(14px, 3.8vw, 18px)",
  borderRadius: 26,
  border: "1px solid",
  textDecoration: "none",
  boxShadow: "0 16px 34px rgba(41, 64, 88, 0.08)",
  display: "grid",
  gap: 10,
  alignContent: "space-between"
};

const moduleTagStyle: React.CSSProperties = {
  width: "fit-content",
  padding: "5px 9px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.75)",
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.08em"
};

const moduleTitleStyle: React.CSSProperties = {
  fontSize: "clamp(26px, 6vw, 30px)",
  lineHeight: 0.98,
  color: "#172433"
};

const moduleBodyStyle: React.CSSProperties = {
  margin: 0,
  color: "#425364",
  lineHeight: 1.5,
  fontSize: 15
};

const emptyStateStyle: React.CSSProperties = {
  padding: "clamp(18px, 4vw, 24px) clamp(16px, 4vw, 22px)",
  borderRadius: 26,
  background: "#f0fbff",
  border: "1px solid #cae5ee",
  display: "grid",
  gap: 12
};

const emptyTextStyle: React.CSSProperties = {
  margin: 0,
  color: "#58707e",
  lineHeight: 1.6
};
