import type { CSSProperties } from "react";
import { COLORS } from "./neon.home.config";

export const heroCardStyle: CSSProperties = {
  width: "100%",
  maxWidth: 1180,
  margin: "0 auto",
  padding: "28px clamp(20px, 4vw, 34px)",
  borderRadius: 28,
  border: `1px solid ${COLORS.border}`,
  background: "linear-gradient(135deg, rgba(248, 244, 236, 0.96) 0%, rgba(230, 236, 239, 0.96) 100%)",
  boxShadow: "0 18px 36px rgba(32, 34, 38, 0.07)",
  display: "grid",
  gap: 10
};

export const heroEyebrowStyle: CSSProperties = {
  width: "fit-content",
  padding: "6px 10px",
  borderRadius: 999,
  background: COLORS.tagBg,
  color: COLORS.inkSoft,
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase"
};

export const heroTitleStyle: CSSProperties = {
  margin: 0,
  color: COLORS.ink,
  fontSize: "clamp(28px, 4vw, 44px)",
  lineHeight: 1.02
};

export const heroBodyStyle: CSSProperties = {
  margin: 0,
  color: COLORS.inkSoft,
  lineHeight: 1.6,
  maxWidth: 900
};

export const workspaceNavWrapStyle: CSSProperties = {
  width: "100%",
  maxWidth: 1180,
  margin: "0 auto",
  display: "grid",
  gap: 12
};

export const companySwitcherStyle: CSSProperties = {
  display: "flex",
  justifyContent: "center"
};

export const companySwitcherInnerStyle: CSSProperties = {
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  padding: "12px 14px",
  borderRadius: 22,
  border: `1px solid ${COLORS.border}`,
  background: "rgba(252, 250, 246, 0.96)",
  boxShadow: "0 12px 26px rgba(32, 34, 38, 0.05)",
  flexWrap: "wrap"
};

export const companySwitcherLabelStyle: CSSProperties = {
  color: COLORS.inkSoft,
  fontSize: 13,
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase"
};

export const companySwitcherButtonsStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap"
};

export const companySwitcherButtonStyle: CSSProperties = {
  minHeight: 40,
  padding: "0 16px",
  borderRadius: 999,
  border: `1px solid ${COLORS.border}`,
  background: COLORS.panel,
  color: COLORS.ink,
  fontWeight: 800,
  cursor: "pointer"
};

export const workspaceNavStyle: CSSProperties = {
  width: "100%",
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  padding: 10,
  borderRadius: 24,
  border: `1px solid ${COLORS.border}`,
  background: "rgba(252, 250, 246, 0.96)",
  boxShadow: "0 12px 26px rgba(32, 34, 38, 0.05)"
};

export const workspaceNavButtonStyle: CSSProperties = {
  minHeight: 44,
  padding: "0 16px",
  borderRadius: 999,
  border: `1px solid ${COLORS.border}`,
  background: COLORS.panel,
  color: COLORS.ink,
  fontWeight: 800,
  cursor: "pointer"
};

export const dashboardGridStyle: CSSProperties = {
  width: "100%",
  maxWidth: 1180,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
  gap: 14
};

export const metricCardStyle: CSSProperties = {
  minHeight: 148,
  padding: 18,
  borderRadius: 24,
  border: `1px solid ${COLORS.border}`,
  boxShadow: "0 16px 34px rgba(32, 34, 38, 0.06)",
  display: "grid",
  gap: 10,
  alignContent: "space-between"
};

export const metricLabelStyle: CSSProperties = {
  color: COLORS.inkMuted,
  fontSize: 13,
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase"
};

export const metricValueStyle: CSSProperties = {
  color: COLORS.ink,
  fontSize: "clamp(24px, 4vw, 34px)",
  lineHeight: 1
};

export const metricCaptionStyle: CSSProperties = {
  color: COLORS.inkSoft,
  fontSize: 14,
  lineHeight: 1.5
};

