import { ME } from "./me-profile";
import type { Persona } from "./types";

/** Individual app: one personal file only (age 18+ member). */
export const PERSONAS: Persona[] = [ME];

export function getPersona(id: string) {
  return PERSONAS.find((p) => p.id === id) ?? ME;
}
