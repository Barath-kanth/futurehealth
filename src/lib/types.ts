export type Locale = "en" | "ar";

export type ConsentCategory =
  | "wearable"
  | "at_home_device"
  | "clinical_lab"
  | "environment"
  | "self_report"
  | "family_mode";

export type SignalSource =
  | "wearable"
  | "at_home_device"
  | "clinical_lab"
  | "environment"
  | "work_context"
  | "nutrition"
  | "social_context"
  | "self_report"
  | "pc_usage"
  | "phone_media"
  | "finance_context"
  | "pharmacy_meds"
  | "monthly_body_check"
  | "alcohol_sensor"
  | "smoke_sensor"
  | "lung_sensor"
  | "voice_ai";

export type DataStreamId =
  | "apple_watch"
  | "phone_sensors"
  | "work_pc"
  | "abu_dhabi_env"
  | "nutrition_log"
  | "monthly_bmi"
  | "pharmacy_meds"
  | "home_device"
  | "clinical_vault"
  | "life_context"
  | "alcohol_tac"
  | "alcohol_breath"
  | "alcohol_voice_ai"
  | "smoke_co"
  | "smoke_gesture"
  | "lung_spirometry";

export type Confidence = "high" | "medium" | "low";

export type TriageTier =
  | "insufficient_info"
  | "self_care"
  | "primary_care"
  | "andrology_urology"
  | "fertility_services"
  | "urgent";

export type SignalSeverity = "info" | "watch" | "elevated" | "urgent";

export interface IndependentVariables {
  /** Climate & environment (auto: location feed) */
  heatIndexC: number;
  humidityPct: number;
  aqi: number;
  uvIndex: number;
  outdoorHeatHours: number;
  noiseDbAvg: number;
  /** Work / PC (auto: calendar + PC activity) */
  shiftWork: boolean;
  sedentaryHours: number;
  occupationalStress: number; // 0-100
  nightShiftsPerWeek: number;
  screenHours: number;
  /** Food & lifestyle (auto: watch + nutrition log) */
  hydrationLiters: number;
  ultraProcessedScore: number; // 0-100
  caffeineMg: number;
  fastingWindow: boolean;
  plasticFoodContactScore: number; // EDC proxy 0-100
  /** Life context — often forgotten (auto/consented life signals) */
  socialPressureIndex: number;
  familyModeEnabled: boolean;
  moneyStress: number; // 0-100
  businessStress: number; // 0-100
  financialSecurity: number; // 0-100 higher = more secure
  educationLoad: number; // 0-100 study/pressure load
  peaceIndex: number; // 0-100 higher = calmer
  mediaIntensity: number; // video/content load 0-100
  /** Substance / lifestyle (consented life context + sensors) */
  smokingLoad: number; // 0-100 tobacco/vape
  alcoholUnitsWeek: number; // approx units / week
  recreationalDrugFlag: boolean;
  /** Feasible alcohol hardware / AI */
  tacMgDl?: number; // transdermal alcohol (e.g. BACtrack Skyn class)
  breathBacPct?: number; // breathalyzer BAC %
  voiceImpairmentScore?: number; // 0-100 voice/speech AI
  motorImpairmentScore?: number; // 0-100 typing/gait/drunk-UI
  /** Feasible smoke / lung hardware */
  breathCoPpm?: number; // e.g. iCOquit Smokerlyzer
  smokeGestureEventsDay?: number; // watch hand-to-mouth AI count
  spo2Pct?: number; // pulse oximeter
  spirometryFev1Pct?: number; // % predicted FEV1 (e.g. NuvoAir class)
  coughRiskScore?: number; // 0-100 mic AI cough/breath screen
  chestMotionRate?: number; // breaths/min from phone-on-chest
  /** Symptom questionnaires (optional validated scales) */
  iief5Score?: number; // 5-25
  amsScore?: number; // 17-85
  ipssScore?: number; // 0-35
  /** Extended labs */
  freeTestosteronePgMl?: number;
  vitaminDNgMl?: number;
  tshMiuL?: number;
  systolicBp?: number;
  diastolicBp?: number;
  /** Passive biometric trends (auto: watch) */
  sleepHours: number;
  sleepRegularity: number; // 0-100
  hrvTrend: number;
  restingHr: number;
  activityMinutes: number;
  bodyTempAnomaly: number;
  sleepApneaRisk: number; // 0-100 from snore/O2 watch proxies
  /** Body composition (auto: monthly check-in / scale) */
  weightKg?: number;
  waistCm?: number;
  bmi?: number;
  visceralFatScore?: number; // 0-100
  /** Optional validated clinical / device */
  semenConcentration?: number;
  motilityPct?: number;
  morphologyPct?: number;
  sdfPct?: number; // sperm DNA fragmentation
  testosteroneNgDl?: number;
  exogenousAndrogenFlag?: boolean; // TRT / steroids
  glucoseMgDl?: number;
  stiRiskFlag?: boolean;
  varicoceleFlag?: boolean;
  geneticRiskFlag?: boolean;
  subclinicalInflammationFlag?: boolean;
  medsFertilityImpact?: boolean;
  otherChronicDiseaseFlag?: boolean;
  /** Infectious / anatomical / genomic screening (consented vault only) */
  infectiousHistoryFlag?: boolean;
  orchitisMumpsFlag?: boolean;
  cryptorchidismFlag?: boolean;
  testicularTraumaFlag?: boolean;
  genomicConsentPending?: boolean;
  genomicMarkerAvailable?: boolean;
  /** Acute red-flag symptom (self-report / triage intake) — emergency path */
  acuteTesticularPainFlag?: boolean;
}

