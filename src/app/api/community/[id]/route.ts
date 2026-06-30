import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: post, error } = await supabase
      .from("DiscussionPost")
      .select("*, user:userId(id, name, avatar), replies(*, user:userId(id, name, avatar))")
      .eq("id", id)
      .single();

    if (error || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Sort replies by createdAt ascending (Supabase doesn't support nested ordering)
    if (post.replies && Array.isArray(post.replies)) {
      (post.replies as unknown[]).sort(
        (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Get post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { content, title } = await request.json();

    if (!content && !title) {
      return NextResponse.json(
        { error: "content or title is required" },
        { status: 400 }
      );
    }

    // Check post exists
    const { data: existing, error: fetchError } = await supabase
      .from("DiscussionPost")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const updateData: Record<string, string> = {};
    if (content) updateData.content = content;
    if (title) updateData.title = title;

    const { data: post, error } = await supabase
      .from("DiscussionPost")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update post error:", error);
      return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
    }

    return NextResponse.json({ post, message: "Post updated" });
  } catch (error) {
    console.error("Update post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check post exists
    const { data: existing, error: fetchError } = await supabase
      .from("DiscussionPost")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("DiscussionPost")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete post error:", error);
      return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
    }

    return NextResponse.json({ message: "Post deleted" });
  } catch (error) {
    console.error("Delete post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}