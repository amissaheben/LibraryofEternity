import type { Metadata } from "next";
import Shell from "@/components/Shell";
import "./globals.css";
export const metadata: Metadata = { title: "Library of Eternity", description: "Constitutional knowledge platform for the Infinite Weave." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Shell>{children}</Shell></body></html>;
}
