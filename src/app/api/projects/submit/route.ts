import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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

    const where: Record<string, unknown> = { userId };
    if (projectId) where.projectId = projectId;

    const submissions = await db.projectSubmission.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      include: {
        project: { select: { id: true, title: true, difficulty: true } },
      },
    });

    return NextResponse.json({ submissions });
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

    const project = await db.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const submission = await db.projectSubmission.create({
      data: {
        userId,
        projectId,
        codeUrl: codeUrl || null,
        screenshotUrl: screenshotUrl || null,
        status: "pending",
      },
    });

    await db.notification.create({
      data: {
        userId,
        type: "general",
        title: "Project Submitted! 🚀",
        message: `Your submission for "${project.title}" is pending review.`,
      },
    });

    await db.activityLog.create({
      data: {
        userId,
        action: "project_submitted",
        details: JSON.stringify({ projectId, projectTitle: project.title }),
      },
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