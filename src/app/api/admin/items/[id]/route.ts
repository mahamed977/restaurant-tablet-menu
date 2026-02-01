import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabase-service";
import { requireAuth } from "../../../../../lib/adminAuth";
import { logAudit, bumpMenuVersion } from "../../../../../lib/audit";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(req, ["admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const admin = supabaseAdmin();
  const existing = await admin.from("menu_items").select("*").eq("id", params.id).single();
  if (existing.error || !existing.data) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const payload = await req.json();
  const { data, error } = await admin
    .from("menu_items")
    .update({
      category_id: payload.category_id ?? existing.data.category_id,
      name: payload.name ?? existing.data.name,
      description: payload.description ?? existing.data.description,
      price: payload.price ?? existing.data.price,
      is_available: payload.is_available ?? existing.data.is_available,
      image_url: payload.image_url ?? existing.data.image_url,
      sort_order: payload.sort_order ?? existing.data.sort_order
    })
    .eq("id", params.id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || "Update failed" }, { status: 400 });
  }

  await logAudit({
    userId: auth.userId,
    action: "update",
    entityType: "item",
    entityId: params.id,
    before: existing.data,
    after: data
  });
  await bumpMenuVersion();

  return NextResponse.json({ item: data });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(req, ["admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const admin = supabaseAdmin();
  const existing = await admin.from("menu_items").select("*").eq("id", params.id).single();
  if (existing.error || !existing.data) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const { error } = await admin.from("menu_items").delete().eq("id", params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logAudit({
    userId: auth.userId,
    action: "delete",
    entityType: "item",
    entityId: params.id,
    before: existing.data,
    after: null
  });
  await bumpMenuVersion();

  return NextResponse.json({ ok: true });
}
