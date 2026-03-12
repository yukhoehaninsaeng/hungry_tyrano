import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const settingsSchema = z.object({
  viewerId: z.string().min(4).max(64),
  nickname: z.string().min(2).max(20).optional(),
  layout: z.enum(["compact", "cozy"]).optional()
});

export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
  const payload = await req.json();
  const parsed = settingsSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "입력값이 올바르지 않습니다.", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const room = await prisma.room.findUnique({ where: { slug: params.slug }, select: { id: true } });
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
    return NextResponse.json({ message: "먼저 방에 입장해 주세요." }, { status: 404 });
  }

  const updated = await prisma.participant.update({
    where: { id: participant.id },
    data: {
      nickname: parsed.data.nickname ?? participant.nickname,
      layout: parsed.data.layout ?? participant.layout
    }
  });

  return NextResponse.json(updated);
}
