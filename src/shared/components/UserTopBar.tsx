import { Link, useNavigate } from "react-router-dom";
import { getStoredUser, logoutSession } from "../../features/auth/auth.client";

type Props = {
  showDashboardLink?: boolean;
};

export function UserTopBar({ showDashboardLink = true }: Props) {
  const navigate = useNavigate();
  const user = getStoredUser();
  const userLabel = user?.fullName?.trim() || user?.email || "Usuario";

  async function handleLogout() {
    await logoutSession();
    navigate("/login", { replace: true });
  }

  return (
    <header style={barStyle}>
      <div style={identityStyle}>
        <span style={badgeStyle}>N</span>
        <div style={metaStyle}>
          <strong style={nameStyle}>{userLabel}</strong>
          <span style={tenantStyle}>{user?.tenantContext?.tenant.name || "Sin tenant"}</span>
        </div>
      </div>
      <div style={actionsStyle}>
        {showDashboardLink ? (
          <Link to="/dashboard" style={linkStyle}>
            Dashboard
          </Link>
        ) : null}
        <button type="button" onClick={handleLogout} style={buttonStyle}>
          Cerrar sesion
        </button>
      </div>
    </header>
  );
}

const barStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 1080,
  margin: "0 auto",
  padding: 14,
  borderRadius: 22,
  border: "1px solid #dce8ef",
  background: "rgba(255,255,255,0.88)",
  backdropFilter: "blur(8px)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap"
};

const identityStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12
};

const badgeStyle: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 999,
  display: "grid",
  placeItems: "center",
  background: "#dff7ff",
  color: "#0f5b73",
  fontWeight: 900
};

const metaStyle: React.CSSProperties = {
  display: "grid",
  gap: 2
};

const nameStyle: React.CSSProperties = {
  color: "#102534"
};

const tenantStyle: React.CSSProperties = {
  color: "#657986",
  fontSize: 13
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10
};

const linkStyle: React.CSSProperties = {
  color: "#0f5b73",
  textDecoration: "none",
  fontWeight: 800
};

const buttonStyle: React.CSSProperties = {
  minHeight: 40,
  padding: "0 14px",
  borderRadius: 999,
  border: "1px solid #bfd8e2",
  background: "#ffffff",
  color: "#17384a",
  fontWeight: 800,
  cursor: "pointer"
};
