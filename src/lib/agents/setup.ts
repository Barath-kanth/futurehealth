import type { AgentFinding, SetupConfig } from "./types";

export const DEFAULT_SETUP: SetupConfig = {
  institutionName: "SeedShield Abu Dhabi Pilot",
  heatAlertC: 38,
  aqiAlert: 100,
  sleepFloorHours: 6,
  socialPressureAlert: 60,
  researchTopics: [
    "male reproductive health heat exposure WHO",
    "sperm DNA fragmentation clinical guidance",
    "Abu Dhabi air quality male health",
    "AUA male infertility evaluation update",
  ],
  googleSearchEnabled: true,
  schedulerCron: "0 */6 * * *",
  bigQueryDataset: "seedshield_events",
  cloudRunService: "seedshield-agents",
  firestoreCollection: "seedshield",
  memberId: "member-demo",
};

/** Setup agent — institution thresholds, topics, scheduler wiring. */
export function runSetupAgent(overrides?: Partial<SetupConfig>): {
  config: SetupConfig;
  findings: AgentFinding[];
} {
  const config = { ...DEFAULT_SETUP, ...overrides };
  const findings: AgentFinding[] = [
    {
      id: `setup-${Date.now()}`,
      agent: "setup",
      title: "Pilot configuration loaded",
      titleAr: "تم تحميل إعدادات الطيار",
      summary: `Thresholds: heat≥${config.heatAlertC}°C, AQI≥${config.aqiAlert}, sleep<${config.sleepFloorHours}h. Scheduler: ${config.schedulerCron}. Search topics: ${config.researchTopics.length}.`,
      summaryAr: `العتبات: حرارة≥${config.heatAlertC}°م، هواء≥${config.aqiAlert}، نوم<${config.sleepFloorHours}س. الجدولة: ${config.schedulerCron}.`,
      severity: "info",
      evidence: [
        `institution=${config.institutionName}`,
        `googleSearch=${config.googleSearchEnabled}`,
        `bq=${config.bigQueryDataset}`,
        `run=${config.cloudRunService}`,
      ],
      sources: [{ label: "Setup config", kind: "config" }],
      relatedProducts: ["Safe Triage", "Vault consents", "Gemini Agent"],
      at: new Date().toISOString(),
      simulated: true,
    },
  ];
  return { config, findings };
}
