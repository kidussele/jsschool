import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("DiscussionPost")
      .select("*, user:userId(id, name, avatar)", { count: "exact" })
      .order("isPinned", { ascending: false })
      .order("createdAt", { ascending: false })
      .range(from, to);

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data: posts, error, count } = await query;

    if (error) {
      console.error("Get posts error:", error);
      return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }

    const total = count ?? 0;

    return NextResponse.json({
      posts: posts ?? [],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get posts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, title, content, tags } = await request.json();

    if (!userId || !title || !content) {
      return NextResponse.json(
        { error: "userId, title, and content are required" },
        { status: 400 }
      );
    }

    const insertData: Record<string, unknown> = { userId, title, content };
    if (tags) {
      insertData.tags = JSON.stringify(tags);
    }

    const { data: post, error } = await supabase
      .from("DiscussionPost")
      .insert(insertData)
      .select("*, user:userId(id, name, avatar)")
      .single();

    if (error) {
      console.error("Create post error:", error);
      return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }

    return NextResponse.json({ post, message: "Post created" }, { status: 201 });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}