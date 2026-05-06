import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../shared/config/api";
import { BuildMetaCard } from "../../shared/components/BuildMetaCard";
import { saveSession } from "./auth.client";
import { AuthSession } from "./auth.types";
import { getDefaultAuthenticatedRoute } from "./module-routing";

const DEMO_CREDENTIALS = {
  email: "neon.demo@saaspro.com",
  password: "demo12345"
} as const;

const DEMO_ACCESS_ENABLED = false;

export function LoginPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    if (!DEMO_ACCESS_ENABLED) {
      toast.error("Acceso pausado por ahora. Todavia no habilites entrada al demo.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(DEMO_CREDENTIALS)
      });

      const payload = (await response.json().catch(() => ({}))) as Partial<AuthSession> & { message?: string };
      if (!response.ok || !payload.user || !payload.tokens) {
        throw new Error(payload.message || "No se pudo iniciar sesion");
      }

      const session = payload as AuthSession;
      saveSession(session);
      navigate(getDefaultAuthenticatedRoute({ ...session.user, tenantContext: session.tenantContext }), { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo iniciar sesion");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <button
          type="button"
          onClick={handleLogin}
          disabled={submitting || !DEMO_ACCESS_ENABLED}
          style={{
            ...primaryButtonStyle,
            opacity: DEMO_ACCESS_ENABLED ? 1 : 0.55,
            cursor: DEMO_ACCESS_ENABLED ? "pointer" : "not-allowed"
          }}
        >
          {submitting ? "Iniciando..." : "Iniciar"}
        </button>
        {!DEMO_ACCESS_ENABLED ? <p style={statusTextStyle}>Acceso al demo pausado temporalmente.</p> : null}
        <BuildMetaCard />
      </section>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "clamp(18px, 4vw, 32px)",
  display: "grid",
  alignContent: "center",
  justifyItems: "center",
  background: "linear-gradient(180deg, #f5fbff 0%, #eef6ff 100%)",
  fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif"
};

const cardStyle: React.CSSProperties = {
  width: "min(100%, 420px)",
  background: "#ffffff",
  border: "1px solid #d7e6ef",
  borderRadius: 28,
  padding: "clamp(16px, 4vw, 24px)",
  display: "grid",
  gap: 16,
  boxShadow: "0 20px 40px rgba(32, 68, 89, 0.08)"
};

const primaryButtonStyle: React.CSSProperties = {
  minHeight: 50,
  borderRadius: 999,
  border: "none",
  background: "#0f5b73",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer"
};

const statusTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.5,
  color: "#526a76",
  textAlign: "center"
};
