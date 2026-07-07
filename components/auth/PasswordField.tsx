"use client";

import { useState } from "react";

export default function PasswordField({
  autoComplete
}: {
  autoComplete: "current-password" | "new-password";
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="field auth-password-field">
      <label htmlFor="password">Password</label>
      <div className="auth-password-input">
        <input
          id="password"
          name="password"
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          minLength={8}
          required
        />
        <button
          type="button"
          className="auth-password-toggle"
          onClick={() => setShow((value) => !value)}
          aria-pressed={show}
        >
          {show ? "隐藏" : "显示"}
        </button>
      </div>
    </div>
  );
}
