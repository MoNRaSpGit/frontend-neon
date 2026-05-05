import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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

const loginSchema = z.object({
  email: z.string().email("Ingresa un email valido"),
  password: z.string().min(6, "La clave tiene que tener al menos 6 caracteres")
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: DEMO_CREDENTIALS.email,
      password: DEMO_CREDENTIALS.password
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
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
  });

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <span style={eyebrowStyle}>SaaSPro</span>
        <h1 style={titleStyle}>Neon</h1>
        <p style={bodyStyle}>Esqueleto inicial del nuevo modulo, listo para conectarse al SaaS.</p>
      </section>

      <section style={cardStyle}>
        <form onSubmit={onSubmit} style={formStyle}>
          <div style={demoNoticeStyle}>
            <strong>Modo demo</strong>
            <span>Este acceso de prueba ya queda cargado para entrar directo durante esta etapa.</span>
          </div>
          <label style={fieldStyle}>
            <span>Email</span>
            <input type="email" {...form.register("email")} style={inputStyle} />
          </label>
          <label style={fieldStyle}>
            <span>Clave</span>
            <input type="password" {...form.register("password")} style={inputStyle} />
          </label>
          <button type="submit" disabled={submitting} style={primaryButtonStyle}>
            {submitting ? "Entrando..." : "Entrar"}
          </button>
        </form>
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
  gap: 18,
  background: "linear-gradient(180deg, #f5fbff 0%, #eef6ff 100%)",
  fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif"
};

const heroStyle: React.CSSProperties = {
  maxWidth: 640,
  margin: "0 auto",
  display: "grid",
  gap: 8
};

const eyebrowStyle: React.CSSProperties = {
  width: "fit-content",
  padding: "6px 10px",
  borderRadius: 999,
  background: "#dff7ff",
  color: "#0f5b73",
  fontWeight: 800,
  fontSize: 12,
  letterSpacing: "0.08em",
  textTransform: "uppercase"
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "clamp(38px, 8vw, 64px)",
  lineHeight: 0.92,
  color: "#082838"
};

const bodyStyle: React.CSSProperties = {
  margin: 0,
  color: "#496272",
  lineHeight: 1.6
};

const cardStyle: React.CSSProperties = {
  maxWidth: 640,
  margin: "0 auto",
  background: "#ffffff",
  border: "1px solid #d7e6ef",
  borderRadius: 28,
  padding: "clamp(16px, 4vw, 24px)",
  display: "grid",
  gap: 16,
  boxShadow: "0 20px 40px rgba(32, 68, 89, 0.08)"
};

const formStyle: React.CSSProperties = {
  display: "grid",
  gap: 14
};

const demoNoticeStyle: React.CSSProperties = {
  display: "grid",
  gap: 4,
  padding: "12px 14px",
  borderRadius: 18,
  background: "#eef8ff",
  border: "1px solid #cfe7f6",
  color: "#21485b",
  lineHeight: 1.45
};

const fieldStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  color: "#17384a",
  fontWeight: 700
};

const inputStyle: React.CSSProperties = {
  minHeight: 48,
  borderRadius: 16,
  border: "1px solid #c6d8e2",
  padding: "0 14px",
  fontSize: 15
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
