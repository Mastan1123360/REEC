import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { FocusBackdrop } from "@/components/workspace/FocusBackdrop";
import { CodeWorkspace } from "@/components/workspace/CodeWorkspace";
import { isCurriculumComplete } from "@/lib/content/discover";

export const metadata: Metadata = {
  title: "REEC Academy — Rust Elite Engineering Curriculum",
  description:
    "An interactive learning engine that renders engineering curriculum markdown into rich educational experiences.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const uploadsDisabled = await isCurriculumComplete();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ThemeProvider>
          <Header uploadsDisabled={uploadsDisabled} />
          {children}
          <FocusBackdrop />
          <CodeWorkspace />
        </ThemeProvider>
      </body>
    </html>
  );
}
