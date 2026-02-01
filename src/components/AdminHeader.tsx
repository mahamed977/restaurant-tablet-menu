/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabaseBrowser } from "../lib/supabase-browser";

export function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href: string) => pathname?.startsWith(href);

  const handleSignOut = async () => {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <div className="flex-between" style={{ marginBottom: 24 }}>
      <div style={{ fontWeight: 800, letterSpacing: 0.4 }}>Dashboard</div>
      <div className="flex" style={{ gap: 10 }}>
        <Link className={`pill ${isActive("/admin/categories") ? "badge-success" : ""}`} href="/admin/categories">
          Categories
        </Link>
        <Link className={`pill ${isActive("/admin/items") ? "badge-success" : ""}`} href="/admin/items">
          Items
        </Link>
        <button className="btn btn-secondary" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    </div>
  );
}
