import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "30", 10);
    const action = searchParams.get("action") || "";

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("ActivityLog")
      .select("*, User(id, name, email, avatar)", { count: "exact" })
      .order("createdAt", { ascending: false })
      .range(from, to);

    if (action) {
      query = query.eq("action", action);
    }

    const { data: logs, count: total, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const enrichedLogs = (logs || []).map((l) => {
      const user = l.User as { id?: string; name?: string; email?: string; avatar?: string } | null;
      return {
        id: l.id,
        userId: l.userId,
        action: l.action,
        details: l.details,
        createdAt: new Date(l.createdAt).toISOString(),
        user: user
          ? {
              id: user.id,
              name: user.name,
              email: user.email,
              avatar: user.avatar,
            }
          : null,
      };
    });

    return NextResponse.json({
      logs: enrichedLogs,
      total: total ?? 0,
      page,
      totalPages: Math.ceil((total ?? 0) / limit),
    });
  } catch (error) {
    console.error("Activity logs error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}