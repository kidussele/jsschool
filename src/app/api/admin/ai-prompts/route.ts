import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (category) {
      where.category = category;
    }

    const [prompts, total] = await Promise.all([
      db.aIPrompt.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.aIPrompt.count({ where }),
    ]);

    return NextResponse.json({ prompts, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("List AI prompts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, systemPrompt, category, isActive } = body;

    if (!name || !systemPrompt) {
      return NextResponse.json({ error: "Name and systemPrompt are required" }, { status: 400 });
    }

    const validCategories = ["general", "tutoring", "code_review", "quiz_generation", "lesson_content"];
    const cat = validCategories.includes(category) ? category : "general";

    const prompt = await db.aIPrompt.create({
      data: {
        name,
        description: description || null,
        systemPrompt,
        category: cat,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ prompt }, { status: 201 });
  } catch (error) {
    console.error("Create AI prompt error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, systemPrompt, category, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Prompt ID is required" }, { status: 400 });
    }

    const existing = await db.aIPrompt.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    const validCategories = ["general", "tutoring", "code_review", "quiz_generation", "lesson_content"];

    const prompt = await db.aIPrompt.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        description: description !== undefined ? description : existing.description,
        systemPrompt: systemPrompt ?? existing.systemPrompt,
        category: category && validCategories.includes(category) ? category : existing.category,
        isActive: isActive !== undefined ? isActive : existing.isActive,
      },
    });

    return NextResponse.json({ prompt });
  } catch (error) {
    console.error("Update AI prompt error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Prompt ID is required" }, { status: 400 });
    }

    const existing = await db.aIPrompt.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    await db.aIPrompt.delete({ where: { id } });
    return NextResponse.json({ message: "Prompt deleted" });
  } catch (error) {
    console.error("Delete AI prompt error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}