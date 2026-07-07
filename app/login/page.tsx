import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthMessage } from "@/lib/auth/forms";
import { loginAction } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server.js";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    redirect("/");
  }

  const error = getAuthMessage(params, "error");
  const message = getAuthMessage(params, "message");

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <p className="eyebrow">Account</p>
        <h1>登入</h1>
        <p className="auth-copy">登入后继续使用留学生签证助手。</p>

        {error ? <p className="auth-alert auth-alert-error">{error}</p> : null}
        {message ? <p className="auth-alert auth-alert-success">{message}</p> : null}

        <form action={loginAction} className="auth-form">
          <label className="field">
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label className="field">
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              minLength={8}
              required
            />
          </label>
          <button className="btn btn-primary" type="submit">
            登入
          </button>
        </form>

        <p className="auth-switch">
          还没有账号？ <Link href="/register">注册</Link>
        </p>
      </section>
    </main>
  );
}
