/**
 * lib/workspace/languages.ts
 *
 * Single source of truth for every language the Code Workspace supports.
 * Each language declares which execution backend handles it
 * (app/api/compile/route.ts branches on this) and a sensible starter
 * template, so switching languages in the editor always leaves you with
 * something runnable rather than a blank file.
 *
 * Backends:
 *   - "playground": Rust only, proxied to play.rust-lang.org — the same
 *     backend the official Rust Playground website uses.
 *   - "piston": C, C++, Java, Python — proxied to the free, public
 *     Piston execution API (emkc.org/api/v2/piston), which is exactly
 *     the tool for "one backend, many languages" rather than
 *     integrating a separate sandboxed toolchain per language ourselves.
 */

export type LanguageId = "rust" | "c" | "cpp" | "java" | "python";

export interface LanguageConfig {
  id: LanguageId;
  label: string;
  backend: "playground" | "piston";
  /** Piston's language slug (unused for the playground backend). */
  pistonLanguage?: string;
  /** File name Piston should compile/run (Java specifically requires
   * the file name to match the public class name). */
  fileName?: string;
  starter: string;
}

export const LANGUAGES: LanguageConfig[] = [
  {
    id: "rust",
    label: "Rust",
    backend: "playground",
    starter: `fn main() {\n    println!("Hello, world!");\n}\n`,
  },
  {
    id: "python",
    label: "Python",
    backend: "piston",
    pistonLanguage: "python",
    fileName: "main.py",
    starter: `print("Hello, world!")\n`,
  },
  {
    id: "java",
    label: "Java",
    backend: "piston",
    pistonLanguage: "java",
    fileName: "Main.java",
    starter: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, world!");\n    }\n}\n`,
  },
  {
    id: "c",
    label: "C",
    backend: "piston",
    pistonLanguage: "c",
    fileName: "main.c",
    starter: `#include <stdio.h>\n\nint main(void) {\n    printf("Hello, world!\\n");\n    return 0;\n}\n`,
  },
  {
    id: "cpp",
    label: "C++",
    backend: "piston",
    pistonLanguage: "cpp",
    fileName: "main.cpp",
    starter: `#include <iostream>\n\nint main() {\n    std::cout << "Hello, world!" << std::endl;\n    return 0;\n}\n`,
  },
];

export function getLanguage(id: string): LanguageConfig {
  return LANGUAGES.find((l) => l.id === id) ?? LANGUAGES[0];
}
