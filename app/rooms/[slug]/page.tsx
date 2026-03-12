import Link from "next/link";
import { notFound } from "next/navigation";
import { ChatRoom } from "@/components/chat-room";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function RoomPage({
  params
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  const room = await prisma.room.findUnique({ where: { slug } });

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
