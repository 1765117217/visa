"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import {
  ACTIVITY_EVENTS,
  IDLE_SESSION_TIMEOUT_MS,
  getIdleTimeoutRedirectPath
} from "@/lib/auth/session-timeout";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

const PASSIVE_EVENT_OPTIONS: AddEventListenerOptions = { passive: true };

export default function IdleSessionTimeout({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const timeoutRef = useRef<number | null>(null);
  const signingOutRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    function clearIdleTimer() {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    }

    async function handleIdleTimeout() {
      if (signingOutRef.current) {
        return;
      }

      signingOutRef.current = true;
      clearIdleTimer();

      const supabase = getBrowserSupabaseClient();
      if (supabase) {
        await supabase.auth.signOut();
      }

      router.replace(getIdleTimeoutRedirectPath());
    }

    function scheduleIdleTimer() {
      clearIdleTimer();
      timeoutRef.current = window.setTimeout(
        () => void handleIdleTimeout(),
        IDLE_SESSION_TIMEOUT_MS
      );
    }

    function handleActivity() {
      if (document.visibilityState === "hidden") {
        return;
      }

      scheduleIdleTimer();
    }

    scheduleIdleTimer();
    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, PASSIVE_EVENT_OPTIONS);
    });

    return () => {
      clearIdleTimer();
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(
          eventName,
          handleActivity,
          PASSIVE_EVENT_OPTIONS
        );
      });
    };
  }, [enabled, pathname, router]);

  return null;
}
