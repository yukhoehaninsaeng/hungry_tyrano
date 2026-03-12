import Link from "next/link";

type Room = {
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

export function RoomList({ rooms }: { rooms: Room[] }) {
  if (!rooms.length) {
    return <p>아직 채팅방이 없어요. 첫 번째 티라노 방을 만들어보세요!</p>;
  }

  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12 }}>
      {rooms.map((room) => (
        <li key={room.id} className="card" style={{ padding: 14 }}>
          <Link href={`/rooms/${room.slug}`}>
            <strong>
              {room.isPrivate ? "🔒" : "🌐"} {room.name}
            </strong>
            <p style={{ margin: "6px 0", color: "#aee7bf" }}>{room.concept}</p>
            <small>
              메시지 {room.messageCount}개 · 참여 {room.participantCount}명 · 미열람 {room.unreadParticipantsCount}명
            </small>
          </Link>
        </li>
      ))}
    </ul>
  );
}
