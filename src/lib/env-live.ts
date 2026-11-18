/**
 * Environment helpers for live heat and air-quality signals.
 * Pure functions only (no network) so they can be tested offline.
 * Screening cues only, not clinical measurements.
 */

/**
 * Heat index in °C from air temperature (°C) and relative humidity (%).
 * Uses the NWS Rothfusz regression, with the NWS simple formula below 80°F.
 */
export function heatIndexC(tempC: number, rh: number): number {
  const t = tempC * (9 / 5) + 32;
  const r = Math.min(100, Math.max(0, rh));
  const simple = 0.5 * (t + 61 + (t - 68) * 1.2 + r * 0.094);
  let hiF: number;
  if ((simple + t) / 2 < 80) {
    hiF = simple;
  } else {
    hiF =
      -42.379 +
      2.04901523 * t +
      10.14333127 * r -
      0.22475541 * t * r -
      0.00683783 * t * t -
      0.05481717 * r * r +
      0.00122874 * t * t * r +
      0.00085282 * t * r * r -
      0.00000199 * t * t * r * r;
    if (r < 13 && t >= 80 && t <= 112) {
      hiF -= ((13 - r) / 4) * Math.sqrt((17 - Math.abs(t - 95)) / 17);
    } else if (r > 85 && t >= 80 && t <= 87) {
      hiF += ((r - 85) / 10) * ((87 - t) / 5);
    }
  }
  return Math.round(((hiF - 32) * 5) / 9 * 10) / 10;
}

/** US EPA PM2.5 breakpoints (µg/m³ → AQI), 2024 revision. */
const PM25_BREAKPOINTS: [number, number, number, number][] = [
  [0, 9.0, 0, 50],
  [9.1, 35.4, 51, 100],
  [35.5, 55.4, 101, 150],
  [55.5, 125.4, 151, 200],
  [125.5, 225.4, 201, 300],
  [225.5, 325.4, 301, 500],
];

/** Approximate US AQI from PM2.5 only (other pollutants not used). */
export function usAqiFromPm25(pm25: number): number {
  const c = Math.min(500, Math.max(0, pm25));
  for (const [cLo, cHi, iLo, iHi] of PM25_BREAKPOINTS) {
    if (c >= cLo && c <= cHi) {
      return Math.round(((iHi - iLo) / (cHi - cLo)) * (c - cLo) + iLo);
    }
  }
  return 500;
}

/**
 * Validate and coarsen coordinates. Rounds to 2 decimals (~1 km) so the
 * server never receives a precise location. Returns null if invalid.
 */
export function coarseCoords(
  lat: number,
  lon: number,
): { lat: number; lon: number } | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return {
    lat: Math.round(lat * 100) / 100,
    lon: Math.round(lon * 100) / 100,
  };
}

/** Default demo location: Abu Dhabi. */
export const DEFAULT_COORDS = { lat: 24.45, lon: 54.38 } as const;
