import { NextResponse } from "next/server";
import { getReleaseManifest, writeReleaseManifest } from "@/lib/repository";

export const runtime = "nodejs";
export async function GET() { return NextResponse.json(getReleaseManifest()); }
export async function POST() { return NextResponse.json({ ok: true, path: writeReleaseManifest(), manifest: getReleaseManifest() }); }
