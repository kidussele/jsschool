import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const lessonId = searchParams.get("lessonId");

    if (!userId || !lessonId) {
      return NextResponse.json(
        { error: "userId and lessonId are required" },
        { status: 400 }
      );
    }

    const note = await db.lessonNote.findUnique({
      where: {
        userId_lessonId: { userId, lessonId },
      },
    });

    return NextResponse.json({ note });
  } catch (error) {
    console.error("Get note error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, lessonId, content } = await request.json();

    if (!userId || !lessonId || content === undefined) {
      return NextResponse.json(
        { error: "userId, lessonId, and content are required" },
        { status: 400 }
      );
    }

    const note = await db.lessonNote.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      create: { userId, lessonId, content },
      update: { content },
    });

    return NextResponse.json({ note, message: "Note saved successfully" });
  } catch (error) {
    console.error("Save note error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}