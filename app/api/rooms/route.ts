import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPasscode } from "@/lib/passcode";

const roomSchema = z
  .object({
    name: z.string().min(2).max(40),
    slug: z
      .string()
      .min(2)
      .max(30)
      .regex(/^[a-z0-9-]+$/),
    concept: z.string().min(2).max(60),
    description: z.string().max(250).optional().or(z.literal("")),
    isPrivate: z.boolean().optional().default(false),
    passcode: z.string().min(4).max(20).optional().or(z.literal(""))
  })
  .refine((value) => !(value.isPrivate && !value.passcode), {
    message: "잠금방은 비밀번호를 설정해야 합니다.",
    path: ["passcode"]
  });

export async function GET() {
  const rooms = await prisma.room.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { messages: true, participants: true }
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { reads: true }
      }
    }
  });

  const mapped = rooms.map((room) => {
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
      createdAt: room.createdAt,
      messageCount: room._count.messages,
      participantCount: room._count.participants,
      unreadParticipantsCount
    };
  });

  return NextResponse.json(mapped);
}

export async function POST(req: Request) {
  const payload = await req.json();
  const parsed = roomSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "입력값이 올바르지 않습니다.", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const passcodeValues = parsed.data.isPrivate
    ? hashPasscode(parsed.data.passcode ?? "")
    : { passcodeHash: null, passcodeSalt: null };

  const room = await prisma.room.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      concept: parsed.data.concept,
      description: parsed.data.description || null,
      isPrivate: parsed.data.isPrivate,
      passcodeHash: passcodeValues.passcodeHash,
      passcodeSalt: passcodeValues.passcodeSalt
    }
  });

  return NextResponse.json(room, { status: 201 });
}
