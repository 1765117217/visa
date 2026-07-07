import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthMessage, type AuthSearchParams } from "@/lib/auth/forms";
import { registerAction } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams
}: {
  searchParams: Promise<AuthSearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    redirect("/");
  }

  const error = getAuthMessage(params, "error");

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <p className="eyebrow">Account</p>
        <h1>注册</h1>
        <p className="auth-copy">创建账号后即可进入留学生签证助手。</p>

        {error ? <p className="auth-alert auth-alert-error">{error}</p> : null}

        <form action={registerAction} className="auth-form">
          <label className="field">
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label className="field">
            Password
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          <button className="btn btn-primary" type="submit">
            注册
          </button>
        </form>

        <p className="auth-switch">
          已经有账号？ <Link href="/login">登入</Link>
        </p>
      </section>
    </main>
  );
}
