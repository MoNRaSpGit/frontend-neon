import { useEffect, useState } from "react";
import { fetchPublishedFrontendBuildMeta, FRONTEND_BUILD_INFO } from "../config/build";

const UPDATE_CHECK_INTERVAL_MS = 2 * 60 * 1000;

export function AppUpdateNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkForUpdates = async () => {
      try {
        const published = await fetchPublishedFrontendBuildMeta();
        if (!mounted) return;
        setShow(published.releaseSha !== FRONTEND_BUILD_INFO.releaseSha);
      } catch {
        if (mounted) {
          setShow(false);
        }
      }
    };

    void checkForUpdates();
    const intervalId = window.setInterval(() => {
      void checkForUpdates();
    }, UPDATE_CHECK_INTERVAL_MS);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  if (!show) {
    return null;
  }

  return (
    <aside style={noticeStyle}>
      <strong>Hay una version nueva disponible.</strong>
      <button type="button" onClick={() => window.location.reload()} style={buttonStyle}>
        Actualizar
      </button>
    </aside>
  );
}

const noticeStyle: React.CSSProperties = {
  position: "fixed",
  left: 16,
  bottom: 16,
  zIndex: 30,
  padding: "12px 14px",
  borderRadius: 18,
  background: "#0f5b73",
  color: "#fff",
  display: "flex",
  gap: 12,
  alignItems: "center",
  boxShadow: "0 16px 30px rgba(0,0,0,0.16)"
};

const buttonStyle: React.CSSProperties = {
  minHeight: 36,
  padding: "0 12px",
  borderRadius: 999,
  border: "none",
  fontWeight: 800,
  cursor: "pointer"
};
