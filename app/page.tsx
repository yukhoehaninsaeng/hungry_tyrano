import { CreateRoomForm } from "@/components/create-room-form";
import { RoomList } from "@/components/room-list";
import { isDatabaseConfigured } from "@/lib/db-errors";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RoomSummary = {
  id: string;
  name: string;
  slug: string;
  concept: string;
  description: string | null;
  isPrivate: boolean;
  messageCount: number;
  participantCount: number;
  unreadParticipantsCount: number;
};

export default async function HomePage() {
  let rooms: RoomSummary[] = [];
  let dbWarning: string | null = null;

  if (!isDatabaseConfigured()) {
    dbWarning = "DATABASE_URL이 설정되지 않아 방 목록을 불러올 수 없습니다.";
  } else {
    try {
      const dbRooms = await prisma.room.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { messages: true, participants: true } },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { reads: true }
          }
        }
      });

      rooms = dbRooms.map((room) => {
        const latestMessage = room.messages[0];
        const unreadParticipantsCount = latestMessage
          ? Math.max(0, room._count.participants - latestMessage.reads.length)
          : 0;

        return {
          id: room.id,
          name: room.name,
          slug: room.slug,
          concept: room.concept,
          description: room.description,
          isPrivate: room.isPrivate,
          messageCount: room._count.messages,
          participantCount: room._count.participants,
          unreadParticipantsCount
        };
      });
    } catch {
      dbWarning = "데이터베이스 연결에 실패했습니다. Vercel 환경 변수와 Prisma 스키마 반영 상태를 확인해 주세요.";
    }
  }

  return (
    <main>
      <header style={{ marginBottom: 24 }}>
        <p style={{ color: "#9de9b5", marginBottom: 6 }}>Hungry Tyrano Open Chat</p>
        <h1 style={{ margin: 0 }}>배고픈 티라노 채팅 라운지</h1>
        <p style={{ lineHeight: 1.5, opacity: 0.9 }}>
          여러 명이 빠르게 대화하고 읽음 상태와 미열람 인원까지 확인할 수 있는 가벼운 오픈채팅 MVP입니다.
          공개방과 비공개방을 모두 만들 수 있습니다.
        </p>
        {dbWarning ? <p style={{ marginTop: 12, color: "#ffb3b3" }}>{dbWarning}</p> : null}
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
          alignItems: "start"
        }}
      >
        <div className="card" style={{ padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>새 채팅방 만들기</h2>
          <CreateRoomForm />
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>오픈 채팅방 목록</h2>
          <RoomList rooms={rooms} />
        </div>
      </section>
    </main>
  );
}
