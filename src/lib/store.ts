"use client";

import { create } from "zustand";
import { evaluateRisk, mergeVariables } from "./risk-engine";
import { DEFAULT_COORDS as DEFAULT_ENV_COORDS } from "./env-live";
import { getPersona } from "./personas";
import { ME, ASSIGNED_DOCTOR, PAIRABLE_DEVICES } from "./me-profile";
import { getScenario } from "./scenarios";
import {
  autoIngestTick,
  buildStreamStatuses,
  runMonthlyBodyCheck,
} from "./auto-ingest";
import { buildPersonalFindings } from "./personal-findings";
import {
  bandForIndex,
  shouldAlertDoctor,
  shouldAlertPatient,
  type MviBandKey,
} from "./index-bands";
import {
  buildActions,
  buildIndexSeries,
  computeVitalityIndex,
  doctorReply,
  getJob,
  inferJobType,
  scoreBodyRegions,
  type ActionItem,
  type BodyRegion,
  type IndexPoint,
  type JobTypeId,
} from "./vitality-analyst";
import { buildScenarioNotifications } from "./scenario-notifications";
import type {
  ConsentCategory,
  DataStreamStatus,
  IndependentVariables,
  Locale,
  PersonalFinding,
  RiskAssessment,
} from "./types";

export type ChatMessage = {
  id: string;
  role: "user" | "doctor" | "system";
  text: string;
  at: string;
};

export type AppNotification = {
  id: string;
  title: string;
  titleAr: string;
  body: string;
  bodyAr: string;
  doNow?: string;
  doNowAr?: string;
  scenario?: string;
  scenarioAr?: string;
  level: "info" | "watch" | "urgent";
  time: string;
  read: boolean;
  done?: boolean;
  href?: string;
  actionId?: string;
  category?: string;
  audience?: "patient" | "doctor" | "both";
};

export type DoctorAlert = {
  id: string;
  at: string;
  index: number;
  band: MviBandKey;
  summary: string;
  summaryAr: string;
  acknowledged: boolean;
};

