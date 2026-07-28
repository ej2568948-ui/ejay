import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json(); const url = process.env.SUPABASE_URL; const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ saved: false, mode: "local" });
  const response = await fetch(`${url}/rest/v1/saeteuk_records`, { method: "POST", headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify({ student_key: body.student_key, grade: body.grade, subjects: body.subjects, results: body.results }) });
  return NextResponse.json({ saved: response.ok, mode: "supabase" }, { status: response.ok ? 200 : 502 });
}

export async function GET() {
  const url = process.env.SUPABASE_URL; const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ records: [], mode: "local" });
  const response = await fetch(`${url}/rest/v1/saeteuk_records?select=*&order=created_at.desc`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" });
  return NextResponse.json({ records: response.ok ? await response.json() : [], mode: "supabase" });
}
