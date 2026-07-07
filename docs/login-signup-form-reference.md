# Login/Signup 表单参考代码（结构/行为，不含颜色与样式）

来源：`components/auth/auth-card.tsx`（Supabase Auth）。`className` 仅结构占位，样式由目标项目自己决定。

```tsx
"use client";

import { type FormEvent, useState } from "react";

import { getLocaleAuthUrl } from "@/lib/site-url"; // 换成你项目自己的"邮箱确认回跳地址"生成方式
import { getBrowserSupabaseClient, hasSupabasePublicEnv } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

export function AuthForm({ locale }: { locale: string }) {
  const [mode, setMode] = useState<Mode>("signin");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [showSigninPassword, setShowSigninPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  async function handleSubmit(formData: FormData) {
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    if (!hasSupabasePublicEnv()) {
      setMessage("Missing auth config");
      return;
    }

    const supabase = getBrowserSupabaseClient();
    if (!supabase) {
      setMessage("Missing auth config");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // 登录成功：跳转到首页/受保护页
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: getLocaleAuthUrl(locale) }
      });
      if (error) throw error;
      setMessage("Check your email to confirm your account.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unexpected auth error");
    } finally {
      setBusy(false);
    }
  }

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await handleSubmit(new FormData(event.currentTarget));
  }

  return (
    <section aria-label="Login and sign up form" className="auth-v2-card">
      {/* Tab 切换：登录 / 注册 */}
      <div aria-label="Account mode" className="auth-tabs" role="tablist">
        <button aria-selected={mode === "signin"} onClick={() => setMode("signin")} role="tab" type="button">
          Log in
        </button>
        <button aria-selected={mode === "signup"} onClick={() => setMode("signup")} role="tab" type="button">
          Sign up
        </button>
      </div>

      {/* 登录表单 */}
      <form hidden={mode !== "signin"} onSubmit={handleFormSubmit}>
        <div className="field">
          <label htmlFor="signin-email">Email</label>
          <input autoComplete="email" id="signin-email" name="email" required type="email" />
        </div>

        <div className="field">
          <label htmlFor="signin-password">Password</label>
          <input
            autoComplete="current-password"
            id="signin-password"
            name="password"
            required
            type={showSigninPassword ? "text" : "password"}
          />
          <button onClick={() => setShowSigninPassword((v) => !v)} type="button">
            {showSigninPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button disabled={busy} type="submit">
          {busy && mode === "signin" ? "..." : "Log in"}
        </button>
        <div role="status">{mode === "signin" ? message : ""}</div>
      </form>

      {/* 注册表单 */}
      <form hidden={mode !== "signup"} onSubmit={handleFormSubmit}>
        <div className="field">
          <label htmlFor="signup-email">Email</label>
          <input autoComplete="email" id="signup-email" name="email" required type="email" />
        </div>

        <div className="field">
          <label htmlFor="signup-password">Password</label>
          <input
            autoComplete="new-password"
            id="signup-password"
            minLength={8}
            name="password"
            required
            type={showSignupPassword ? "text" : "password"}
          />
          <button onClick={() => setShowSignupPassword((v) => !v)} type="button">
            {showSignupPassword ? "Hide" : "Show"}
          </button>
        </div>

        <label>
          <input required type="checkbox" />
          <span>I agree to the terms</span>
        </label>

        <button disabled={busy} type="submit">
          {busy && mode === "signup" ? "..." : "Sign up"}
        </button>
        <div role="status">{mode === "signup" ? message : ""}</div>
      </form>

      {/* 占位的社交登录按钮（原项目里是 disabled，没接真实 OAuth） */}
      <div>
        <button disabled type="button">Continue with Google</button>
        <button disabled type="button">Continue with Apple</button>
      </div>
    </section>
  );
}
```

要点：
- 一个组件切两种模式（`mode`），不是两个独立页面/组件，登录和注册的表单结构几乎一样。
- 密码框有明文切换（`showSigninPassword`/`showSignupPassword`），登录和注册各自独立开关，互不影响。
- 登录成功直接跳转；注册成功不跳转，改用 `message` 提示"去邮箱确认"（Supabase 默认邮箱确认流程）。
- Google/Apple 按钮是**摆着没接的占位**（`disabled`），原项目没做 OAuth，不是这段代码的一部分，可以直接删掉或自己接。

skipped: OAuth 接入、忘记密码流程、"记住我"勾选框的实际逻辑（原项目里也只是个没接逻辑的 checkbox）— 需要时再加。
