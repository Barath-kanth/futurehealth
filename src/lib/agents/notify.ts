import type { AgentAlert, AgentFinding } from "./types";

/**
 * Notify agent — delivers Investigate alerts to patient / simulated doctor channels.
 */
export function runNotifyAgent(
  alerts: AgentAlert[],
  locale: "en" | "ar" = "en",
): { findings: AgentFinding[]; alertsDelivered: number; delivered: AgentAlert[] } {
  const delivered = alerts.map((a) => ({
    ...a,
    channels: a.channels.length
      ? a.channels
      : (["in_app", "email_sim"] as AgentAlert["channels"]),
  }));

  const findings: AgentFinding[] = delivered.map((a) => ({
    id: `notify-${a.id}`,
    agent: "notify",
    title:
      locale === "ar"
        ? `تنبيه إلى ${a.audience === "doctor" ? "الطبيب" : a.audience === "both" ? "أنت والطبيب" : "أنت"}`
        : `Alert to ${a.audience === "doctor" ? "doctor" : a.audience === "both" ? "you + doctor" : "you"}`,
    titleAr: `تنبيه · ${a.audience}`,
    summary: `${a.title} · channels: ${a.channels.join(", ")}`,
    summaryAr: `${a.titleAr} · القنوات: ${a.channels.join(", ")}`,
    severity: a.severity === "urgent" ? "urgent" : a.severity === "elevated" ? "elevated" : "watch",
    evidence: a.evidenceIds,
    sources: [{ label: "Notify pipeline", kind: "rule" }],
    relatedProducts: ["Doctor", "Next step"],
    at: new Date().toISOString(),
    simulated: a.channels.includes("email_sim") || a.channels.includes("sms_sim"),
  }));

  if (!delivered.length) {
    findings.push({
      id: `notify-quiet-${Date.now()}`,
      agent: "notify",
      title: "No alerts to send",
      titleAr: "لا تنبيهات للإرسال",
      summary: "Quiet cycle — nothing pushed to patient or doctor.",
      summaryAr: "دورة هادئة — لا شيء أُرسل للمريض أو الطبيب.",
      severity: "info",
      evidence: [],
      sources: [{ label: "Notify", kind: "rule" }],
      relatedProducts: ["Quiet watch"],
      at: new Date().toISOString(),
      simulated: false,
    });
  }

  return {
    findings,
    alertsDelivered: delivered.length,
    delivered,
  };
}
