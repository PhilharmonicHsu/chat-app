import {NextRequest, NextResponse} from 'next/server';
import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient();

// get messages by room
export async function GET(req: NextRequest) {
  const {searchParams} = new URL(req.url);
  const roomId = searchParams.get('roomId');

  if (!roomId) {
    return NextResponse.json({error: "roomId is required"}, {status: 400});
  }

  const messages = await prisma.room.findmany({
    where: {roomId: roomId},
    orderBy: {createdAt: 'asc'}
  })

  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { roomId, nickname, content } = body;

  if (!roomId || !nickname || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {roomId, nickname, content}
  })

  return NextResponse.json(message);
}