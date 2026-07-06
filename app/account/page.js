import { redirect } from "next/navigation";

import AccountProfileForm from "@/components/account/AccountProfileForm";
import SiteLayout from "@/components/layout/SiteLayout";
import { passTypeOptions, visaTypeOptions } from "@/data/pages/site";
import { getCurrentUserProfile } from "@/lib/profile/server.js";

export const dynamic = "force-dynamic";

const messages = {
  "profile-saved": "账户资料已保存。"
};

const errors = {
  "profile-save-failed": "账户资料保存失败，请稍后再试。",
  "profile-store-missing": "账户资料表还没有建立，请先套用 Supabase migration。"
};

export default async function AccountPage({ searchParams }) {
  const params = await searchParams;
  const { user, profile, missingProfileStore } = await getCurrentUserProfile();

  if (!user) {
    redirect("/login");
  }

  const message = messages[params?.message] || "";
  const error = errors[params?.error] || "";

  return (
    <SiteLayout>
      <main className="account-page-shell">
        <section className="account-page-panel">
          <div className="account-page-heading">
            <p className="eyebrow">Account</p>
            <h1>账户资料</h1>
            <p>
              管理会重复用到的基础资料。护照号码不会保存到账户资料里。
            </p>
          </div>

          {message ? <p className="auth-alert auth-alert-success">{message}</p> : null}
          {error ? <p className="auth-alert auth-alert-error">{error}</p> : null}
          {missingProfileStore ? (
            <p className="auth-alert auth-alert-error">
              账户资料表还没有建立。请先在 Supabase 套用 migration 后再保存资料。
            </p>
          ) : null}

          <AccountProfileForm
            email={user.email || ""}
            profile={profile}
            passTypeOptions={passTypeOptions}
            visaTypeOptions={visaTypeOptions}
            missingProfileStore={missingProfileStore}
          />
        </section>
      </main>
    </SiteLayout>
  );
}
