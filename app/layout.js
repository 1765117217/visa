import AccountMenu from "@/components/AccountMenu";
import IdleSessionTimeout from "@/components/IdleSessionTimeout";
import { getAccountName } from "@/lib/auth/account";
import { getCurrentUserProfile } from "@/lib/profile/server.js";
import { createClient } from "@/lib/supabase/server.js";

import "./globals.css";

export const metadata = {
  title: "留学生签证助手",
  description: "中国留学生日本 / 韩国签证资料辅助平台",
  icons: {
    icon: "/favicon.svg"
  }
};

async function getAccountSessionInfo() {
  try {
    const { user, profile } = await getCurrentUserProfile();
    const email = user?.email || "";

    return {
      email,
      displayName: email ? getAccountName(email, profile?.display_name) : ""
    };
  } catch {
    try {
      const supabase = await createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      const email = user?.email || "";

      return {
        email,
        displayName: email ? getAccountName(email) : ""
      };
    } catch {
      return { email: "", displayName: "" };
    }
  }
}

export default async function RootLayout({ children }) {
  const accountSession = await getAccountSessionInfo();

  return (
    <html lang="zh-CN">
      <body>
        {children}
        <IdleSessionTimeout enabled={Boolean(accountSession.email)} />
        <AccountMenu
          email={accountSession.email}
          displayName={accountSession.displayName}
        />
      </body>
    </html>
  );
}
