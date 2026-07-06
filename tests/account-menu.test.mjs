import test from "node:test";
import assert from "node:assert/strict";

import { ACCOUNT_ROUTE } from "../lib/auth/account-menu.js";
import { getAccountInitial, getAccountName } from "../lib/auth/account.js";

test("getAccountName uses the email local part as the display name", () => {
  assert.equal(getAccountName("YeeChung016@gmail.com"), "YeeChung016");
});

test("getAccountName prefers an explicit display name", () => {
  assert.equal(getAccountName("yeechung016@gmail.com", "  Yee Chung  "), "Yee Chung");
});

test("getAccountName falls back to email when display name is blank", () => {
  assert.equal(getAccountName("yeechung016@gmail.com", " "), "yeechung016");
});

test("getAccountInitial returns the uppercase first character", () => {
  assert.equal(getAccountInitial("yeechung016@gmail.com"), "Y");
});

test("getAccountInitial uses the explicit display name", () => {
  assert.equal(getAccountInitial("yeechung016@gmail.com", " Chung "), "C");
});

test("getAccountInitial falls back when no email is available", () => {
  assert.equal(getAccountInitial(""), "U");
});

test("account menu links to the account profile page", () => {
  assert.equal(ACCOUNT_ROUTE, "/account");
});
