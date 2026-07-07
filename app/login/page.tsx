import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthMessage, type AuthSearchParams } from "@/lib/auth/forms";
import { loginAction } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";
import PasswordField from "@/components/auth/PasswordField";
import OAuthButtons from "@/components/auth/OAuthButtons";

export const dynamic = "force-dynamic";

export default async function LoginPage({
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
  const message = getAuthMessage(params, "message");

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <h1 className="sr-only">登入</h1>
        <nav className="auth-tabs" aria-label="登入或注册">
          <Link className="auth-tab is-active" href="/login" aria-current="page">
            登入
          </Link>
          <Link className="auth-tab" href="/register">
            注册
          </Link>
        </nav>
        <p className="auth-copy">登入后继续使用留学生签证助手。</p>

        {error ? <p className="auth-alert auth-alert-error">{error}</p> : null}
        {message ? <p className="auth-alert auth-alert-success">{message}</p> : null}

        <form action={loginAction} className="auth-form">
          <label className="field">
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <PasswordField autoComplete="current-password" />
          <button className="btn btn-primary" type="submit">
            登入
          </button>
        </form>

        <OAuthButtons />
      </section>
    </main>
  );
}
