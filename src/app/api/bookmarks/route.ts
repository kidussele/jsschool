import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const { data: bookmarks, error } = await supabase
      .from("Bookmark")
      .select("*")
      .eq("userId", userId)
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("Get bookmarks error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ bookmarks: bookmarks || [] });
  } catch (error) {
    console.error("Get bookmarks error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, lessonId, postId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    if (!lessonId && !postId) {
      return NextResponse.json(
        { error: "lessonId or postId is required" },
        { status: 400 }
      );
    }

    const { data: bookmark, error } = await supabase
      .from("Bookmark")
      .insert({
        userId,
        lessonId: lessonId || null,
        postId: postId || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Add bookmark error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ bookmark, message: "Bookmark added" }, { status: 201 });
  } catch (error) {
    console.error("Add bookmark error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { bookmarkId } = await request.json();

    if (!bookmarkId) {
      return NextResponse.json(
        { error: "bookmarkId is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("Bookmark")
      .delete()
      .eq("id", bookmarkId);

    if (error) {
      console.error("Remove bookmark error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Bookmark removed" });
  } catch (error) {
    console.error("Remove bookmark error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}