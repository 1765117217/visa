import test from "node:test";
import assert from "node:assert/strict";

import { getAccountInitial, getAccountName } from "../lib/auth/account.js";

test("getAccountName uses the email local part as the display name", () => {
  assert.equal(getAccountName("YeeChung016@gmail.com"), "YeeChung016");
});

test("getAccountInitial returns the uppercase first character", () => {
  assert.equal(getAccountInitial("yeechung016@gmail.com"), "Y");
});

test("getAccountInitial falls back when no email is available", () => {
  assert.equal(getAccountInitial(""), "U");
});
