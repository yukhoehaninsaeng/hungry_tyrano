import { CreateRoomForm } from "@/components/create-room-form";
import { RoomList } from "@/components/room-list";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
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

  const rooms = dbRooms.map((room) => {
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

  return (
    <main>
      <header style={{ marginBottom: 24 }}>
        <p style={{ color: "#9de9b5", marginBottom: 6 }}>Hungry Tyrano Open Chat</p>
        <h1 style={{ margin: 0 }}>배고픈 티라노 채팅 라운지</h1>
        <p style={{ lineHeight: 1.5, opacity: 0.9 }}>
          여러 명이 함께 대화하고, 읽음 표시와 미열람 인원을 확인할 수 있는 오픈채팅 MVP입니다.
          공개방/비밀방을 모두 만들 수 있어요.
        </p>
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
