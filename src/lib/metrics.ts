import {
  getSyntheticPopulation,
  metricsFromPopulation,
} from "./synthetic-population";
import type { CompetitionMetrics, RiskAssessment } from "./types";

/** Competition metrics from synthetic cohort (+ optional live assessments). */
export function buildCompetitionMetrics(
  assessments: RiskAssessment[] = [],
): CompetitionMetrics {
  const base = metricsFromPopulation(getSyntheticPopulation());
  if (!assessments.length) return base;
  return {
    ...base,
    completedAssessments: base.completedAssessments + assessments.length,
  };
}

export const DEMO_TREND = [
  { week: "W1", assessments: 48, referrals: 14 },
  { week: "W2", assessments: 112, referrals: 31 },
  { week: "W3", assessments: 210, referrals: 62 },
  { week: "W4", assessments: 318, referrals: 98 },
  { week: "W5", assessments: 410, referrals: 131 },
  { week: "W6", assessments: 500, referrals: 168 },
];

export const SIGNAL_DOMAIN_BREAKDOWN = [
  { domain: "Environmental", count: 34 },
  { domain: "Occupational", count: 29 },
  { domain: "Recovery", count: 41 },
  { domain: "Metabolic", count: 22 },
  { domain: "Lifestyle", count: 37 },
  { domain: "Semen / device", count: 9 },
  { domain: "Infectious", count: 18 },
  { domain: "Anatomical", count: 16 },
];
