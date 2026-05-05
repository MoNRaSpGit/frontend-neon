import { useEffect, useState } from "react";
import { UserTopBar } from "../../shared/components/UserTopBar";
import { BuildMetaCard } from "../../shared/components/BuildMetaCard";
import { getNeonStatus } from "./neon.client";
import { NeonStatus } from "./neon.types";

export function NeonHomePage() {
  const [status, setStatus] = useState<NeonStatus | null>(null);

  useEffect(() => {
    let mounted = true;
    void getNeonStatus().then((nextStatus) => {
      if (mounted) {
        setStatus(nextStatus);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main style={pageStyle}>
      <UserTopBar />

      <section style={heroStyle}>
        <span style={heroEyebrowStyle}>Nuevo modulo SaaS</span>
        <h1 style={heroTitleStyle}>Neon</h1>
        <p style={heroTextStyle}>
          Este frontend ya nacio separado, alineado a `SaaSPro` y listo para conectar datos, contratos y flujo real.
        </p>
      </section>

      <section style={contentGridStyle}>
        <article style={panelStyle}>
          <h2 style={panelTitleStyle}>Estado del esqueleto</h2>
          <p style={panelTextStyle}>Modulo: {status?.module || "neon"}</p>
          <p style={panelTextStyle}>Fase: {status?.phase || "shell"}</p>
          <p style={panelTextStyle}>Tenant actual: {status?.tenant.name || "sin leer"}</p>
          <p style={panelTextStyle}>Usuario actual: {status?.user.email || "sin leer"}</p>
          <p style={panelTextStyle}>DB: {status?.backend.database || "pending"}</p>
        </article>

        <article style={panelStyle}>
          <h2 style={panelTitleStyle}>Base ya lista</h2>
          <ul style={listStyle}>
            <li>auth SaaS</li>
            <li>routing protegido</li>
            <li>dashboard de modulo</li>
            <li>saas-admin linkeado</li>
            <li>build meta y smoke test</li>
          </ul>
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
  gap: 20,
  fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif",
  background:
    "radial-gradient(circle at top left, rgba(34, 211, 238, 0.15), transparent 24%), radial-gradient(circle at top right, rgba(14, 165, 233, 0.15), transparent 24%), linear-gradient(180deg, #fbfeff 0%, #f1f8fc 100%)"
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
  fontSize: "clamp(34px, 6vw, 60px)",
  lineHeight: 0.94,
  color: "#102534"
};

const heroTextStyle: React.CSSProperties = {
  margin: 0,
  color: "#4d6472",
  lineHeight: 1.6,
  maxWidth: 720
};

const contentGridStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 1080,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
  gap: 16
};

const panelStyle: React.CSSProperties = {
  padding: 20,
  borderRadius: 24,
  border: "1px solid #d8e6ed",
  background: "#ffffff",
  boxShadow: "0 16px 34px rgba(41, 64, 88, 0.06)",
  display: "grid",
  gap: 10
};

const panelTitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#102534"
};

const panelTextStyle: React.CSSProperties = {
  margin: 0,
  color: "#4d6472",
  lineHeight: 1.55
};

const listStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: 18,
  color: "#4d6472",
  lineHeight: 1.7
};
