import { NextResponse } from "next/server";
import { getMenuVersion } from "../../../../lib/menu";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const version = await getMenuVersion();
    return NextResponse.json({ version });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
