import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("AIPrompt")
      .select("*", { count: "exact" })
      .order("createdAt", { ascending: false })
      .range(from, to);

    if (category) {
      query = query.eq("category", category);
    }

    const { data: prompts, count: total, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      prompts: prompts || [],
      total: total ?? 0,
      page,
      totalPages: Math.ceil((total ?? 0) / limit),
    });
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

    const { data: prompt, error } = await supabase
      .from("AIPrompt")
      .insert({
        name,
        description: description || null,
        systemPrompt,
        category: cat,
        isActive: isActive !== false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

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

    const { data: existing, error: findError } = await supabase
      .from("AIPrompt")
      .select("*")
      .eq("id", id)
      .single();

    if (findError || !existing) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    const validCategories = ["general", "tutoring", "code_review", "quiz_generation", "lesson_content"];
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (systemPrompt !== undefined) updateData.systemPrompt = systemPrompt;
    if (category && validCategories.includes(category)) updateData.category = category;
    if (isActive !== undefined) updateData.isActive = isActive;

    const { data: prompt, error: updateError } = await supabase
      .from("AIPrompt")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

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

    const { data: existing, error: findError } = await supabase
      .from("AIPrompt")
      .select("id")
      .eq("id", id)
      .single();

    if (findError || !existing) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from("AIPrompt")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Prompt deleted" });
  } catch (error) {
    console.error("Delete AI prompt error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}