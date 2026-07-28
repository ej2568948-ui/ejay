create table if not exists public.saeteuk_records (
  id uuid primary key default gen_random_uuid(),
  student_key text not null,
  grade text not null,
  subjects text[] not null,
  results jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.saeteuk_records enable row level security;
-- 운영 시 인증 정책을 추가하고 SERVICE_ROLE_KEY는 서버 환경변수로만 사용하세요.
