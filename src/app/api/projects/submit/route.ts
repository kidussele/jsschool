import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const projectId = searchParams.get("projectId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    let query = supabase
      .from("ProjectSubmission")
      .select("*, project:Project(id,title,difficulty)")
      .eq("userId", userId)
      .order("submittedAt", { ascending: false });

    if (projectId) {
      query = query.eq("projectId", projectId);
    }

    const { data: submissions, error } = await query;

    if (error) {
      console.error("Get submissions error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ submissions: submissions || [] });
  } catch (error) {
    console.error("Get submissions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, projectId, codeUrl, screenshotUrl } = await request.json();

    if (!userId || !projectId) {
      return NextResponse.json(
        { error: "userId and projectId are required" },
        { status: 400 }
      );
    }

    const { data: project, error: projErr } = await supabase
      .from("Project")
      .select("id,title")
      .eq("id", projectId)
      .single();

    if (projErr || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const { data: submission, error: subErr } = await supabase
      .from("ProjectSubmission")
      .insert({
        userId,
        projectId,
        codeUrl: codeUrl || null,
        screenshotUrl: screenshotUrl || null,
        status: "pending",
      })
      .select()
      .single();

    if (subErr) {
      console.error("Create submission error:", subErr);
      return NextResponse.json({ error: "Failed to submit project" }, { status: 500 });
    }

    await supabase.from("Notification").insert({
      userId,
      type: "general",
      title: "Project Submitted! 🚀",
      message: `Your submission for "${project.title}" is pending review.`,
    });

    await supabase.from("ActivityLog").insert({
      userId,
      action: "project_submitted",
      details: JSON.stringify({ projectId, projectTitle: project.title }),
    });

    return NextResponse.json(
      { submission, message: "Project submitted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Submit project error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}