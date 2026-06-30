import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: replies, error } = await supabase
      .from("DiscussionReply")
      .select("*, user:userId(id, name, avatar)")
      .eq("postId", id)
      .order("createdAt", { ascending: true });

    if (error) {
      console.error("Get replies error:", error);
      return NextResponse.json({ error: "Failed to fetch replies" }, { status: 500 });
    }

    return NextResponse.json({ replies: replies ?? [] });
  } catch (error) {
    console.error("Get replies error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, content } = await request.json();

    if (!userId || !content) {
      return NextResponse.json(
        { error: "userId and content are required" },
        { status: 400 }
      );
    }

    // Check post exists
    const { data: post, error: postError } = await supabase
      .from("DiscussionPost")
      .select("id, userId, title, replyCount")
      .eq("id", id)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Create reply
    const { data: reply, error } = await supabase
      .from("DiscussionReply")
      .insert({ postId: id, userId, content })
      .select("*, user:userId(id, name, avatar)")
      .single();

    if (error) {
      console.error("Add reply error:", error);
      return NextResponse.json({ error: "Failed to add reply" }, { status: 500 });
    }

    // Increment reply count on post
    const currentReplyCount = (post.replyCount as number) ?? 0;
    await supabase
      .from("DiscussionPost")
      .update({ replyCount: currentReplyCount + 1 })
      .eq("id", id);

    // Notify post author (if different user)
    if (post.userId !== userId) {
      await supabase
        .from("Notification")
        .insert({
          userId: post.userId,
          type: "discussion_reply",
          title: "New Reply",
          message: `Someone replied to your post "${post.title}"`,
        });
    }

    return NextResponse.json({ reply, message: "Reply added" }, { status: 201 });
  } catch (error) {
    console.error("Add reply error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}