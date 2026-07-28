import { NextResponse } from "next/server";

type SubjectResult = { subject: string; collected: string; draft: string; reviewed: string; flags: string[] };
const banned = ["최고", "1등", "전교", "완벽", "반드시", "압도적"];

function fallback(subjects: string[], notes: string): SubjectResult[] { return subjects.map((subject) => { const collected = `${notes.trim()} — ${subject} 관련 활동으로 정리`; const draft = `${subject} 수업에서 ${notes.trim()}을(를) 바탕으로 핵심 내용을 정리하고, 활동 과정에서 근거를 들어 자신의 생각을 구체적으로 설명함.`; const flags = banned.filter((word) => draft.includes(word)); return { subject, collected, draft, reviewed: draft.replace(/최고|1등|전교|완벽|반드시|압도적/g, "").replace(/\s{2,}/g, " "), flags }; }); }

export async function POST(request: Request) {
  const { subjects = [], notes = "", grade = "", model = "Gemini 3.5 Flash-Lite", apiKey = "" } = await request.json();
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key || !subjects.length) return NextResponse.json({ results: fallback(subjects, notes), mode: "demo", message: "Gemini 키가 없어 데모 생성기를 사용했습니다." });
  try {
    const prompt = `너는 학교생활기록부 세특 작성팀이다. 다음 3단계(수집, 작성, 검토)를 내부적으로 수행하고 JSON 배열만 반환하라. 학년: ${grade}. 과목: ${subjects.join(", ")}. 학생 활동: ${notes}. 금지: 순위·최상급·단정적 표현, 확인되지 않은 성과. 각 항목은 subject, collected, draft, reviewed, flags를 포함한다.`;
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model.toLowerCase().includes("flash") ? "gemini-2.5-flash" : "gemini-2.5-pro")}:generateContent?key=${encodeURIComponent(key)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }), cache: "no-store" });
    if (!resp.ok) throw new Error("Gemini request failed");
    const data = await resp.json(); const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || ""; const clean = raw.replace(/^```json\s*/, "").replace(/```\s*$/, "");
    return NextResponse.json({ results: JSON.parse(clean), mode: "gemini" });
  } catch { return NextResponse.json({ results: fallback(subjects, notes), mode: "demo", message: "Gemini 응답을 해석하지 못해 안전한 데모 결과를 표시했습니다." }); }
}
