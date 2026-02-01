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
  const { data, error } = await admin
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ categories: data });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ["admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const payload = await req.json();
  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("categories")
    .insert({
      name: payload.name,
      sort_order: payload.sort_order ?? 999,
      is_active: payload.is_active ?? true
    })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || "Insert failed" }, { status: 400 });
  }

  await logAudit({
    userId: auth.userId,
    action: "create",
    entityType: "category",
    entityId: data.id,
    before: null,
    after: data
  });
  await bumpMenuVersion();

  return NextResponse.json({ category: data });
}
