import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

    const { data: user, error: userErr } = await supabase
      .from("User")
      .select("id")
      .eq("id", userId)
      .single();
    if (userErr || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if certificate already exists for this user + level
    const { data: existing, error: existingErr } = await supabase
      .from("Certificate")
      .select("*")
      .eq("userId", userId)
      .eq("levelName", levelName)
      .maybeSingle();

    if (existingErr) {
      console.error("Check existing certificate error:", existingErr);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json(
        { error: "Certificate already exists for this level", certificate: existing },
        { status: 409 }
      );
    }

    const certificateId = generateCertificateId();

    const { data: certificate, error: certErr } = await supabase
      .from("Certificate")
      .insert({
        userId,
        courseName,
        levelName,
        certificateId,
      })
      .select()
      .single();

    if (certErr) {
      console.error("Create certificate error:", certErr);
      return NextResponse.json({ error: "Failed to generate certificate" }, { status: 500 });
    }

    // Notify user
    await supabase.from("Notification").insert({
      userId,
      type: "certificate_earned",
      title: "Certificate Earned! 🏆",
      message: `You earned a certificate for completing "${levelName}"! Certificate ID: ${certificateId}`,
    });

    // Log activity
    await supabase.from("ActivityLog").insert({
      userId,
      action: "certificate_earned",
      details: JSON.stringify({ certificateId, courseName, levelName }),
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