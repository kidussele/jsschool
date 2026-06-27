import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const replies = await db.discussionReply.findMany({
      where: { postId: id },
      orderBy: { createdAt: "asc" },
      include: {
      

      },
    });

    return NextResponse.json({ replies });
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

    const post = await db.discussionPost.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const reply = await db.discussionReply.create({
      data: { postId: id, userId, content },
      include: {

      },
    });

    // Increment reply count on post
    await db.discussionPost.update({
      where: { id },
      data: { replyCount: { increment: 1 } },
    });

    // Notify post author
    if (post.userId !== userId) {
      await db.notification.create({
        data: {
          userId: post.userId,
          type: "discussion_reply",
          title: "New Reply",
          message: `Someone replied to your post "${post.title}"`,
        },
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