import { NextResponse } from "next/server";
import { getPublicMenu } from "../../../../lib/menu";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const menu = await getPublicMenu();
    return NextResponse.json({ menu });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
