import "./globals.css";

export const metadata = {
  title: "留学生签证助手",
  description: "中国留学生日本 / 韩国签证资料辅助平台",
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