export const contentGridStyle: CSSProperties = {
  width: "100%",
  maxWidth: 1180,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
  gap: 16
};

export const panelStyle: CSSProperties = {
  padding: 20,
  borderRadius: 24,
  border: `1px solid ${COLORS.border}`,
  background: COLORS.panel,
  boxShadow: "0 16px 34px rgba(32, 34, 38, 0.06)",
  display: "grid",
  gap: 16,
  alignContent: "start"
};

export const panelHeaderStyle: CSSProperties = {
  display: "grid",
  gap: 4
};

export const panelTitleStyle: CSSProperties = {
  margin: 0,
  color: COLORS.ink,
  fontSize: 22
};

export const panelCaptionStyle: CSSProperties = {
  color: COLORS.inkMuted,
  fontSize: 14
};

export const subPanelStyle: CSSProperties = {
  padding: 16,
  borderRadius: 20,
  border: `1px solid ${COLORS.borderSoft}`,
  background: COLORS.panelAlt,
  display: "grid",
  gap: 14
};

export const subPanelTitleStyle: CSSProperties = {
  margin: 0,
  color: COLORS.ink,
  fontSize: 17
};

export const formStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
  gap: 12
};

export const fieldStyle: CSSProperties = {
  display: "grid",
  gap: 8,
  color: COLORS.ink,
  fontWeight: 700
};

export const inputStyle: CSSProperties = {
  minHeight: 46,
  borderRadius: 16,
  border: `1px solid ${COLORS.border}`,
  padding: "0 14px",
  fontSize: 15,
  background: "#fcfaf6",
  color: COLORS.ink
};

export const primaryButtonStyle: CSSProperties = {
  minHeight: 48,
  borderRadius: 999,
  border: "none",
  background: COLORS.button,
  color: COLORS.buttonText,
  fontWeight: 800,
  cursor: "pointer"
};

export const secondaryButtonStyle: CSSProperties = {
  minHeight: 46,
  borderRadius: 16,
  border: `1px solid ${COLORS.border}`,
  background: "#f7f2ea",
  color: COLORS.ink,
  fontWeight: 800,
  cursor: "pointer"
};

export const listStyle: CSSProperties = {
  display: "grid",
  gap: 10
};

export const listItemStyle: CSSProperties = {
  padding: "14px 14px 12px",
  borderRadius: 18,
  border: `1px solid ${COLORS.border}`,
  background: COLORS.panel,
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "flex-start"
};

export const listItemTitleStyle: CSSProperties = {
  display: "block",
  color: COLORS.ink
};

export const listItemMetaStyle: CSSProperties = {
  display: "block",
  color: COLORS.inkSoft,
  fontSize: 14,
  lineHeight: 1.5,
  marginTop: 4
};

export const listItemMoneyStyle: CSSProperties = {
  color: COLORS.ink,
  whiteSpace: "nowrap"
};

export const emptyTextStyle: CSSProperties = {
  margin: 0,
  color: COLORS.inkMuted
};

export const modalOverlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(29, 36, 48, 0.38)",
  display: "grid",
  placeItems: "center",
  padding: 20,
  zIndex: 50
};

export const modalCardStyle: CSSProperties = {
  width: "min(100%, 460px)",
  padding: 22,
  borderRadius: 24,
  border: `1px solid ${COLORS.border}`,
  background: COLORS.panel,
  boxShadow: "0 24px 48px rgba(32, 34, 38, 0.18)",
  display: "grid",
  gap: 14
};

export const modalTitleStyle: CSSProperties = {
  margin: 0,
  color: COLORS.ink,
  fontSize: 22
};

export const modalBodyStyle: CSSProperties = {
  margin: 0,
  color: COLORS.inkSoft,
  lineHeight: 1.6
};

export const modalActionsStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  flexWrap: "wrap"
};

export const modalButtonStyle: CSSProperties = {
  minWidth: 148
};
