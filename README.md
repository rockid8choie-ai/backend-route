# backend-route — BFS OS 백엔드 (미션 7 서버 + 미션 8 고도화)

Express + Prisma + Supabase(Postgres) 백엔드입니다. 미션 7에서 Vercel 서버리스로 배포했고,
미션 8에서 **JWT 인증 / 작업(민원) API / OpenAI 민원 분류**를 추가해
프론트엔드 MVP([bfs-mission6](https://github.com/rockid8choie-ai/bfs-mission6))와 연결했습니다.

- 배포: https://backend-route.vercel.app (`/health`로 확인)
- 프론트: https://bfs-mission6.vercel.app

## API

### 인증 `/auth`
| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | `/auth/signup` | 회원가입 `{name, email, password}` → `{token, user}` (비밀번호는 bcrypt 해시 저장) |
| POST | `/auth/login` | 로그인 `{email, password}` → `{token, user}` (JWT, 7일 만료) |
| GET | `/auth/me` | 내 정보 (Bearer 토큰 필요) |

### 작업(민원) `/works` — 전부 Bearer 토큰 필요, **본인 작업만** 접근 가능
| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/works` | 내 작업 목록 (최신순) |
| POST | `/works` | 접수 `{title, category, location, priority, desc}` — 제목 5자↑, 위치 필수, 허용값 검증 |
| GET | `/works/:id` | 상세 (남의 작업은 404) |
| PATCH | `/works/:id` | 상태 변경 `{status}` (접수/배정/완료) |
| DELETE | `/works/:id` | 삭제 |

### 결제(우선처리) `/payments` — Bearer 토큰 필요
| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | `/payments/checkout` | `{workId}` → 주문 생성 `{orderId, amount, orderName}` — 금액(9,900원)은 서버가 확정, pending 주문은 재사용 |
| POST | `/payments/confirm` | `{orderId, paymentKey, amount}` → 토스 최종 승인(금액 대조) → 작업 fastTrack 전환, 영수증 URL 반환 |

`TOSS_SECRET_KEY`가 없으면 토스 공식 공개 샌드박스 키로 동작합니다(실청구 없음).

### AI 분류 `/ai` — Bearer 토큰 필요
| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | `/ai/classify` | `{title, desc}` → `{category, priority, reason}` — OpenAI gpt-4o-mini, JSON 응답 강제 |

`OPENAI_API_KEY`가 없으면 503과 안내 메시지를 반환하고, 프론트는 수동 입력으로 폴백합니다.
모델이 허용 목록 밖 값을 반환하면 서버에서 `etc`/`보통`으로 보정합니다.

## 환경 변수 (`.env.example` 참고)
- `DATABASE_URL` — Supabase transaction pooler(6543)
- `DIRECT_URL` — prisma migrate/db push용 직접 연결(5432)
- `JWT_SECRET` — 토큰 서명 키 (긴 랜덤 문자열)
- `OPENAI_API_KEY` — AI 분류용. 클라이언트에 절대 노출되지 않음
- `FRONTEND_URL` — CORS 허용 프론트 주소

## 구조 & 설계 노트
- 계층: `routes → controllers(입력 검증) → service(도메인 규칙) → repository(Prisma)`
- 소유권 검증은 service 계층에서: 남의 작업은 403이 아닌 **404**로 응답해 존재 여부 자체를 숨김
- 스키마 변경(`User.password`, `Work`)은 콜드 스타트 시 1회 실행되는 멱등 DDL
  (`prisma/ensureSchema.js`)로 반영 — DATABASE_URL이 Vercel sensitive env라
  로컬에서 `prisma db push`를 돌릴 수 없는 제약의 의도적 우회. 실행 SQL은 고정 목록뿐
- 확장 여지: 라우터 단위로 기능이 분리되어 있어 결제(`/payments`) 등 추가 기능,
  역할(관리자/기사) 분리, 작업 필드 세분화가 기존 코드 수정 없이 가능

## 실행
```bash
npm install
cp .env.example .env   # 값 채우기
npm run dev            # http://localhost:4000
```
