import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase-service";
import { requireAuth } from "../../../../lib/adminAuth";
import { logAudit, bumpMenuVersion } from "../../../../lib/audit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ["admin", "staff"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const admin = supabaseAdmin();
  const url = new URL(req.url);
  const categoryId = url.searchParams.get("category_id");

  let query = admin.from("menu_items").select("*").order("sort_order", { ascending: true });
  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ items: data });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ["admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const payload = await req.json();
  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("menu_items")
    .insert({
      category_id: payload.category_id,
      name: payload.name,
      description: payload.description ?? null,
      price: payload.price ?? 0,
      is_available: payload.is_available ?? true,
      image_url: payload.image_url ?? null,
      sort_order: payload.sort_order ?? 999
    })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || "Insert failed" }, { status: 400 });
  }

  await logAudit({
    userId: auth.userId,
    action: "create",
    entityType: "item",
    entityId: data.id,
    before: null,
    after: data
  });
  await bumpMenuVersion();

  return NextResponse.json({ item: data });
}
