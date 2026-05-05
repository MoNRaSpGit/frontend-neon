import { useEffect, useState } from "react";
import { UserTopBar } from "../../shared/components/UserTopBar";
import { listSaasAdminTenants } from "./saas-admin.client";
import { SaasAdminTenantItem } from "./saas-admin.types";

export function SaasAdminHomePage() {
  const [items, setItems] = useState<SaasAdminTenantItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void listSaasAdminTenants()
      .then((payload) => {
        if (mounted) {
          setItems(payload.items);
        }
      })
      .catch((nextError) => {
        if (mounted) {
          setError(nextError instanceof Error ? nextError.message : "No se pudo cargar SaaS Admin");
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
        <span style={eyebrowStyle}>SaaS Admin</span>
        <h1 style={titleStyle}>Neon ya viene conectado al core</h1>
        <p style={bodyStyle}>Esta vista queda lista para usar el panel interno del SaaS desde el día uno.</p>
      </section>

      <section style={cardStyle}>
        {error ? <p style={errorStyle}>{error}</p> : null}
        {!error && items.length === 0 ? <p style={bodyStyle}>Sin tenants visibles por ahora.</p> : null}
        {items.map((item) => (
          <article key={item.id} style={tenantCardStyle}>
            <strong>{item.name}</strong>
            <span>{item.slug}</span>
            <span>Modulos: {item.modules.join(", ") || "ninguno"}</span>
          </article>
        ))}
      </section>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: 20,
  display: "grid",
  gap: 18,
  background: "#f5fbff",
  fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif"
};

const heroStyle: React.CSSProperties = {
  maxWidth: 960,
  width: "100%",
  margin: "0 auto",
  display: "grid",
  gap: 8
};

const eyebrowStyle: React.CSSProperties = {
  width: "fit-content",
  padding: "6px 10px",
  borderRadius: 999,
  background: "#e0f6ff",
  color: "#0f5b73",
  fontWeight: 800,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.08em"
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: "#102534"
};

const bodyStyle: React.CSSProperties = {
  margin: 0,
  color: "#546977",
  lineHeight: 1.6
};

const cardStyle: React.CSSProperties = {
  maxWidth: 960,
  width: "100%",
  margin: "0 auto",
  padding: 20,
  borderRadius: 24,
  background: "#fff",
  border: "1px solid #d8e6ed",
  display: "grid",
  gap: 12
};

const tenantCardStyle: React.CSSProperties = {
  padding: 14,
  borderRadius: 16,
  border: "1px solid #e3edf3",
  display: "grid",
  gap: 4,
  color: "#234051"
};

const errorStyle: React.CSSProperties = {
  margin: 0,
  color: "#b42318",
  fontWeight: 700
};
