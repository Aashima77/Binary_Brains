import "@/styles/globals.css";

import clsx from "clsx";
import { Metadata, Viewport } from "next";

import { Navbar } from "@/components/navbar";
import { fontGrotesk, fontMono, fontRoboto, fontSans } from "@/config/fonts";
import { siteConfig } from "@/config/site";

import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "bg-background min-h-screen font-sans text-foreground antialiased",
          fontSans.variable,
          fontGrotesk.variable,
          fontRoboto.variable,
          fontMono.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
