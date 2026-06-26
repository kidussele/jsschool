import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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

    const snippets = await db.codeSnippet.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ snippets });
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

    const snippet = await db.codeSnippet.create({
      data: {
        userId,
        title,
        html: html || "",
        css: css || "",
        javascript: javascript || "",
        isPublic: isPublic || false,
      },
    });

    return NextResponse.json({ snippet, message: "Snippet saved" }, { status: 201 });
  } catch (error) {
    console.error("Save snippet error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}