interface SeedShieldState {
  locale: Locale;
  ageVerified: boolean;
  birthYear: number | null;
  personaId: string;
  scenarioId: string;
  jobTypeId: JobTypeId;
  variables: IndependentVariables;
  consents: Record<ConsentCategory, boolean>;
  assessment: RiskAssessment;
  explanation: string | null;
  explanationProvider: string | null;
  vitalityIndex: number;
  previousIndex: number;
  indexBand: MviBandKey;
  indexSeries: IndexPoint[];
  bodyRegions: BodyRegion[];
  actions: ActionItem[];
  notifications: AppNotification[];
  doctorAlerts: DoctorAlert[];
  doctorAlertOptIn: boolean;
  culturalTone: "stewardship" | "direct" | "clinical";
  interactionMode: "full" | "text" | "audio";
  pairedDeviceIds: string[];
  chat: ChatMessage[];
  streams: DataStreamStatus[];
  findings: PersonalFinding[];
  autoMode: boolean;
  watchLive: boolean;
  showWhatIf: boolean;
  assignedDoctor: typeof ASSIGNED_DOCTOR;
  setLocale: (locale: Locale) => void;
  setDoctorAlertOptIn: (on: boolean) => void;
  setCulturalTone: (tone: "stewardship" | "direct" | "clinical") => void;
  setInteractionMode: (mode: "full" | "text" | "audio") => void;
  resetDemoData: () => void;
  verifyAge: (birthYear: number) => { ok: boolean; message: string };
  setScenario: (id: string) => void;
  setJobType: (id: JobTypeId) => void;
  /** Label-only sync from live streams (no manual pick, no patch overwrite). */
  syncJobTypeFromStreams: () => void;
  patchVariables: (patch: Partial<IndependentVariables>) => void;
  toggleConsent: (key: ConsentCategory) => void;
  toggleStream: (id: DataStreamStatus["id"]) => void;
  pairDevice: (deviceId: string) => void;
  unpairDevice: (deviceId: string) => void;
  recompute: () => void;
  setExplanation: (text: string, provider: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  markNotificationDone: (id: string) => void;
  refreshScenarioNotices: () => void;
  acknowledgeDoctorAlert: (id: string) => void;
  sendChat: (text: string) => void;
  completeAction: (id: string) => void;
  tickWatch: () => void;
  setWatchLive: (on: boolean) => void;
  setAutoMode: (on: boolean) => void;
  setShowWhatIf: (on: boolean) => void;
  runMonthlyCheck: () => void;
  simulateIndexDrop: () => void;
  /** Demo: sudden testicular pain → urgent triage. */
  simulateSuddenPain: () => void;
  /** Demo: sparse file → insufficient_info (asks for more data). */
  simulateThinData: () => void;
  /** Where the environment values came from (live API vs simulated feed). */
  envSource: "live" | "simulated" | null;
  /** Pull live heat + AQI for a coarse location. Requires environment consent. */
  refreshLiveEnvironment: (coords?: { lat: number; lon: number }) => Promise<void>;
}

function withIndexAlerts(
  previousIndex: number,
  derived: ReturnType<typeof deriveCore>,
  existingDoctor: DoctorAlert[],
  existingNotes: AppNotification[],
  doctorAlertOptIn: boolean,
) {
  const index = derived.vitalityIndex;
  const band = bandForIndex(index);
  const notes: AppNotification[] = [...derived.notifications];
  let doctorAlerts = existingDoctor;

  if (shouldAlertPatient(index, previousIndex) && index < previousIndex - 0.5) {
    notes.unshift({
      id: `patient-idx-${Date.now()}`,
      title: "Your vitality index moved",
      titleAr: "مؤشر حيويتك تحرك",
      body: `Now ${index} (${band}). Bands are illustrative — open Safe Triage for the next step.`,
      bodyAr: `الآن ${index} (${band}). النطاقات توضيحية — افتح الفرز الآمن للخطوة التالية.`,
      level: index < 60 ? "urgent" : "watch",
      time: "Just now",
      read: false,
      audience: "patient",
    });
  }

  if (shouldAlertDoctor(index, previousIndex, doctorAlertOptIn)) {
    const alert: DoctorAlert = {
      id: `doc-${Date.now()}`,
      at: new Date().toISOString(),
      index,
      band,
      summary: `Patient opted in · MVI ${index} (${band}). Simulated clinician notified.`,
      summaryAr: `المريض وافق · المؤشر ${index} (${band}). أُشعر الطبيب المحاكى.`,
      acknowledged: false,
    };
    doctorAlerts = [alert, ...existingDoctor].slice(0, 12);
    notes.unshift({
      id: `both-idx-${Date.now()}`,
      title: "Opt-in alert · you + simulated clinician",
      titleAr: "تنبيه بموافقة · أنت + طبيب محاكى",
      body: `${ASSIGNED_DOCTOR.name} (simulated) notified · you approved sharing this moment.`,
      bodyAr: `تم إشعار ${ASSIGNED_DOCTOR.nameAr} (محاكاة) · وافقت على المشاركة في هذه اللحظة.`,
      level: "urgent",
      time: "Just now",
      read: false,
      audience: "both",
    });
  }

  return {
    ...derived,
    previousIndex: index,
    indexBand: band,
    doctorAlerts,
    notifications: notes.length ? notes : existingNotes,
  };
}

function deriveCore(
  personaId: string,
  variables: IndependentVariables,
  streams: DataStreamStatus[],
  consents?: Record<ConsentCategory, boolean>,
) {
  const persona = getPersona(personaId);
  const assessment = evaluateRisk(variables, consents);
  const snap = computeVitalityIndex(variables);
  const bodyRegions = scoreBodyRegions(variables);
  const actions = buildActions(variables, bodyRegions);
  const findings = buildPersonalFindings(persona, variables);
  // Cap reminders so the bell count stays honest and stable for judges.
  const scenarioNotes = buildScenarioNotifications(
    variables,
    snap.index,
    bodyRegions,
    actions.length,
  )
    .slice(0, 3)
    .map((n, i) => ({
      id: n.id,
      title: n.title,
      titleAr: n.titleAr,
      body: n.body,
      bodyAr: n.bodyAr,
      doNow: n.doNow,
      doNowAr: n.doNowAr,
      scenario: n.scenario,
      scenarioAr: n.scenarioAr,
      level: n.level,
      time: n.time,
      href: n.href,
      actionId: n.actionId,
      category: n.category,
      read: i > 0,
      done: false as const,
      audience: "patient" as const,
    }));
  return {
    assessment,
    vitalityIndex: snap.index,
    indexSeries: buildIndexSeries(variables),
    bodyRegions,
    actions,
    findings,
    notifications: scenarioNotes,
    streams,
  };
}

function bootState() {
  const streams = buildStreamStatuses(ME);
  const core = deriveCore(ME.id, ME.variables, streams, ME.consents);
  return {
    personaId: ME.id,
    variables: { ...ME.variables },
    consents: { ...ME.consents },
    jobTypeId: "desk_knowledge" as JobTypeId,
    previousIndex: core.vitalityIndex,
    indexBand: bandForIndex(core.vitalityIndex),
    doctorAlerts: [] as DoctorAlert[],
    doctorAlertOptIn: false,
    culturalTone: "stewardship" as const,
    interactionMode: "full" as const,
    pairedDeviceIds: ["watch", "phone", "pc", "env", "scale"],
    ...core,
  };
}

const boot = bootState();

export const useSeedShield = create<SeedShieldState>((set, get) => ({
  locale: "en",
  ageVerified: false,
  birthYear: null,
  scenarioId: "baseline",
  explanation: null,
  explanationProvider: null,
  envSource: null,
  autoMode: true,
  watchLive: true,
  showWhatIf: false,
  assignedDoctor: ASSIGNED_DOCTOR,
  chat: [
    {
      id: "welcome",
      role: "doctor",
      text: `Hi — I’m a SIMULATED clinician (${ASSIGNED_DOCTOR.name}) for this demo. I only receive index alerts if you opt in under Vault. Screening ≠ diagnosis. Open Safe Triage for your pathway.`,
      at: "session-start",
    },
  ],
  ...boot,

  setLocale: (locale) => set({ locale }),

  setDoctorAlertOptIn: (on) => set({ doctorAlertOptIn: on }),

  setCulturalTone: (tone) => set({ culturalTone: tone }),

  setInteractionMode: (mode) => set({ interactionMode: mode }),

  resetDemoData: () => {
    const fresh = bootState();
    set({
      ...fresh,
      locale: get().locale,
      ageVerified: get().ageVerified,
      birthYear: get().birthYear,
      doctorAlertOptIn: false,
      culturalTone: "stewardship",
      interactionMode: "full",
      explanation: null,
      explanationProvider: null,
      scenarioId: "baseline",
      autoMode: true,
      watchLive: true,
      showWhatIf: false,
      doctorAlerts: [],
      notifications: (fresh.notifications ?? []).map((n) => ({
        ...n,
        read: true,
        done: false,
      })),
      chat: [
        {
          id: "welcome",
          role: "doctor",
          text: `Hi — I’m a SIMULATED clinician (${ASSIGNED_DOCTOR.name}) for this demo. I only receive index alerts if you opt in under Vault. Screening ≠ diagnosis. Open Safe Triage for your pathway.`,
          at: "session-start",
        },
      ],
    });
  },

  verifyAge: (birthYear) => {
    const age = new Date().getFullYear() - birthYear;
    if (age < 18) {
      return {
        ok: false,
        message: "SeedShield is for adults 18+.",
      };
    }
    set({ ageVerified: true, birthYear });
    return { ok: true, message: "Welcome — demo persona Omar (34) is ready." };
  },

  setScenario: (id) => {
    const scenario = getScenario(id);
    const prev = get().vitalityIndex;
    const merged = mergeVariables(get().variables, scenario.patch);
    const core = deriveCore(get().personaId, merged, get().streams, get().consents);
    set({
      scenarioId: id,
      variables: merged,
      explanation: null,
      ...withIndexAlerts(prev, core, get().doctorAlerts, get().notifications, get().doctorAlertOptIn),
    });
  },

  setJobType: (id) => {
    const job = getJob(id);
    const prev = get().vitalityIndex;
    const merged = mergeVariables(get().variables, job.patch);
    const core = deriveCore(get().personaId, merged, get().streams, get().consents);
    const next = withIndexAlerts(prev, core, get().doctorAlerts, get().notifications, get().doctorAlertOptIn);
    set({
      jobTypeId: id,
      variables: merged,
      explanation: null,
      ...next,
      notifications: [
        {
          id: `job-${id}-${Date.now()}`,
          title: "Work calendar updated",
          titleAr: "تحديث تقويم العمل",
          body: job.heavyImpactNote,
          bodyAr: job.heavyImpactNoteAr,
          level: "watch",
          time: "Just now",
          read: false,
          audience: "patient",
        },
        ...next.notifications,
      ],
    });
  },

  syncJobTypeFromStreams: () => {
    const id = inferJobType(get().variables);
    if (id === get().jobTypeId) return;
    const job = getJob(id);
    const notice: AppNotification = {
      id: `job-auto-${id}-${Date.now()}`,
      title: "Work pattern detected",
      titleAr: "تم اكتشاف نمط العمل",
      body: job.heavyImpactNote,
      bodyAr: job.heavyImpactNoteAr,
      level: "watch",
      time: "Just now",
      read: false,
      audience: "patient",
    };
    set({
      jobTypeId: id,
      notifications: [notice, ...get().notifications].slice(0, 40),
    });
  },

  patchVariables: (patch) => {
    const prev = get().vitalityIndex;
    const merged = mergeVariables(get().variables, patch);
    const core = deriveCore(get().personaId, merged, get().streams, get().consents);
    set({
      variables: merged,
      explanation: null,
      ...withIndexAlerts(prev, core, get().doctorAlerts, get().notifications, get().doctorAlertOptIn),
    });
  },

  toggleConsent: (key) => {
    const consents = { ...get().consents, [key]: !get().consents[key] };
    const prev = get().vitalityIndex;
    const core = deriveCore(
      get().personaId,
      get().variables,
      get().streams,
      consents,
    );
    set({
      consents,
      explanation: null,
      ...withIndexAlerts(
        prev,
        core,
        get().doctorAlerts,
        get().notifications,
        get().doctorAlertOptIn,
      ),
    });
  },

  toggleStream: (id) => {
    const streams = get().streams.map((s) =>
      s.id === id
        ? {
            ...s,
            connected: !s.connected,
            freshness: (!s.connected ? "live" : "stale") as DataStreamStatus["freshness"],
            lastSync: !s.connected ? new Date().toISOString() : "—",
          }
        : s,
    );
    const core = deriveCore(get().personaId, get().variables, streams, get().consents);
    set({ ...core, streams, indexBand: bandForIndex(core.vitalityIndex) });
  },

  pairDevice: (deviceId) => {
    const device = PAIRABLE_DEVICES.find((d) => d.id === deviceId);
    if (!device) return;
    const pairedDeviceIds = Array.from(new Set([...get().pairedDeviceIds, deviceId]));
    let streams = get().streams;
    let variables = get().variables;
    const consents = { ...get().consents };

    if (device.streamId) {
      streams = streams.map((s) =>
        s.id === device.streamId
          ? {
              ...s,
              connected: true,
              freshness: "live" as const,
              lastSync: new Date().toISOString(),
            }
          : s,
      );
    }

    if (device.kind === "home_semen") {
      consents.at_home_device = true;
      variables = mergeVariables(variables, {
        semenConcentration: 18,
        motilityPct: 41,
        morphologyPct: 4.2,
        sdfPct: 22,
      });
    }
    if (device.kind === "home_hormone") {
      consents.clinical_lab = true;
      variables = mergeVariables(variables, {
        testosteroneNgDl: 420,
        freeTestosteronePgMl: 78,
        vitaminDNgMl: 32,
        tshMiuL: 1.6,
        glucoseMgDl: 92,
      });
    }
    if (device.kind === "alcohol_tac") {
      variables = mergeVariables(variables, {
        tacMgDl: 0.02,
        alcoholUnitsWeek: Math.max(variables.alcoholUnitsWeek, 6),
      });
    }
    if (device.kind === "alcohol_breath") {
      variables = mergeVariables(variables, {
        breathBacPct: 0.03,
        alcoholUnitsWeek: Math.max(variables.alcoholUnitsWeek, 5),
      });
    }
    if (device.kind === "alcohol_ai") {
      variables = mergeVariables(variables, {
        voiceImpairmentScore: 28,
        motorImpairmentScore: 22,
      });
    }
    if (device.kind === "smoke_co") {
      variables = mergeVariables(variables, {
        breathCoPpm: 8,
        smokingLoad: Math.max(variables.smokingLoad, 40),
      });
    }
    if (device.kind === "smoke_gesture") {
      variables = mergeVariables(variables, {
        smokeGestureEventsDay: 6,
        smokingLoad: Math.max(variables.smokingLoad, 35),
      });
    }
    if (device.kind === "lung") {
      variables = mergeVariables(variables, {
        spirometryFev1Pct: 88,
        spo2Pct: 97,
        coughRiskScore: 18,
        chestMotionRate: 14,
      });
    }
    if (device.kind === "meds") {
      consents.clinical_lab = true;
    }

    const prev = get().vitalityIndex;
    const core = deriveCore(get().personaId, variables, streams, get().consents);
    const next = withIndexAlerts(prev, core, get().doctorAlerts, get().notifications, get().doctorAlertOptIn);
    set({
      pairedDeviceIds,
      variables,
      consents,
      streams,
      vitalityIndex: next.vitalityIndex,
      previousIndex: next.previousIndex,
      indexBand: next.indexBand,
      indexSeries: next.indexSeries,
      bodyRegions: next.bodyRegions,
      actions: next.actions,
      findings: next.findings,
      assessment: next.assessment,
      doctorAlerts: next.doctorAlerts,
      notifications: [
        {
          id: `pair-${deviceId}-${Date.now()}`,
          title: `${device.name} attached`,
          titleAr: `تم ربط ${device.nameAr}`,
          body: device.creativeHook,
          bodyAr: device.creativeHookAr,
          level: "info",
          time: "Just now",
          read: false,
          audience: "patient",
        },
        ...next.notifications,
      ],
      chat: [
        ...get().chat,
        {
          id: `sys-pair-${Date.now()}`,
          role: "system",
          text: `Device paired: ${device.name}. Reliability ${device.reliability}. ${device.how}`,
          at: new Date().toISOString(),
        },
      ],
    });
  },

  unpairDevice: (deviceId) => {
    const device = PAIRABLE_DEVICES.find((d) => d.id === deviceId);
    const pairedDeviceIds = get().pairedDeviceIds.filter((id) => id !== deviceId);
    let streams = get().streams;
    if (device?.streamId) {
      streams = streams.map((s) =>
        s.id === device.streamId
          ? { ...s, connected: false, freshness: "stale" as const, lastSync: "—" }
          : s,
      );
    }
    const core = deriveCore(get().personaId, get().variables, streams, get().consents);
    set({
      pairedDeviceIds,
      streams,
      assessment: core.assessment,
      vitalityIndex: core.vitalityIndex,
      indexSeries: core.indexSeries,
      bodyRegions: core.bodyRegions,
      actions: core.actions,
      findings: core.findings,
      notifications: core.notifications,
      indexBand: bandForIndex(core.vitalityIndex),
    });
  },

  recompute: () => {
    const core = deriveCore(get().personaId, get().variables, get().streams, get().consents);
    set({ ...core, indexBand: bandForIndex(core.vitalityIndex) });
  },

  setExplanation: (text, provider) =>
    set({ explanation: text, explanationProvider: provider }),

  markNotificationRead: (id) =>
    set({
      notifications: get().notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    }),

  markAllNotificationsRead: () =>
    set({
      notifications: get().notifications.map((n) => ({ ...n, read: true })),
    }),

  markNotificationDone: (id) => {
    const n = get().notifications.find((x) => x.id === id);
    set({
      notifications: get().notifications.map((x) =>
        x.id === id ? { ...x, done: true, read: true } : x,
      ),
      actions: n?.actionId
        ? get().actions.filter((a) => a.id !== n.actionId)
        : get().actions,
    });
  },

  refreshScenarioNotices: () => {
    const doneIds = new Set(
      get()
        .notifications.filter((n) => n.done)
        .map((n) => n.id),
    );
    const core = deriveCore(get().personaId, get().variables, get().streams, get().consents);
    set({
      ...core,
      indexBand: bandForIndex(core.vitalityIndex),
      notifications: core.notifications.map((n) =>
        doneIds.has(n.id) ? { ...n, done: true, read: true } : n,
      ),
    });
  },

  acknowledgeDoctorAlert: (id) =>
    set({
      doctorAlerts: get().doctorAlerts.map((a) =>
        a.id === id ? { ...a, acknowledged: true } : a,
      ),
    }),

  sendChat: (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const { variables, vitalityIndex, locale, chat } = get();
    set({
      chat: [
        ...chat,
        {
          id: `u-${Date.now()}`,
          role: "user",
          text: trimmed,
          at: new Date().toISOString(),
        },
        {
          id: `d-${Date.now() + 1}`,
          role: "doctor",
          text: doctorReply(trimmed, variables, vitalityIndex, locale),
          at: new Date().toISOString(),
        },
      ],
    });
  },

  completeAction: (id) =>
    set({
      actions: get().actions.filter((a) => a.id !== id),
      notifications: [
        {
          id: `done-${id}`,
          title: "Action completed",
          titleAr: "اكتمل الإجراء",
          body: "Your personal plan updated.",
          bodyAr: "تحدّثت خطتك الشخصية.",
          level: "info",
          time: "Just now",
          read: false,
          audience: "patient",
        },
        ...get().notifications,
      ],
    }),

  setWatchLive: (on) => set({ watchLive: on }),
  setAutoMode: (on) => set({ autoMode: on }),
  setShowWhatIf: (on) => set({ showWhatIf: on }),

  tickWatch: () => {
    if (!get().watchLive || !get().autoMode) return;
    const patch = autoIngestTick(get().variables, get().streams);
    if (Object.keys(patch).length === 0) return;
    const prev = get().vitalityIndex;
    const merged = mergeVariables(get().variables, patch);
    const inferredJob = inferJobType(merged);
    const core = deriveCore(get().personaId, merged, get().streams, get().consents);
    const next = withIndexAlerts(prev, core, get().doctorAlerts, get().notifications, get().doctorAlertOptIn);
    const doneIds = new Set(
      get()
        .notifications.filter((n) => n.done)
        .map((n) => n.id),
    );
    const doctorExtra =
      next.doctorAlerts.length > get().doctorAlerts.length
        ? next.notifications.filter((n) => n.audience === "both")
        : [];
    set({
      variables: merged,
      jobTypeId: inferredJob,
      vitalityIndex: next.vitalityIndex,
      previousIndex: next.previousIndex,
      indexBand: next.indexBand,
      indexSeries: next.indexSeries,
      bodyRegions: next.bodyRegions,
      actions: next.actions,
      findings: next.findings,
      assessment: next.assessment,
      doctorAlerts: next.doctorAlerts,
      notifications: [
        ...doctorExtra,
        ...next.notifications
          .filter((n) => n.audience !== "both")
          .map((n) =>
            doneIds.has(n.id) ? { ...n, done: true, read: true } : n,
          ),
      ],
    });
  },

  runMonthlyCheck: () => {
    const prev = get().vitalityIndex;
    const patch = runMonthlyBodyCheck(get().variables);
    const merged = mergeVariables(get().variables, patch);
    const core = deriveCore(get().personaId, merged, get().streams, get().consents);
    const next = withIndexAlerts(prev, core, get().doctorAlerts, get().notifications, get().doctorAlertOptIn);
    set({
      variables: merged,
      ...next,
      notifications: [
        {
          id: `bmi-${Date.now()}`,
          title: "Monthly body check synced",
          titleAr: "تزامن الفحص الشهري",
          body: `BMI ${patch.bmi}, waist ${patch.waistCm} cm.`,
          bodyAr: `BMI ${patch.bmi}، خصر ${patch.waistCm} سم.`,
          level: "info",
          time: "Just now",
          read: false,
          audience: "patient",
        },
        ...next.notifications,
      ],
    });
  },

  simulateIndexDrop: () => {
    get().patchVariables({
      sleepHours: 4.2,
      occupationalStress: 92,
      moneyStress: 88,
      heatIndexC: 45,
      outdoorHeatHours: 5,
      hrvTrend: -18,
      sleepApneaRisk: 75,
      hydrationLiters: 1.2,
    });
  },

  simulateSuddenPain: () => {
    // Pain flag is stripped unless self_report consent is on.
    const consents = { ...get().consents, self_report: true };
    const prev = get().vitalityIndex;
    const merged = mergeVariables(get().variables, {
      acuteTesticularPainFlag: true,
    });
    const core = deriveCore(get().personaId, merged, get().streams, consents);
    set({
      consents,
      variables: merged,
      explanation: null,
      ...withIndexAlerts(
        prev,
        core,
        get().doctorAlerts,
        get().notifications,
        get().doctorAlertOptIn,
      ),
    });
  },

  simulateThinData: () => {
    // Match triage-safety "thin-data" case: sparse anchors, no specialty cues.
    get().patchVariables({
      acuteTesticularPainFlag: false,
      sleepHours: 0,
      sleepRegularity: 0,
      bmi: undefined,
      waistCm: undefined,
      weightKg: undefined,
      visceralFatScore: undefined,
      iief5Score: undefined,
      amsScore: undefined,
      ipssScore: undefined,
      semenConcentration: undefined,
      motilityPct: undefined,
      morphologyPct: undefined,
      sdfPct: undefined,
      testosteroneNgDl: undefined,
      freeTestosteronePgMl: undefined,
      glucoseMgDl: undefined,
      stiRiskFlag: undefined,
      varicoceleFlag: undefined,
      geneticRiskFlag: undefined,
      subclinicalInflammationFlag: undefined,
      infectiousHistoryFlag: undefined,
      orchitisMumpsFlag: undefined,
      cryptorchidismFlag: undefined,
      testicularTraumaFlag: undefined,
      exogenousAndrogenFlag: undefined,
      medsFertilityImpact: undefined,
      occupationalStress: 20,
      shiftWork: false,
      aqi: 40,
      heatIndexC: 25,
      outdoorHeatHours: 0.5,
      smokingLoad: 0,
      alcoholUnitsWeek: 0,
      ultraProcessedScore: 20,
      sedentaryHours: 4,
      screenHours: 3,
      hrvTrend: 0,
      bodyTempAnomaly: 0,
      sleepApneaRisk: 0,
      hydrationLiters: 2,
      caffeineMg: 50,
      moneyStress: 20,
      businessStress: 15,
    });
  },

  refreshLiveEnvironment: async (coords) => {
    if (!get().consents.environment) {
      set({ envSource: "simulated" });
      return;
    }
    const target = coords ?? DEFAULT_ENV_COORDS;
    try {
      const res = await fetch(
        `/api/env?lat=${target.lat}&lon=${target.lon}`,
        { cache: "no-store" },
      );
      const data = (await res.json()) as {
        source: "live" | "simulated";
        heatIndexC?: number;
        aqi?: number;
        humidityPct?: number;
      };
      if (data.source === "live" && data.heatIndexC !== undefined) {
        get().patchVariables({
          heatIndexC: data.heatIndexC,
          aqi: data.aqi ?? get().variables.aqi,
          humidityPct: data.humidityPct ?? get().variables.humidityPct,
        });
        set({ envSource: "live" });
      } else {
        set({ envSource: "simulated" });
      }
    } catch {
      set({ envSource: "simulated" });
    }
  },
}));
