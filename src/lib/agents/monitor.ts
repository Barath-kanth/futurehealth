import type { IndependentVariables } from "../types";
import type { AgentFinding, SetupConfig } from "./types";

/** Monitor agent — compares consented live streams to institution thresholds. */
export function runMonitorAgent(
  iv: IndependentVariables,
  config: SetupConfig,
): { findings: AgentFinding[]; thresholdsChecked: number } {
  const findings: AgentFinding[] = [];
  let thresholdsChecked = 0;

  thresholdsChecked++;
  if (iv.heatIndexC >= config.heatAlertC || iv.outdoorHeatHours >= 3) {
    findings.push({
      id: `mon-heat-${Date.now()}`,
      agent: "monitor",
      title: "Heat threshold crossed",
      titleAr: "تجاوز عتبة الحرارة",
      summary: `Heat index ${iv.heatIndexC}°C / outdoor ${iv.outdoorHeatHours}h vs alert ${config.heatAlertC}°C.`,
      summaryAr: `مؤشر الحرارة ${iv.heatIndexC}°م / خارج ${iv.outdoorHeatHours}س مقابل تنبيه ${config.heatAlertC}°م.`,
      severity: iv.heatIndexC >= 42 ? "elevated" : "watch",
      evidence: [
        `heatIndexC=${iv.heatIndexC}`,
        `outdoorHeatHours=${iv.outdoorHeatHours}`,
        `threshold=${config.heatAlertC}`,
      ],
      sources: [{ label: "Wearable / env stream", kind: "stream" }],
      relatedProducts: ["Self-care cooling", "Reminders"],
      at: new Date().toISOString(),
      simulated: false,
    });
  }

  thresholdsChecked++;
  if (iv.aqi >= config.aqiAlert) {
    findings.push({
      id: `mon-aqi-${Date.now()}`,
      agent: "monitor",
      title: "Air-quality threshold crossed",
      titleAr: "تجاوز عتبة جودة الهواء",
      summary: `AQI ${iv.aqi} vs alert ${config.aqiAlert}.`,
      summaryAr: `مؤشر الهواء ${iv.aqi} مقابل تنبيه ${config.aqiAlert}.`,
      severity: iv.aqi >= 150 ? "elevated" : "watch",
      evidence: [`aqi=${iv.aqi}`, `threshold=${config.aqiAlert}`],
      sources: [{ label: "Abu Dhabi env feed", kind: "stream" }],
      relatedProducts: ["Exposure windows"],
      at: new Date().toISOString(),
      simulated: false,
    });
  }

  thresholdsChecked++;
  if (iv.sleepHours > 0 && iv.sleepHours < config.sleepFloorHours) {
    findings.push({
      id: `mon-sleep-${Date.now()}`,
      agent: "monitor",
      title: "Sleep floor breached",
      titleAr: "انخفاض دون حد النوم",
      summary: `Sleep ${iv.sleepHours}h < floor ${config.sleepFloorHours}h.`,
      summaryAr: `النوم ${iv.sleepHours}س < الحد ${config.sleepFloorHours}س.`,
      severity: "watch",
      evidence: [`sleepHours=${iv.sleepHours}`, `floor=${config.sleepFloorHours}`],
      sources: [{ label: "Watch stream", kind: "stream" }],
      relatedProducts: ["Recovery actions"],
      at: new Date().toISOString(),
      simulated: false,
    });
  }

  thresholdsChecked++;
  if (iv.sdfPct !== undefined && iv.sdfPct >= 25) {
    findings.push({
      id: `mon-sdf-${Date.now()}`,
      agent: "monitor",
      title: "SDF screening cue on file",
      titleAr: "إشارة SDF في الملف",
      summary: `SDF ${iv.sdfPct}% on consented device file — Monitor flags for Investigate (not a diagnosis).`,
      summaryAr: `SDF ${iv.sdfPct}% في ملف الجهاز بموافقة — مراقب للتحقيق (ليس تشخيصًا).`,
      severity: "elevated",
      evidence: [`sdfPct=${iv.sdfPct}`],
      sources: [{ label: "Home kit stream (sim)", kind: "stream" }],
      relatedProducts: ["Andrology pathway"],
      at: new Date().toISOString(),
      simulated: true,
    });
  }

  if (!findings.length) {
    findings.push({
      id: `mon-clear-${Date.now()}`,
      agent: "monitor",
      title: "No threshold breaches",
      titleAr: "لا تجاوزات للعتبات",
      summary: "Monitored streams within configured pilot thresholds.",
      summaryAr: "التيارات ضمن عتبات الطيار المضبوطة.",
      severity: "info",
      evidence: [`checked=${thresholdsChecked}`],
      sources: [{ label: "Monitor rules", kind: "rule" }],
      relatedProducts: ["Silent monitoring"],
      at: new Date().toISOString(),
      simulated: false,
    });
  }

  return { findings, thresholdsChecked };
}
