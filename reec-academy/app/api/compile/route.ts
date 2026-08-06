/**
 * app/api/compile/route.ts
 *
 * A real, multi-language compiler backend — not a placeholder. Routes
 * each language to whichever public execution service actually handles
 * it (see lib/workspace/languages.ts):
 *
 *   - Rust           → play.rust-lang.org/execute (the official Rust
 *                       Playground's own backend)
 *   - C / C++ / Java  → emkc.org/api/v2/piston/execute (Piston — a free,
 *     / Python          public, multi-language execution API used by
 *                       many real tools for exactly this purpose)
 *
 * Both branches normalize to the same response shape
 * `{ success, stdout, stderr }` so nothing downstream (the workspace
 * store, CodeEditorPanel) needs to know which backend actually ran the
 * code. Adding a 6th language later is: one entry in languages.ts, and
 * — only if it needs a THIRD backend — one more branch here.
 *
 * Every branch fails closed and honestly: a network error, timeout, or
 * non-200 upstream response becomes a clear stderr message, never a
 * raw 500 or a silent false-success.
 */

import { NextRequest, NextResponse } from "next/server";
import { getLanguage } from "@/lib/workspace/languages";

export const runtime = "nodejs";

const PLAYGROUND_URL = "https://play.rust-lang.org/execute";
const PISTON_URL = "https://emkc.org/api/v2/piston/execute";
const TIMEOUT_MS = 20_000;
const MAX_CODE_CHARS = 20_000;

interface CompileResponse {
  success: boolean;
  stdout: string;
  stderr: string;
}

function withTimeout() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

async function runOnPlayground(code: string): Promise<CompileResponse> {
  const { signal, clear } = withTimeout();
  try {
    const res = await fetch(PLAYGROUND_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal,
      body: JSON.stringify({
        channel: "stable",
        mode: "debug",
        edition: "2021",
        crateType: "bin",
        tests: false,
        backtrace: false,
        code,
      }),
    });
    if (!res.ok) {
      return {
        success: false,
        stdout: "",
        stderr: `The Rust Playground service returned an error (HTTP ${res.status}). It may be temporarily unavailable — try again shortly.`,
      };
    }
    const data = await res.json();
    return {
      success: Boolean(data.success),
      stdout: typeof data.stdout === "string" ? data.stdout : "",
      stderr: typeof data.stderr === "string" ? data.stderr : "",
    };
  } finally {
    clear();
  }
}

async function runOnPiston(code: string, pistonLanguage: string, fileName: string): Promise<CompileResponse> {
  const { signal, clear } = withTimeout();
  try {
    const res = await fetch(PISTON_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal,
      body: JSON.stringify({
        language: pistonLanguage,
        version: "*",
        files: [{ name: fileName, content: code }],
      }),
    });
    if (!res.ok) {
      return {
        success: false,
        stdout: "",
        stderr: `The code execution service returned an error (HTTP ${res.status}). It may be temporarily unavailable — try again shortly.`,
      };
    }
    const data = await res.json();
    // Piston returns a separate `compile` stage for compiled languages
    // (C/C++/Java) and a `run` stage for everything — surface whichever
    // stage actually failed so the error isn't misleadingly attributed.
    const compileFailed = data.compile && Number(data.compile.code) !== 0;
    const stdout: string = data.run?.stdout ?? "";
    const runStderr: string = data.run?.stderr ?? "";
    const compileStderr: string = data.compile?.stderr ?? "";
    const runFailed = data.run && Number(data.run.code) !== 0;

    return {
      success: !compileFailed && !runFailed,
      stdout,
      stderr: [compileFailed ? compileStderr : "", runStderr].filter(Boolean).join("\n"),
    };
  } finally {
    clear();
  }
}

export async function POST(req: NextRequest) {
  let body: { code?: string; language?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, stdout: "", stderr: "Invalid request body." }, { status: 400 });
  }

  const code = (body.code ?? "").toString();
  if (!code.trim()) {
    return NextResponse.json({ success: false, stdout: "", stderr: "No code to run." }, { status: 400 });
  }
  if (code.length > MAX_CODE_CHARS) {
    return NextResponse.json(
      { success: false, stdout: "", stderr: `Code too long (max ${MAX_CODE_CHARS} characters).` },
      { status: 400 }
    );
  }

  const language = getLanguage(body.language ?? "rust");

  try {
    const result =
      language.backend === "playground"
        ? await runOnPlayground(code)
        : await runOnPiston(code, language.pistonLanguage!, language.fileName!);

    return NextResponse.json(result);
  } catch (err) {
    const timedOut = (err as Error).name === "AbortError";
    return NextResponse.json(
      {
        success: false,
        stdout: "",
        stderr: timedOut
          ? "The compile request timed out after 20s."
          : `Couldn't reach the ${language.label} execution service. Check your internet connection and try again.`,
      },
      { status: 504 }
    );
  }
}
