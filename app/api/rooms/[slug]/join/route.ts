import { NextResponse } from "next/server";
import { z } from "zod";
import { createDatabaseUnavailableResponse, isDatabaseConfigured } from "@/lib/db-errors";
import { verifyPasscode } from "@/lib/passcode";
import { prisma } from "@/lib/prisma";

const joinSchema = z.object({
  viewerId: z.string().min(4).max(64),
  nickname: z.string().min(2).max(20),
  passcode: z.string().max(20).optional().or(z.literal(""))
});

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  if (!isDatabaseConfigured()) {
    return createDatabaseUnavailableResponse();
  }

  const payload = await req.json();
  const parsed = joinSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "입력값이 올바르지 않습니다.", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const room = await prisma.room.findUnique({ where: { slug: params.slug } });

    if (!room) {
      return NextResponse.json({ message: "방을 찾을 수 없습니다." }, { status: 404 });
    }

    if (room.isPrivate) {
      const isValid =
        !!room.passcodeHash &&
        !!room.passcodeSalt &&
        verifyPasscode(parsed.data.passcode || "", room.passcodeSalt, room.passcodeHash);

      if (!isValid) {
        return NextResponse.json({ message: "비밀번호가 올바르지 않습니다." }, { status: 403 });
      }
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
  } catch {
    return createDatabaseUnavailableResponse();
  }
}
