import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const joinSchema = z.object({
  viewerId: z.string().min(4).max(64),
  nickname: z.string().min(2).max(20),
  passcode: z.string().max(20).optional().or(z.literal(""))
});

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const payload = await req.json();
  const parsed = joinSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "입력값이 올바르지 않습니다.", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const room = await prisma.room.findUnique({ where: { slug: params.slug } });

  if (!room) {
    return NextResponse.json({ message: "방을 찾을 수 없습니다." }, { status: 404 });
  }

  if (room.isPrivate && room.passcode !== (parsed.data.passcode || "")) {
    return NextResponse.json({ message: "입장 코드가 올바르지 않습니다." }, { status: 403 });
  }

  const participant = await prisma.participant.upsert({
    where: {
      roomId_viewerId: {
        roomId: room.id,
        viewerId: parsed.data.viewerId
      }
    },
    update: { nickname: parsed.data.nickname },
    create: {
      roomId: room.id,
      viewerId: parsed.data.viewerId,
      nickname: parsed.data.nickname
    }
  });

  return NextResponse.json({ room, participant });
}
