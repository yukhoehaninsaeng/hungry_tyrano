# Hungry Tyrano Open Chat

배고픈 티라노 컨셉의 오픈 채팅방 MVP입니다. Next.js(App Router) + PostgreSQL(Prisma) 기반으로 구성되어 있습니다.

## 핵심 기능

- 오픈/비밀 채팅방 생성 (비밀방은 입장 코드 필요)
- 채팅방 목록에서 메시지 수/참여자 수/미열람 인원 수 확인
- 여러 사용자가 닉네임으로 입장 후 실시간에 가깝게 대화(3초 폴링)
- 메시지별 읽음 인원 표시
- 설정 메뉴에서 닉네임 변경 및 채팅 레이아웃(compact/cozy) 변경

## 기술 스택

- Next.js 14 + React 18 + TypeScript
- PostgreSQL
- Prisma ORM
- Zod 입력 검증

## 실행 방법

1. 의존성 설치

```bash
npm install
```

2. 환경변수 설정

```bash
cp .env.example .env
```

3. Prisma 마이그레이션

```bash
npx prisma migrate dev --name init
```

4. 개발 서버 시작

```bash
npm run dev
```

## API

- `GET /api/rooms` : 방 목록 조회 (공개/비밀 여부, 미열람 인원 포함)
- `POST /api/rooms` : 방 생성
- `POST /api/rooms/:slug/join` : 방 입장
- `PATCH /api/rooms/:slug/settings` : 닉네임/레이아웃 설정 변경
- `GET /api/messages?roomSlug=<slug>` : 특정 방 메시지 조회(읽음 수 포함)
- `POST /api/messages` : 메시지 생성
- `POST /api/messages/read` : 메시지 읽음 처리
