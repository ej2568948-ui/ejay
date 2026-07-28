# 세특 스튜디오

학생 활동 키워드를 과목별 세특 초안으로 정리하고, 수집 → 작성 → 검토 에이전트의 결과를 저장·조회하는 Vercel + Supabase 호환 웹앱입니다.

## 연결

1. Supabase SQL Editor에서 `supabase/schema.sql`을 실행합니다.
2. Vercel 프로젝트 환경변수에 `.env.example`의 세 값을 등록합니다.
3. `GEMINI_API_KEY`가 없으면 안전한 데모 생성기가 작동하며, 저장은 브라우저 로컬 기록으로도 확인할 수 있습니다.

## 호환성 점검

- Next App Router API route로 구성되어 Vercel serverless 함수에서 동작합니다.
- Supabase REST API를 서버에서 호출하므로 브라우저에 Service Role Key가 노출되지 않습니다.
- `vercel.json`은 API 함수 실행 시간을 지정하고, 프론트는 키 없이도 fallback 결과로 UI를 검증할 수 있습니다.
