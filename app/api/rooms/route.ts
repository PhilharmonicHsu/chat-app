import {NextResponse} from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// create a room
export async function POST() {
  const room = await prisma.room.create({
    data: {},
  });

  return NextResponse.json({ roomId: room.id });
}

// get rooms
export async function GET() {
  const rooms = await prisma.room.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(rooms);
}