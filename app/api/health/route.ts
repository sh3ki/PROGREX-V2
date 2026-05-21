// Lightweight health check — no database query.
// Point UptimeRobot here so Render stays warm without waking Neon compute.
export async function GET() {
  return Response.json({ ok: true, ts: Date.now() })
}
