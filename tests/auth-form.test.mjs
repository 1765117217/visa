import test from "node:test";
import assert from "node:assert/strict";

import { parseEmailPasswordForm } from "../lib/auth/forms.js";

test("parseEmailPasswordForm returns normalized credentials", () => {
  const formData = new FormData();
  formData.set("email", "  User@Example.COM  ");
  formData.set("password", "correct horse battery staple");

  assert.deepEqual(parseEmailPasswordForm(formData), {
    email: "user@example.com",
    password: "correct horse battery staple"
  });
});

test("parseEmailPasswordForm rejects missing email", () => {
  const formData = new FormData();
  formData.set("password", "correct horse battery staple");

  assert.throws(
    () => parseEmailPasswordForm(formData),
    /Email is required/
  );
});

test("parseEmailPasswordForm rejects short passwords", () => {
  const formData = new FormData();
  formData.set("email", "user@example.com");
  formData.set("password", "short");

  assert.throws(
    () => parseEmailPasswordForm(formData),
    /Password must be at least 8 characters/
  );
});
