import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · BAFX Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
