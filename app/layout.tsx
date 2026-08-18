import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppShell } from "@/components/AppShell";
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var target = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
                  if (target) {
                    var currentFetch = target.fetch;
                    try {
                      Object.defineProperty(target, 'fetch', {
                        get: function() { return currentFetch; },
                        set: function(v) { currentFetch = v; },
                        configurable: true,
                        enumerable: true
                      });
                    } catch (e) {}
                    if (typeof window !== 'undefined' && window !== target) {
                      try {
                        Object.defineProperty(window, 'fetch', {
                          get: function() { return currentFetch; },
                          set: function(v) { currentFetch = v; },
                          configurable: true,
                          enumerable: true
                        });
                      } catch (e) {}
                    }
                  }
                } catch (err) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className="h-screen w-screen overflow-hidden bg-[#edf2f8] dark:bg-[#070b14] font-sans text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-500/20"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AppShell uploadsDisabled={uploadsDisabled}>
            {children}
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
