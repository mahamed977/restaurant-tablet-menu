"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../lib/supabase-browser";

export function useAdminToken() {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getSession().then(({ data }) => {
      const access = data.session?.access_token ?? null;
      if (!access) {
        router.replace("/admin/login");
      } else {
        setToken(access);
      }
    });
  }, [router]);

  return token;
}
