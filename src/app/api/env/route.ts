import { NextResponse } from "next/server";
import { coarseCoords, heatIndexC, usAqiFromPm25 } from "@/lib/env-live";

/**
 * Live heat + AQI for a coarse location (server-side so the API key stays private).
 * Without OPENWEATHER_API_KEY, or if the upstream fails, returns source "simulated"
 * so the app falls back to its simulated environment feed.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const coords = coarseCoords(
    Number(url.searchParams.get("lat")),
    Number(url.searchParams.get("lon")),
  );
  if (!coords) {
    return NextResponse.json({ error: "invalid coordinates" }, { status: 400 });
  }

  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) {
    return NextResponse.json({ source: "simulated", reason: "no_api_key" });
  }

  const q = `lat=${coords.lat}&lon=${coords.lon}&appid=${key}`;
  try {
    const signal = AbortSignal.timeout(4000);
    const [wxRes, airRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?${q}&units=metric`, {
        cache: "no-store",
        signal,
      }),
      fetch(`https://api.openweathermap.org/data/2.5/air_pollution?${q}`, {
        cache: "no-store",
        signal,
      }),
    ]);
    if (!wxRes.ok || !airRes.ok) throw new Error("upstream status");

    const wx = (await wxRes.json()) as {
      main: { temp: number; humidity: number };
    };
    const air = (await airRes.json()) as {
      list: { components: { pm2_5: number } }[];
    };
    const tempC = wx.main.temp;
    const humidityPct = wx.main.humidity;
    const pm25 = air.list[0]?.components?.pm2_5;
    if (typeof tempC !== "number" || typeof humidityPct !== "number" || typeof pm25 !== "number") {
      throw new Error("unexpected payload");
    }

    return NextResponse.json({
      source: "live",
      provider: "OpenWeatherMap",
      heatIndexC: heatIndexC(tempC, humidityPct),
      humidityPct,
      aqi: usAqiFromPm25(pm25),
      tempC,
      fetchedAt: new Date().toISOString(),
    });
  } catch {
    // Never echo the upstream error or the key.
    return NextResponse.json({ source: "simulated", reason: "upstream_unavailable" });
  }
}
