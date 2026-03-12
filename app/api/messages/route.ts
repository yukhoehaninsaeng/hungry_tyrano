import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createMessageSchema = z.object({
  roomSlug: z.string().min(2),
  viewerId: z.string().min(4).max(64),
  content: z.string().min(1).max(500)
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const roomSlug = searchParams.get("roomSlug");

  if (!roomSlug) {
    return NextResponse.json({ message: "roomSlug 쿼리가 필요합니다." }, { status: 400 });
  }

  const room = await prisma.room.findUnique({
    where: { slug: roomSlug },
    select: { id: true }
  });

  if (!room) {
    return NextResponse.json({ message: "방을 찾을 수 없습니다." }, { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: { roomId: room.id },
    orderBy: { createdAt: "asc" },
    take: 200,
    include: {
      _count: {
        select: { reads: true }
      }
    }
  });

  return NextResponse.json(messages);
}

export async function POST(req: Request) {
  const payload = await req.json();
  const parsed = createMessageSchema.safeParse(payload);

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

  const message = await prisma.message.create({
    data: {
      roomId: room.id,
      nickname: participant.nickname,
      viewerId: parsed.data.viewerId,
      content: parsed.data.content
    }
  });

  await prisma.messageRead.create({
    data: {
      roomId: room.id,
      messageId: message.id,
      participantId: participant.id
    }
  });

  return NextResponse.json(message, { status: 201 });
}
