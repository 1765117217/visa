import Link from "next/link";

import { footerDisclaimer, navigationItems } from "@/data/pages/site";

export default function SiteLayout({ children }) {
  return (
    <>
      <header className="site-header">
        <div className="brand-block">
          <Link className="brand" href="/">
            留学生签证助手
          </Link>
          <span className="brand-tag">中国留学生日本 / 韩国签证资料辅助平台</span>
        </div>
        <nav className="site-nav" aria-label="主导航">
          {navigationItems.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
      <footer className="site-footer">
        <p>{footerDisclaimer}</p>
      </footer>
    </>
  );
}
