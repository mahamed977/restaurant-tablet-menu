import { NextRequest } from "next/server";
import { supabaseAdmin } from "./supabase-service";
import { AdminRole } from "../types";

export type AuthResult =
  | { ok: true; userId: string; role: AdminRole }
  | { ok: false; status: number; message: string };

export async function requireAuth(
  req: NextRequest,
  allowed: AdminRole[]
): Promise<AuthResult> {
  const header = req.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.split(" ")[1] : null;
  if (!token) {
    return { ok: false, status: 401, message: "Missing auth token" };
  }

  const adminClient = supabaseAdmin();
  const { data: userResult, error } = await adminClient.auth.getUser(token);
  if (error || !userResult?.user) {
    return { ok: false, status: 401, message: "Invalid token" };
  }

  const userId = userResult.user.id;
  const { data: roleRow, error: roleErr } = await adminClient
    .from("admin_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (roleErr || !roleRow) {
    return { ok: false, status: 403, message: "No role assigned" };
  }

  const role = roleRow.role as AdminRole;
  if (!allowed.includes(role)) {
    return { ok: false, status: 403, message: "Insufficient role" };
  }

  return { ok: true, userId, role };
}
