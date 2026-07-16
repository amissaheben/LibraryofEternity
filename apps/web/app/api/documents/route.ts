import { NextResponse } from "next/server";
import { getDocuments } from "@/lib/library";
export function GET(){ return NextResponse.json(getDocuments().map(({content,...doc})=>doc)); }
