import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "@/lib/supabase";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "js-hero-academy-secret-key";

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json();

    if (!email || !name || !password) {
      return NextResponse.json({ error: "Email, name, and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const { data: existingUser } = await supabase
      .from("User")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const today = new Date().toISOString().split("T")[0];

    const { data: user, error: createError } = await supabase
      .from("User")
      .insert({ email, name, password: hashedPassword, lastLoginDate: today, streak: 1, xp: 0, coins: 0, role: "student" })
      .select()
      .single();

    if (createError) {
      console.error("Create user error:", createError);
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    return NextResponse.json({
      message: "Registration successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, xp: 0, coins: 0, streak: 1, role: "student" },
    }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}