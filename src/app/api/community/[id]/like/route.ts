import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch current post to get current likes count
    const { data: post, error: fetchError } = await supabase
      .from("DiscussionPost")
      .select("id, likes")
      .eq("id", id)
      .single();

    if (fetchError || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const currentLikes = (post.likes as number) ?? 0;

    const { data: updated, error } = await supabase
      .from("DiscussionPost")
      .update({ likes: currentLikes + 1 })
      .eq("id", id)
      .select("likes")
      .single();

    if (error) {
      console.error("Like post error:", error);
      return NextResponse.json({ error: "Failed to like post" }, { status: 500 });
    }

    return NextResponse.json({ likes: (updated?.likes as number) ?? currentLikes + 1, message: "Post liked" });
  } catch (error) {
    console.error("Like post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}