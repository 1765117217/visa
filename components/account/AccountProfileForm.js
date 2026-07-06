"use client";

import { useState } from "react";

import { ACCOUNT_PROFILE_UPDATED_EVENT } from "@/lib/auth/account-menu";
import { getAccountName } from "@/lib/auth/account";
import { saveCurrentProfile } from "@/lib/profile/client.js";

function getInitialForm(profile) {
  return {
    displayName: profile?.display_name || "",
    fullName: profile?.full_name || "",
    phone: profile?.phone || "",
    nationality: profile?.nationality || "",
    passType: profile?.pass_type || "",
    visaType: profile?.visa_type || ""
  };
}

export default function AccountProfileForm({
  email,
  profile,
  passTypeOptions,
  visaTypeOptions,
  missingProfileStore
}) {
  const [form, setForm] = useState(() => ({
    ...getInitialForm(profile),
    displayName: getAccountName(email, profile?.display_name)
  }));
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (missingProfileStore) {
      setError("账户资料表还没有建立，请先套用 Supabase migration。");
      setStatus("");
      return;
    }

    setBusy(true);
    setError("");
    setStatus("");

    try {
      const result = await saveCurrentProfile(form);

      if (result.reason === "not-authenticated") {
        setError("登录状态已失效，请重新登录。");
        return;
      }

      if (result.reason === "missing-profile-store") {
        setError("账户资料表还没有建立，请先套用 Supabase migration。");
        return;
      }

      if (!result.ok) {
        setError("账户资料保存失败，请稍后再试。");
        return;
      }

      const nextDisplayName = getAccountName(
        email,
        result.profile?.display_name || form.displayName
      );
      setForm((current) => ({ ...current, displayName: nextDisplayName }));
      window.dispatchEvent(
        new CustomEvent(ACCOUNT_PROFILE_UPDATED_EVENT, {
          detail: { displayName: nextDisplayName }
        })
      );
      setStatus("账户资料已保存。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      {status ? <p className="auth-alert auth-alert-success">{status}</p> : null}
      {error ? <p className="auth-alert auth-alert-error">{error}</p> : null}

      <label className="field">
        Email
        <input value={email || ""} readOnly />
      </label>

      <label className="field">
        显示名
        <input
          name="displayName"
          type="text"
          autoComplete="name"
          value={form.displayName}
          onChange={updateField}
          placeholder="例如：小明"
        />
      </label>

      <label className="field">
        姓名
        <input
          name="fullName"
          type="text"
          autoComplete="name"
          value={form.fullName}
          onChange={updateField}
          placeholder="例如：张三"
        />
      </label>

      <div className="profile-form-grid">
        <label className="field">
          电话 / WhatsApp
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={updateField}
            placeholder="+60123456789"
          />
        </label>

        <label className="field">
          国籍
          <input
            name="nationality"
            type="text"
            autoComplete="country-name"
            value={form.nationality}
            onChange={updateField}
            placeholder="例如：中国"
          />
        </label>

        <label className="field">
          马来西亚签证身份
          <select name="passType" value={form.passType} onChange={updateField}>
            <option value="">请选择</option>
            {passTypeOptions.map((item) => (
              <option value={item.value} key={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          签证类型
          <select name="visaType" value={form.visaType} onChange={updateField}>
            <option value="">请选择</option>
            {visaTypeOptions.map((item) => (
              <option value={item.value} key={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="profile-privacy-note">
        <strong>不会保存：</strong>护照号码、学校名。基础资料表单里的护照号码只用于当前签证材料清单流程。
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? "保存中..." : "保存账户资料"}
        </button>
      </div>
    </form>
  );
}
