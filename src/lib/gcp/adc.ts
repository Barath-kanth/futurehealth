/**
 * True when Google Cloud credentials are available to this process:
 * either an explicit key file (local development) or the Cloud Run service
 * identity (K_SERVICE is set on Cloud Run, which supplies default credentials).
 */
export function hasGcpCredentials(): boolean {
  return Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.K_SERVICE);
}

/**
 * Gemini 3.x models on Vertex AI are served from the "global" location.
 * Gemini 2.0 and 2.5 Flash are retired, so the default is gemini-3.8-flash.
 */
export const DEFAULT_VERTEX_MODEL = "gemini-3.8-flash";
export const DEFAULT_VERTEX_LOCATION = "global";

export function vertexModelName(): string {
  return process.env.VERTEX_MODEL || DEFAULT_VERTEX_MODEL;
}

/** Options for `new VertexAI(...)`. The global location needs an explicit endpoint. */
export function vertexInit(project: string): {
  project: string;
  location: string;
  apiEndpoint?: string;
} {
  const location = process.env.GOOGLE_CLOUD_LOCATION || DEFAULT_VERTEX_LOCATION;
  return location === "global"
    ? { project, location, apiEndpoint: "aiplatform.googleapis.com" }
    : { project, location };
}

// Note: Gemini 3.x spends output tokens on internal thinking, and those count against
// maxOutputTokens. Keep the caps in the Gemini call sites generous (4096+) or JSON replies get cut off.