export type CareLoopStage =
  | "invited"
  | "assessed"
  | "referred"
  | "referral_completed";

export interface RiskSignal {
  id: string;
  title: string;
  titleAr: string;
  domain:
    | "metabolic"
    | "infectious"
    | "anatomical"
    | "lifestyle"
    | "semen"
    | "environmental"
    | "occupational"
    | "recovery";
  severity: SignalSeverity;
  confidence: Confidence;
  source: SignalSource;
  explanation: string;
  explanationAr: string;
  drivers: string[];
  modifiable: boolean;
  screeningOnly: true;
  weight: number;
}

export interface AdaptiveModule {
  id: string;
  title: string;
  titleAr: string;
  reason: string;
  reasonAr: string;
  priority: number;
  kind:
    | "hydration_heat"
    | "shift_recovery"
    | "air_quality"
    | "nutrition_timing"
    | "metabolic_watch"
    | "privacy_stewardship"
    | "device_checkin"
    | "urgent_red_flag";
  cta: string;
  ctaAr: string;
}

export interface TriageRecommendation {
  tier: TriageTier;
  label: string;
  labelAr: string;
  rationale: string;
  rationaleAr: string;
  requiresHumanReview: boolean;
  redFlags: string[];
  boundaryNote: string;
}

export interface RiskAssessment {
  overallScore: number; // 0-100 screening load
  signals: RiskSignal[];
  modules: AdaptiveModule[];
  triage: TriageRecommendation;
  fairnessTags: string[];
  generatedAt: string;
  disclaimer: string;
}

export interface DataStreamStatus {
  id: DataStreamId;
  label: string;
  labelAr: string;
  connected: boolean;
  lastSync: string;
  freshness: "live" | "today" | "this_week" | "monthly" | "stale";
  fields: string[];
}

export interface PersonalFinding {
  id: string;
  title: string;
  titleAr: string;
  /** Plain language about THIS man's data — not textbook theory */
  aboutYou: string;
  aboutYouAr: string;
  whatItMeansForYou: string;
  whatItMeansForYouAr: string;
  nextStep: string;
  nextStepAr: string;
  severity: SignalSeverity;
  confidence: Confidence;
  source: SignalSource;
  control: "controllable" | "uncontrollable" | "semi";
  category:
    | "hidden_clinical"
    | "lifestyle_env"
    | "physio"
    | "psycho"
    | "work"
    | "life_context";
  relatedBody: string[];
}

export interface Persona {
  id: string;
  name: string;
  nameAr: string;
  age: number;
  nationality: string;
  maritalStatus: "single" | "married" | "prefer_not_to_say";
  occupation: string;
  city: string;
  summary: string;
  summaryAr: string;
  variables: IndependentVariables;
  consents: Record<ConsentCategory, boolean>;
  connectedStreams: DataStreamId[];
}

export interface ScenarioPreset {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  patch: Partial<IndependentVariables>;
}

export interface ExplainRequest {
  assessment: RiskAssessment;
  personaName?: string;
  locale?: Locale;
}

export interface CompetitionMetrics {
  completedAssessments: number;
  medianHoursToEvaluation: number;
  referralCompletionRate: number;
  /** Null in prototype — cannot measure trust from synthetic data alone. */
  trustScore: number | null;
  trustMethodNote: string;
  culturalAppropriateness: number | null;
  culturalReviewNote: string;
  modifiableRisksPreDiagnosisPct: number;
  fairnessByGroup: { group: string; score: number }[];
  careLoop: {
    invited: number;
    assessed: number;
    referred: number;
    referralCompleted: number;
  };
}
