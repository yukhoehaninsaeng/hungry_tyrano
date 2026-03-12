# Hungry Tyrano Open Chat

배고픈 티라노 컨셉의 오픈 채팅방 MVP입니다. Next.js App Router, Prisma, PostgreSQL 기반으로 구성되어 있습니다.

## 주요 기능

- 공개/비공개 채팅방 생성
- 채팅방 목록에서 메시지 수, 참여자 수, 미열람 인원 확인
- 닉네임으로 입장하고 3초 간격으로 메시지 자동 새로고침
- 메시지별 읽음 인원 표시
- 닉네임과 채팅 레이아웃(compact/cozy) 변경
- 비공개 방 비밀번호는 `scrypt` 기반 해시 + salt로 저장

## 실행 방법

1. 의존성 설치

```bash
npm install
```

2. 환경 변수 설정

```bash
cp .env.example .env
```

3. Prisma 마이그레이션 실행

```bash
npx prisma migrate dev --name init
```

4. 개발 서버 실행

```bash
npm run dev
```

## 환경 변수

- `DATABASE_URL`: PostgreSQL 연결 URL

## API

- `GET /api/rooms`: 방 목록 조회
- `POST /api/rooms`: 방 생성
- `POST /api/rooms/:slug/join`: 방 입장
- `PATCH /api/rooms/:slug/settings`: 닉네임/레이아웃 변경
- `GET /api/messages?roomSlug=<slug>`: 방 메시지 조회
- `POST /api/messages`: 메시지 생성
- `POST /api/messages/read`: 메시지 읽음 처리
