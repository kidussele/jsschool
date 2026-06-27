import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function generateCertificateId(): string {
  return (
    "JSHA-" +
    Date.now().toString(36).toUpperCase() +
    "-" +
    Math.random().toString(36).substring(2, 6).toUpperCase()
  );
}

export async function POST(request: NextRequest) {
  try {
    const { userId, courseName, levelName } = await request.json();

    if (!userId || !courseName || !levelName) {
      return NextResponse.json(
        { error: "userId, courseName, and levelName are required" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if certificate already exists for this user + level
    const existing = await db.certificate.findFirst({
      where: { userId, levelName },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Certificate already exists for this level", certificate: existing },
        { status: 409 }
      );
    }

    const certificateId = generateCertificateId();

    const certificate = await db.certificate.create({
      data: {
        userId,
        courseName,
        levelName,
        certificateId,
      },
    });

    // Notify user
    await db.notification.create({
      data: {
        userId,
        type: "certificate_earned",
        title: "Certificate Earned! 🏆",
        message: `You earned a certificate for completing "${levelName}"! Certificate ID: ${certificateId}`,
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        userId,
        action: "certificate_earned",
        details: JSON.stringify({ certificateId, courseName, levelName }),
      },
    });

    return NextResponse.json(
      { certificate, message: "Certificate generated successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Generate certificate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}