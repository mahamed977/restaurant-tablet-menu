import { useEffect, useRef, useState } from "react";
import { CategoryWithItems } from "../types";
import { OFFLINE_RETRY_MS, VERSION_POLL_MS } from "../config/display";

type State = {
  menu: CategoryWithItems[] | null;
  version: number | null;
  offline: boolean;
  loading: boolean;
};

export function useMenuPolling() {
  const [state, setState] = useState<State>({
    menu: null,
    version: null,
    offline: false,
    loading: true
  });
  const versionRef = useRef<number | null>(null);

  async function fetchMenu() {
    try {
      const res = await fetch("/api/public/menu");
      if (!res.ok) throw new Error("menu");
      const data = await res.json();
      setState((s) => ({
        ...s,
        menu: data.menu,
        loading: false,
        offline: false
      }));
    } catch {
      setState((s) => ({ ...s, offline: true, loading: false }));
      throw new Error("menu");
    }
  }

  async function fetchVersionAndMaybeRefresh() {
    try {
      const res = await fetch("/api/public/version");
      if (!res.ok) throw new Error("version");
      const data = await res.json();
      const nextVersion = Number(data.version);
      const prev = versionRef.current;
      versionRef.current = nextVersion;
      setState((s) => ({ ...s, version: nextVersion, offline: false }));
      if (prev !== null && nextVersion !== prev) {
        await fetchMenu();
      }
    } catch {
      setState((s) => ({ ...s, offline: true }));
      throw new Error("version");
    }
  }

  useEffect(() => {
    // initial load
    (async () => {
      try {
        await fetchMenu();
        await fetchVersionAndMaybeRefresh();
      } catch {
        // handled in state
      }
    })();

    const versionInterval = setInterval(() => {
      fetchVersionAndMaybeRefresh().catch(() => undefined);
    }, VERSION_POLL_MS);

    return () => clearInterval(versionInterval);
  }, []);

  useEffect(() => {
    if (!state.offline) return undefined;
    const retry = setInterval(() => {
      fetchMenu()
        .then(() => fetchVersionAndMaybeRefresh())
        .catch(() => undefined);
    }, OFFLINE_RETRY_MS);
    return () => clearInterval(retry);
  }, [state.offline]);

  return state;
}
