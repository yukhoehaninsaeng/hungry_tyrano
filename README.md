# Hungry Tyrano Open Chat

배고픈 티라노 컨셉의 오픈 채팅방 MVP입니다. Next.js App Router, Prisma, PostgreSQL 기반으로 구성되어 있습니다.

## 주요 기능

- 공개/비공개 채팅방 생성
- 채팅방 목록에서 메시지 수, 참여자 수, 미열람 인원 확인
- 닉네임으로 입장하고 3초 간격으로 메시지 자동 새로고침
- 메시지별 읽음 인원 표시
- 닉네임과 채팅 레이아웃(compact/cozy) 변경
- 비공개 방 비밀번호는 `scrypt` 기반 해시 + salt로 저장

## 로컬 실행

1. `pnpm install`
2. `.env.example`을 복사해 `.env` 생성
3. `pnpm exec prisma db push`
4. `pnpm dev`

## Vercel 배포 체크리스트

배포 전에 아래 둘이 반드시 필요합니다.

- Vercel Project Settings > Environment Variables에 `DATABASE_URL` 추가
- 연결된 PostgreSQL에 Prisma 스키마 반영

스키마 반영 명령:

```bash
pnpm exec prisma db push
```

Vercel에서 같은 오류가 반복되면 대부분 아래 둘 중 하나입니다.

- `DATABASE_URL`이 Vercel 환경 변수에 없음
- DB는 연결됐지만 `Room`, `Participant`, `Message`, `MessageRead` 테이블이 아직 없음

## API

- `GET /api/rooms`: 방 목록 조회
- `POST /api/rooms`: 방 생성
- `POST /api/rooms/:slug/join`: 방 입장
- `PATCH /api/rooms/:slug/settings`: 닉네임/레이아웃 변경
- `GET /api/messages?roomSlug=<slug>`: 방 메시지 조회
- `POST /api/messages`: 메시지 생성
- `POST /api/messages/read`: 메시지 읽음 처리
