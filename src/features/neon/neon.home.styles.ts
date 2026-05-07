import type { CSSProperties } from "react";
import { COLORS } from "./neon.home.config";

export const pageStyle: CSSProperties = {
  minHeight: "100vh",
  padding: "clamp(16px, 4vw, 32px)",
  display: "grid",
  alignContent: "start",
  gap: 18,
  fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif",
  background:
    `radial-gradient(circle at top left, ${COLORS.pageTopGlow}, transparent 24%), radial-gradient(circle at top right, ${COLORS.pageSideGlow}, transparent 24%), linear-gradient(180deg, ${COLORS.pageBase} 0%, ${COLORS.pageBaseEnd} 100%)`
};

export const heroStyle: CSSProperties = {
  width: "100%",
  maxWidth: 1080,
  margin: "0 auto",
  display: "grid",
  gap: 10
};

export const heroTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "clamp(34px, 6vw, 58px)",
  lineHeight: 0.94,
  color: COLORS.ink
};

export const cardGridStyle: CSSProperties = {
  width: "100%",
  maxWidth: 1080,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
  gap: 14
};

export const summaryCardStyle: CSSProperties = {
  minHeight: 150,
  padding: 18,
  borderRadius: 24,
  border: `1px solid ${COLORS.border}`,
  background: COLORS.panel,
  boxShadow: "0 18px 36px rgba(32, 34, 38, 0.08)",
  display: "grid",
  gap: 10,
  alignContent: "space-between"
};

export const summaryCardButtonStyle: CSSProperties = {
  textAlign: "left",
  cursor: "pointer",
  transition: "transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease"
};

export const summaryLabelStyle: CSSProperties = {
  color: COLORS.inkMuted,
  fontSize: 13,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.08em"
};

export const summaryValueStyle: CSSProperties = {
  fontSize: "clamp(24px, 5vw, 32px)",
  lineHeight: 1,
  color: COLORS.ink
};

export const summaryBodyStyle: CSSProperties = {
  margin: 0,
  color: COLORS.inkSoft,
  lineHeight: 1.5
};

export const summaryLinkStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 800,
  letterSpacing: "0.04em",
  textTransform: "uppercase"
};

export const sectionNavWrapStyle: CSSProperties = {
  width: "100%",
  maxWidth: 1080,
  margin: "0 auto"
};

export const sectionNavStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  padding: 8,
  borderRadius: 999,
  background: "rgba(248, 244, 236, 0.88)",
  border: `1px solid ${COLORS.border}`,
  boxShadow: "0 14px 28px rgba(32, 34, 38, 0.06)",
  backdropFilter: "blur(14px)"
};

export const sectionNavButtonStyle: CSSProperties = {
  minHeight: 42,
  padding: "0 16px",
  borderRadius: 999,
  border: "1px solid",
  fontWeight: 800,
  cursor: "pointer"
};

export const sectionHeroWrapStyle: CSSProperties = {
  width: "100%",
  maxWidth: 1080,
  margin: "0 auto"
};

export const sectionHeroCardStyle: CSSProperties = {
  padding: "22px clamp(20px, 4vw, 30px)",
  borderRadius: 28,
  border: `1px solid ${COLORS.border}`,
  background: "linear-gradient(135deg, #e6ecef 0%, #d6dde1 100%)",
  boxShadow: "0 16px 34px rgba(32, 34, 38, 0.07)",
  display: "grid",
  gap: 8
};

export const sectionEyebrowStyle: CSSProperties = {
  width: "fit-content",
  padding: "6px 10px",
  borderRadius: 999,
  background: "#d9dde2",
  color: COLORS.activityAccent,
  fontWeight: 800,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.08em"
};

export const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "clamp(24px, 4vw, 34px)",
  color: COLORS.ink
};

export const sectionTextStyle: CSSProperties = {
  margin: 0,
  color: COLORS.inkSoft,
  lineHeight: 1.6,
  maxWidth: 680
};

export const contentGridStyle: CSSProperties = {
  width: "100%",
  maxWidth: 1080,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
  gap: 16
};

export const panelStyle: CSSProperties = {
  padding: 20,
  borderRadius: 24,
  border: `1px solid ${COLORS.border}`,
  background: COLORS.panel,
  boxShadow: "0 16px 34px rgba(32, 34, 38, 0.06)",
  display: "grid",
  gap: 14
};

export const clickablePanelStyle: CSSProperties = {
  textAlign: "left",
  cursor: "pointer"
};

export const panelHeaderStyle: CSSProperties = {
  display: "grid",
  gap: 4
};

export const panelTitleStyle: CSSProperties = {
  margin: 0,
  color: COLORS.ink
};

