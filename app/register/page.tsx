import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthMessage, type AuthSearchParams } from "@/lib/auth/forms";
import { registerAction } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";
import PasswordField from "@/components/auth/PasswordField";
import OAuthButtons from "@/components/auth/OAuthButtons";

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
        <h1 className="sr-only">注册</h1>
        <nav className="auth-tabs" aria-label="登入或注册">
          <Link className="auth-tab" href="/login">
            登入
          </Link>
          <Link className="auth-tab is-active" href="/register" aria-current="page">
            注册
          </Link>
        </nav>
        <p className="auth-copy">创建账号后即可进入留学生签证助手。</p>

        {error ? <p className="auth-alert auth-alert-error">{error}</p> : null}

        <form action={registerAction} className="auth-form">
          <label className="field">
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <PasswordField autoComplete="new-password" />
          <label className="auth-terms">
            <input name="agree" type="checkbox" required />
            <span>我已阅读并同意服务条款</span>
          </label>
          <button className="btn btn-primary" type="submit">
            注册
          </button>
        </form>

        <OAuthButtons />
      </section>
    </main>
  );
}
