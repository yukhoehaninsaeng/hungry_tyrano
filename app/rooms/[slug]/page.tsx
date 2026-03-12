import Link from "next/link";
import { notFound } from "next/navigation";
import { ChatRoom } from "@/components/chat-room";
import { isDatabaseConfigured } from "@/lib/db-errors";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function RoomPage({
  params
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  if (!isDatabaseConfigured()) {
    return (
      <main style={{ display: "grid", gap: 14 }}>
        <Link href="/" style={{ color: "#96e5af" }}>
          전체 방으로 돌아가기
        </Link>
        <section className="card" style={{ padding: 16 }}>
          <h1 style={{ marginTop: 0 }}>데이터베이스가 연결되지 않았습니다.</h1>
          <p style={{ marginBottom: 0 }}>
            Vercel 프로젝트에 `DATABASE_URL`을 설정하고 Prisma 스키마를 DB에 반영한 뒤 다시 시도해 주세요.
          </p>
        </section>
      </main>
    );
  }

  let room;

  try {
    room = await prisma.room.findUnique({ where: { slug } });
  } catch {
    return (
      <main style={{ display: "grid", gap: 14 }}>
        <Link href="/" style={{ color: "#96e5af" }}>
          전체 방으로 돌아가기
        </Link>
        <section className="card" style={{ padding: 16 }}>
          <h1 style={{ marginTop: 0 }}>방 정보를 불러오지 못했습니다.</h1>
          <p style={{ marginBottom: 0 }}>데이터베이스 연결 또는 테이블 생성 상태를 확인해 주세요.</p>
        </section>
      </main>
    );
  }

  if (!room) {
    notFound();
  }

  return (
    <main style={{ display: "grid", gap: 14 }}>
      <Link href="/" style={{ color: "#96e5af" }}>
        전체 방으로 돌아가기
      </Link>
      <section className="card" style={{ padding: 16 }}>
        <h1 style={{ margin: 0 }}>
          {room.isPrivate ? "비공개" : "공개"} {room.name}
        </h1>
        <p style={{ margin: "8px 0", color: "#9de9b5" }}>{room.concept}</p>
        {room.description ? <p style={{ margin: 0, opacity: 0.9 }}>{room.description}</p> : null}
      </section>
      <ChatRoom roomSlug={room.slug} isPrivate={room.isPrivate} />
    </main>
  );
}
