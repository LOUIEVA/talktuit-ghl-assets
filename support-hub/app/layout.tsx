import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://support.talktuit.com"),
  title: { default: "TalkTuit Support Hub", template: "%s | TalkTuit Support" },
  description: "Clear, client-friendly guidance for your TalkTuit workspace.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: { title: "TalkTuit Support Hub", description: "Clear answers for every part of your workspace.", type: "website", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

