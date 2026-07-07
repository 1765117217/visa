import test from "node:test";
import assert from "node:assert/strict";

import {
  ACTIVITY_EVENTS,
  IDLE_SESSION_TIMEOUT_MS,
  getIdleTimeoutRedirectPath
} from "../lib/auth/session-timeout.ts";

test("idle session timeout defaults to 30 minutes", () => {
  assert.equal(IDLE_SESSION_TIMEOUT_MS, 30 * 60 * 1000);
});

test("activity events cover common keyboard pointer and page activity", () => {
  assert.deepEqual(ACTIVITY_EVENTS, [
    "keydown",
    "pointerdown",
    "pointermove",
    "scroll",
    "touchstart",
    "visibilitychange"
  ]);
});

test("idle timeout redirects to login with a clear message", () => {
  assert.equal(
    getIdleTimeoutRedirectPath(),
    "/login?message=Session%20expired%20after%2030%20minutes%20of%20inactivity"
  );
});
