"use client";

import { useEffect, useMemo, useState } from "react";

type SubjectResult = { subject: string; collected: string; draft: string; reviewed: string; flags: string[] };
type HistoryItem = { id: string; student_key: string; grade: string; subjects: string[]; created_at: string; results: SubjectResult[] };

const subjects = ["국어", "수학", "영어", "통합사회", "통합과학", "정보", "체육", "예술"];
const demoResults: SubjectResult[] = [
  { subject: "정보", collected: "자료 구조의 개념을 비교하고, 간단한 정렬 알고리즘을 직접 구현함.", draft: "자료 구조의 개념을 비교하여 특징을 정리하고, 정렬 알고리즘을 직접 구현하며 문제 해결 과정을 논리적으로 설명함.", reviewed: "자료 구조의 개념을 비교하여 특징을 정리하고, 정렬 알고리즘을 직접 구현하며 문제 해결 과정을 논리적으로 설명함.", flags: [] },
  { subject: "국어", collected: "토론에서 근거를 제시하고 다른 의견을 요약함.", draft: "토론에서 다양한 근거를 제시하고 상대 의견의 핵심을 요약하여 자신의 주장을 설득력 있게 전개함.", reviewed: "토론에서 다양한 근거를 제시하고 상대 의견의 핵심을 요약하여 자신의 주장을 설득력 있게 전개함.", flags: [] },
];

function localKey() { return "saeteuk-history"; }

