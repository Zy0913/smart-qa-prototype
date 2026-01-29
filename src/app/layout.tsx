import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "盛视智能协作平台",
  description: "Pre-sales Solution Intelligent Collaboration Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased font-sans"
      >
        {children}
      </body>
    </html>
  );
}

