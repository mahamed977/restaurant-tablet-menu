import { supabaseAdmin } from "./supabase-service";

export async function logAudit(params: {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  before: unknown;
  after: unknown;
}) {
  const adminClient = supabaseAdmin();
  await adminClient.from("admin_audit").insert({
    user_id: params.userId,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId,
    before: params.before,
    after: params.after
  });
}

export async function bumpMenuVersion() {
  const adminClient = supabaseAdmin();
  // ensure meta row exists
  await adminClient
    .from("menu_meta")
    .insert({ id: 1, menu_version: 1 }, { onConflict: "id", ignoreDuplicates: true });

  const { error } = await adminClient.rpc("increment_menu_version");
  if (error) {
    const { data } = await adminClient.from("menu_meta").select("menu_version").eq("id", 1).single();
    const next = (data?.menu_version ?? 1) + 1;
    await adminClient.from("menu_meta").update({ menu_version: next }).eq("id", 1);
  }
}