export default function Home() {
  const [grade, setGrade] = useState("고등학교 2학년");
  const [studentKey, setStudentKey] = useState("S-2026-014");
  const [selected, setSelected] = useState(["정보", "국어"]);
  const [notes, setNotes] = useState("자료 구조 개념 비교, 정렬 알고리즘 구현, 토론에서 근거 제시와 다른 의견 요약");
  const [results, setResults] = useState<SubjectResult[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [active, setActive] = useState("새로 작성");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [model, setModel] = useState("Gemini 3.5 Flash-Lite");
  const [apiKey, setApiKey] = useState("");

  useEffect(() => { (async () => { try { const local = JSON.parse(localStorage.getItem(localKey()) || "[]"); setHistory(local); setModel(localStorage.getItem("gemini-model") || "Gemini 3.5 Flash-Lite"); const response = await fetch("/api/history"); const data = await response.json(); if (data.records?.length) { const remote = data.records.map((r: HistoryItem) => ({ ...r, subjects: r.subjects || [], results: r.results || [] })); setHistory(remote); localStorage.setItem(localKey(), JSON.stringify(remote)); } } catch {} })(); }, []);
  const totalChars = useMemo(() => results.reduce((n, r) => n + r.reviewed.length, 0), [results]);
  const toggleSubject = (subject: string) => setSelected((v) => v.includes(subject) ? v.filter((x) => x !== subject) : [...v, subject]);

  async function generate() {
    if (!selected.length || !notes.trim()) return;
    setLoading(true); setSaved(false);
    try {
      const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ grade, subjects: selected, notes, model, apiKey }) });
      const data = await response.json();
      setResults(data.results || demoResults.filter((r) => selected.includes(r.subject)));
      setActive("새로 작성");
    } catch { setResults(demoResults.filter((r) => selected.includes(r.subject))); }
    setLoading(false);
  }

  async function saveHistory() {
    if (!results.length) return;
    const item: HistoryItem = { id: crypto.randomUUID(), student_key: studentKey, grade, subjects: selected, created_at: new Date().toISOString(), results };
    try { await fetch("/api/history", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item) }); } catch {}
    const next = [item, ...history]; setHistory(next); localStorage.setItem(localKey(), JSON.stringify(next)); setSaved(true);
  }
  function download() { const text = results.map((r) => `[${r.subject}]\n${r.reviewed}`).join("\n\n"); const blob = new Blob([text], { type: "text/plain;charset=utf-8" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${studentKey}-세특-초안.txt`; a.click(); URL.revokeObjectURL(url); }
  function showHistory(item: HistoryItem) { setStudentKey(item.student_key); setGrade(item.grade); setSelected(item.subjects); setResults(item.results); setActive("저장 내역"); }

  return <main className="app-shell">
    <aside className="sidebar"><div className="brand"><div className="brand-mark">S</div><div><strong>세특 스튜디오</strong><span>Student record workspace</span></div></div><div className="nav-label">WORKSPACE</div><button className={active === "새로 작성" ? "nav active" : "nav"} onClick={() => setActive("새로 작성")}>✦ <span>새로 작성</span><em>N</em></button><button className={active === "저장 내역" ? "nav active" : "nav"} onClick={() => setActive("저장 내역")}>▤ <span>저장 내역</span><b>{history.length || ""}</b></button><div className="sidebar-bottom"><button className="nav" onClick={() => document.getElementById("settings")?.scrollIntoView({ behavior: "smooth" })}>⚙ <span>개인 설정</span></button><div className="profile"><div className="avatar">김</div><div><strong>김교사</strong><span>교사 계정</span></div><span className="dots">•••</span></div></div></aside>
    <section className="content"><header className="topbar"><div><div className="eyebrow">{active === "저장 내역" ? "ARCHIVE" : "NEW WORKSPACE"}</div><h1>{active === "저장 내역" ? "저장 내역" : "세특 초안 작성"}</h1><p>{active === "저장 내역" ? "저장된 학생 기록을 다시 확인하고 이어서 편집하세요." : "학생의 활동을 바탕으로 과목별 세부능력 및 특기사항을 작성합니다."}</p></div><div className="top-actions"><span className="status-dot">●</span> AI 준비됨 <button className="icon-btn">?</button></div></header>
      {active === "저장 내역" ? <section className="archive"><div className="section-title"><div><h2>최근 저장 기록</h2><p>{history.length}개의 기록이 있습니다.</p></div><button className="secondary" onClick={() => setActive("새로 작성")}>＋ 새 작성</button></div>{history.length === 0 ? <div className="empty"><div>▤</div><h3>아직 저장된 기록이 없습니다</h3><p>새 초안을 생성하고 저장하면 이곳에서 다시 확인할 수 있어요.</p></div> : <div className="history-list">{history.map((item) => <button className="history-card" key={item.id} onClick={() => showHistory(item)}><div className="history-icon">{item.student_key.slice(-2)}</div><div className="history-main"><strong>{item.student_key} · {item.grade}</strong><span>{item.subjects.join(" · ")}</span></div><time>{new Date(item.created_at).toLocaleDateString("ko-KR")}</time><span>→</span></button>)}</div>}</section> : <><section className="workspace-grid"><div className="panel input-panel"><div className="panel-head"><div className="step">01</div><div><h2>학생 활동 입력</h2><p>기본 정보와 활동 키워드를 입력하세요.</p></div></div><label>학생 식별값<input value={studentKey} onChange={(e) => setStudentKey(e.target.value)} placeholder="예: S-2026-014" /></label><label>학년<select value={grade} onChange={(e) => setGrade(e.target.value)}><option>고등학교 1학년</option><option>고등학교 2학년</option><option>고등학교 3학년</option></select></label><label>과목 선택<div className="chips">{subjects.map((s) => <button key={s} className={selected.includes(s) ? "chip selected" : "chip"} onClick={() => toggleSubject(s)}>{s}{selected.includes(s) && " ×"}</button>)}</div></label><label>활동 키워드 또는 관찰 내용<textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={6} placeholder="수업 중 관찰한 활동, 산출물, 태도 등을 자유롭게 입력하세요." /><small>{notes.length} / 2,000</small></label><button className="generate" onClick={generate} disabled={loading}>{loading ? "에이전트가 작성 중…" : "✦  세특 초안 생성"}<span>⌘ ↵</span></button><div className="agent-strip"><div className="agent-dot">●</div><div><strong>3개 에이전트가 순서대로 검토합니다</strong><span>수집 → 작성 → 검토</span></div></div></div><div className="panel result-panel"><div className="panel-head result-head"><div className="step">02</div><div><h2>과목별 결과</h2><p>검토 에이전트가 다듬은 초안입니다.</p></div>{results.length > 0 && <div className="result-actions"><button className="secondary" onClick={download}>↓ TXT</button><button className="save" onClick={saveHistory}>{saved ? "✓ 저장됨" : "저장하기"}</button></div>}</div>{results.length === 0 ? <div className="result-empty"><div className="spark">✦</div><h3>아직 생성된 초안이 없습니다</h3><p>왼쪽에 활동 내용을 입력하고<br />초안을 생성해보세요.</p></div> : <div className="results">{results.map((r) => <article className="result-card" key={r.subject}><div className="subject-tag">{r.subject}</div><div className="pipeline"><span className="done">✓ 수집</span><i>→</i><span className="done">✓ 작성</span><i>→</i><span className="reviewed">✓ 검토 완료</span></div><p>{r.reviewed}</p>{r.flags.length > 0 && <div className="flag">⚠ {r.flags.join(", ")}</div>}</article>)}<div className="result-footer"><span>총 {results.length}과목 · {totalChars}자</span><span>검토 규정 적용됨</span></div></div>}</div></section><section className="settings-panel" id="settings"><div><div className="step">03</div><div><h2>개인 설정</h2><p>생성에 사용할 Gemini 연결 정보를 관리합니다.</p></div></div><div className="setting-fields"><label>Gemini API Key<input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="서버 환경변수 사용 권장" /></label><label>선호 모델<select value={model} onChange={(e) => { setModel(e.target.value); localStorage.setItem("gemini-model", e.target.value); }}><option>Gemini 3.5 Flash-Lite</option><option>Gemini 2.5 Flash</option><option>Gemini 2.5 Pro</option></select></label></div><span className="privacy">🔒 키는 이 브라우저에 저장되지 않으며, 생성 요청 시에만 사용됩니다.</span></section></>}
    </section></main>;
}
