import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const readSchema = z.object({
  roomSlug: z.string().min(2),
  viewerId: z.string().min(4).max(64)
});

export async function POST(req: Request) {
  const payload = await req.json();
  const parsed = readSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "입력값이 올바르지 않습니다.", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const room = await prisma.room.findUnique({
    where: { slug: parsed.data.roomSlug },
    select: { id: true }
  });

  if (!room) {
    return NextResponse.json({ message: "방을 찾을 수 없습니다." }, { status: 404 });
  }

  const participant = await prisma.participant.findUnique({
    where: {
      roomId_viewerId: {
        roomId: room.id,
        viewerId: parsed.data.viewerId
      }
    }
  });

  if (!participant) {
    return NextResponse.json({ message: "먼저 방에 입장해 주세요." }, { status: 403 });
  }

  const unreadMessages = await prisma.message.findMany({
    where: {
      roomId: room.id,
      reads: {
        none: {
          participantId: participant.id
        }
      }
    },
    select: { id: true }
  });

  if (unreadMessages.length > 0) {
    await prisma.messageRead.createMany({
      data: unreadMessages.map((message: { id: string }) => ({
        roomId: room.id,
        messageId: message.id,
        participantId: participant.id
      })),
      skipDuplicates: true
    });
  }

  return NextResponse.json({ readCount: unreadMessages.length });
}
