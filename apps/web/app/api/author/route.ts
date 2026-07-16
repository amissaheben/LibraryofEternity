import { NextResponse } from "next/server";
import { saveGovernedDocument, validateGovernedDocument } from "@/lib/repository";
import type { GovernedDocumentInput } from "@/lib/governance";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const input = await request.json() as GovernedDocumentInput & { mode?: "validate" | "save" };
    if (input.mode === "validate") return NextResponse.json({ ok: true, issues: validateGovernedDocument(input) });
    const result = saveGovernedDocument(input);
    return NextResponse.json(result, { status: result.ok ? 200 : 422 });
  } catch (error) {
    return NextResponse.json({ ok: false, issues: [{ field: "server", message: error instanceof Error ? error.message : "Unknown repository error.", severity: "error" }] }, { status: 500 });
  }
}
