import { Link } from "react-router-dom";

export function RegisterPage() {
  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <span style={eyebrowStyle}>Neon</span>
        <h1 style={titleStyle}>Registro base pendiente</h1>
        <p style={bodyStyle}>
          Este modulo ya tiene la ruta preparada. Cuando definamos los datos y flujo de negocio, bajamos el formulario real.
        </p>
        <Link to="/login" style={linkStyle}>
          Volver al login
        </Link>
      </section>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: 20,
  background: "#f4f9fc",
  fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif"
};

const cardStyle: React.CSSProperties = {
  width: "min(100%, 560px)",
  padding: 24,
  borderRadius: 24,
  border: "1px solid #d7e6ef",
  background: "#fff",
  display: "grid",
  gap: 12
};

const eyebrowStyle: React.CSSProperties = {
  color: "#0f5b73",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontSize: 12
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: "#082838"
};

const bodyStyle: React.CSSProperties = {
  margin: 0,
  color: "#4d6472",
  lineHeight: 1.6
};

const linkStyle: React.CSSProperties = {
  color: "#0f5b73",
  fontWeight: 800,
  textDecoration: "none"
};
