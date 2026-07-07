export const IDLE_SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export const ACTIVITY_EVENTS: string[] = [
  "keydown",
  "pointerdown",
  "pointermove",
  "scroll",
  "touchstart",
  "visibilitychange"
];

export function getIdleTimeoutRedirectPath() {
  const message = encodeURIComponent(
    "Session expired after 30 minutes of inactivity"
  );
  return `/login?message=${message}`;
}
