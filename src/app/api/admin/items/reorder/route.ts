import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabase-service";
import { requireAuth } from "../../../../../lib/adminAuth";
import { logAudit, bumpMenuVersion } from "../../../../../lib/audit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ["admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { order } = await req.json();
  if (!Array.isArray(order)) {
    return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const updates = order.map((id: string, idx: number) =>
    admin.from("menu_items").update({ sort_order: idx + 1 }).eq("id", id)
  );
  await Promise.all(updates);

  await logAudit({
    userId: auth.userId,
    action: "reorder",
    entityType: "item",
    entityId: "bulk",
    before: null,
    after: order
  });
  await bumpMenuVersion();

  return NextResponse.json({ ok: true });
}
