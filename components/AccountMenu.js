"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { getAccountInitial, getAccountName } from "@/lib/auth/account";
import {
  getBrowserSupabaseClient,
  hasSupabasePublicEnv
} from "@/lib/supabase/client.js";

export default function AccountMenu({ email }) {
  const router = useRouter();
  const menuRef = useRef(null);
  const [navTarget, setNavTarget] = useState(null);
  const [session, setSession] = useState(email ? { email } : null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setNavTarget(document.querySelector(".site-nav"));
  }, []);

  useEffect(() => {
    if (!hasSupabasePublicEnv()) {
      return undefined;
    }

    const supabase = getBrowserSupabaseClient();
    if (!supabase) {
      return undefined;
    }

    let isMounted = true;

    async function syncSession() {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;

      const userEmail = data.session?.user?.email || email;
      setSession(userEmail ? { email: userEmail } : null);
    }

    void syncSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const userEmail = nextSession?.user?.email || "";
      setSession(userEmail ? { email: userEmail } : null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [email]);

  useEffect(() => {
    if (!accountMenuOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountMenuOpen]);

  if (!navTarget || !session) {
    return null;
  }

  async function handleSignOut() {
    const supabase = getBrowserSupabaseClient();
    if (!supabase) {
      return;
    }

    setBusy(true);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setSession(null);
      setAccountMenuOpen(false);
      router.replace("/login");
    } finally {
      setBusy(false);
    }
  }

  const accountName = getAccountName(session.email);
  const accountInitial = getAccountInitial(session.email);

  return createPortal(
    <div className="account-menu-root" ref={menuRef}>
      <button
        aria-expanded={accountMenuOpen}
        aria-haspopup="menu"
        className="account-trigger"
        type="button"
        onClick={() => setAccountMenuOpen((isOpen) => !isOpen)}
      >
        <span className="account-avatar" aria-hidden="true">
          {accountInitial}
        </span>
        <span className="account-name">{accountName}</span>
        <span
          className={`account-chevron ${accountMenuOpen ? "is-open" : ""}`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {accountMenuOpen ? (
        <div className="account-menu" role="menu">
          <div className="account-menu-meta">
            <span>已登录为</span>
            <strong>{session.email}</strong>
          </div>
          <div className="account-menu-separator" />
          <Link
            className="account-menu-item"
            href="/"
            role="menuitem"
            onClick={() => setAccountMenuOpen(false)}
          >
            账户
          </Link>
          <button
            className="account-menu-item account-menu-signout"
            disabled={busy}
            role="menuitem"
            type="button"
            onClick={() => void handleSignOut()}
          >
            {busy ? "..." : "登出"}
          </button>
        </div>
      ) : null}
    </div>,
    navTarget
  );
}
