import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { IDLE_RESET_MS } from "../config/display";

export function useIdleReset(enabled: boolean) {
  const router = useRouter();
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return undefined;

    const reset = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        router.push("/");
      }, IDLE_RESET_MS);
    };

    reset();
    const events = ["pointerdown", "keydown", "touchstart"];
    events.forEach((e) => window.addEventListener(e, reset));
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (timer.current) clearTimeout(timer.current);
    };
  }, [enabled, router]);
}
