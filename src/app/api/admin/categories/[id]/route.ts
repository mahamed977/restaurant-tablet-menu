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
  const existing = await admin.from("categories").select("*").eq("id", params.id).single();
  if (existing.error || !existing.data) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const payload = await req.json();
  const { data, error } = await admin
    .from("categories")
    .update({
      name: payload.name ?? existing.data.name,
      is_active: payload.is_active ?? existing.data.is_active,
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
    entityType: "category",
    entityId: params.id,
    before: existing.data,
    after: data
  });
  await bumpMenuVersion();

  return NextResponse.json({ category: data });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(req, ["admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const admin = supabaseAdmin();
  const existing = await admin.from("categories").select("*").eq("id", params.id).single();
  if (existing.error || !existing.data) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const { error } = await admin.from("categories").delete().eq("id", params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logAudit({
    userId: auth.userId,
    action: "delete",
    entityType: "category",
    entityId: params.id,
    before: existing.data,
    after: null
  });
  await bumpMenuVersion();

  return NextResponse.json({ ok: true });
}
