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

    const { data: snippets, error } = await supabase
      .from("CodeSnippet")
      .select("*")
      .eq("userId", userId)
      .order("updatedAt", { ascending: false });

    if (error) {
      console.error("Get snippets error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ snippets: snippets || [] });
  } catch (error) {
    console.error("Get snippets error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, title, html, css, javascript, isPublic } = await request.json();

    if (!userId || !title) {
      return NextResponse.json(
        { error: "userId and title are required" },
        { status: 400 }
      );
    }

    const { data: snippet, error } = await supabase
      .from("CodeSnippet")
      .insert({
        userId,
        title,
        html: html || "",
        css: css || "",
        javascript: javascript || "",
        isPublic: isPublic || false,
      })
      .select()
      .single();

    if (error) {
      console.error("Save snippet error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ snippet, message: "Snippet saved" }, { status: 201 });
  } catch (error) {
    console.error("Save snippet error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}