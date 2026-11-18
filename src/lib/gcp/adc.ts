/**
 * True when Google Cloud credentials are available to this process:
 * either an explicit key file (local development) or the Cloud Run service
 * identity (K_SERVICE is set on Cloud Run, which supplies default credentials).
 */
export function hasGcpCredentials(): boolean {
  return Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.K_SERVICE);
}
