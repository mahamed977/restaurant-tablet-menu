import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../../lib/supabase-service";
import { requireAuth } from "../../../../../../lib/adminAuth";
import { logAudit, bumpMenuVersion } from "../../../../../../lib/audit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(req, ["admin", "staff"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const admin = supabaseAdmin();
  const existing = await admin.from("menu_items").select("*").eq("id", params.id).single();
  if (existing.error || !existing.data) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const payload = await req.json();
  const isAvailable = payload.is_available;

  const { data, error } = await admin
    .from("menu_items")
    .update({ is_available: isAvailable })
    .eq("id", params.id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || "Update failed" }, { status: 400 });
  }

  await logAudit({
    userId: auth.userId,
    action: "availability",
    entityType: "item",
    entityId: params.id,
    before: existing.data,
    after: data
  });
  await bumpMenuVersion();

  return NextResponse.json({ item: data });
}