export const panelCaptionStyle: CSSProperties = {
  color: COLORS.inkMuted,
  fontSize: 14
};

export const formStyle: CSSProperties = {
  display: "grid",
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

export const textareaStyle: CSSProperties = {
  minHeight: 88,
  borderRadius: 16,
  border: `1px solid ${COLORS.border}`,
  padding: "12px 14px",
  fontSize: 15,
  resize: "vertical",
  fontFamily: "inherit",
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

export const activityListStyle: CSSProperties = {
  display: "grid",
  gap: 10
};

export const wideActivityGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
  gap: 12
};

export const activityRowStyle: CSSProperties = {
  textAlign: "left",
  padding: "16px 16px 14px",
  borderRadius: 18,
  border: "1px solid",
  background: COLORS.panel,
  display: "grid",
  gap: 8,
  cursor: "pointer"
};

export const activityRowTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  flexWrap: "wrap"
};

export const activityCodeStyle: CSSProperties = {
  color: COLORS.activityAccent
};

export const activityStatusStyle: CSSProperties = {
  color: COLORS.inkMuted,
  fontSize: 13,
  fontWeight: 700
};

export const activityDescriptionStyle: CSSProperties = {
  color: COLORS.ink
};

export const activityClientStyle: CSSProperties = {
  color: COLORS.inkMuted
};

export const activityMoneyRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  flexWrap: "wrap",
  color: COLORS.ink,
  fontWeight: 700
};

export const activityActionStyle: CSSProperties = {
  color: COLORS.activityAccent,
  fontSize: 13,
  fontWeight: 800,
  letterSpacing: "0.04em",
  textTransform: "uppercase"
};

export const activityPreviewListStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6
};

export const activityPreviewItemStyle: CSSProperties = {
  padding: "5px 9px",
  borderRadius: 999,
  background: COLORS.panelAlt,
  color: COLORS.inkSoft,
  fontSize: 12,
  fontWeight: 700
};

export const activityPreviewMoreStyle: CSSProperties = {
  color: COLORS.inkMuted,
  fontSize: 18,
  lineHeight: 1,
  alignSelf: "center"
};

export const detailGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))",
  gap: 12
};

export const detailBlockStyle: CSSProperties = {
  padding: "14px 14px 12px",
  borderRadius: 18,
  background: COLORS.panelAlt,
  border: `1px solid ${COLORS.borderSoft}`,
  display: "grid",
  gap: 6
};

export const detailLabelStyle: CSSProperties = {
  color: COLORS.inkMuted,
  fontSize: 13,
  fontWeight: 700
};

export const detailValueStyle: CSSProperties = {
  color: COLORS.ink,
  lineHeight: 1.35
};

export const paymentRowStyle: CSSProperties = {
  padding: "14px 14px 12px",
  borderRadius: 16,
  border: `1px solid ${COLORS.border}`,
  background: COLORS.panel,
  display: "grid",
  gap: 6
};

export const expenseSummaryButtonStyle: CSSProperties = {
  width: "100%",
  textAlign: "left"
};

export const movementListStyle: CSSProperties = {
  display: "grid",
  gap: 12
};

export const movementItemStyle: CSSProperties = {
  padding: "14px 14px 12px",
  borderRadius: 18,
  border: `1px solid ${COLORS.border}`,
  background: COLORS.panelAlt,
  display: "grid",
  gap: 12
};

export const movementSummaryStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  flexWrap: "wrap"
};

export const movementDetailButtonStyle: CSSProperties = {
  minHeight: 38,
  padding: "0 14px",
  borderRadius: 999,
  border: `1px solid ${COLORS.border}`,
  background: COLORS.panel,
  color: COLORS.ink,
  fontWeight: 800,
  cursor: "pointer"
};

export const summaryControlRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  paddingTop: 6
};

export const summaryControlButtonStyle: CSSProperties = {
  minHeight: 42,
  padding: "0 18px",
  borderRadius: 999,
  border: `1px solid ${COLORS.border}`,
  background: COLORS.panelAlt,
  color: COLORS.ink,
  fontWeight: 800,
  cursor: "pointer"
};

export const accountListStyle: CSSProperties = {
  display: "grid",
  gap: 10
};

export const accountRowStyle: CSSProperties = {
  padding: "14px 14px 12px",
  borderRadius: 16,
  border: `1px solid ${COLORS.border}`,
  background: COLORS.panel,
  display: "grid",
  gap: 4
};

export const emptyTextStyle: CSSProperties = {
  margin: 0,
  color: COLORS.inkMuted,
  lineHeight: 1.6
};
