import { NextResponse } from "next/server";
import { db, hasDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasDatabase()) return NextResponse.json({ status: "demo", database: "not_configured" });
  try {
    await db()`SELECT 1`;
    return NextResponse.json({ status: "ok", database: "connected" });
  } catch {
    return NextResponse.json({ status: "degraded", database: "unavailable" }, { status: 503 });
  }
}
