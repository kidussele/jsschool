import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

    const { data: note, error } = await supabase
      .from("LessonNote")
      .select("*")
      .eq("userId", userId)
      .eq("lessonId", lessonId)
      .maybeSingle();

    if (error) {
      console.error("Get note error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

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

    const { data: note, error } = await supabase
      .from("LessonNote")
      .upsert({ userId, lessonId, content }, { onConflict: "userId,lessonId" })
      .select()
      .single();

    if (error) {
      console.error("Save note error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ note, message: "Note saved successfully" });
  } catch (error) {
    console.error("Save note error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}