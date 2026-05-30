// Lightweight health check — no database query.
// Point UptimeRobot here to keep the server warm without opening a DB connection.
export async function GET() {
  return Response.json({ ok: true, ts: Date.now() })
}
