import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // Get top users by XP
    const { data: topUsers, error } = await supabase
      .from("User")
      .select("id, name, avatar, xp, streak, coins")
      .order("xp", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Leaderboard error:", error);
      return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
    }

    // Upsert leaderboard entries with correct ranks
    if (topUsers && topUsers.length > 0) {
      const upsertEntries = topUsers.map((user, index) => ({
        userId: user.id,
        xp: user.xp,
        rank: index + 1,
      }));

      // Use upsert via onConflict
      const { error: upsertError } = await supabase
        .from("Leaderboard")
        .upsert(upsertEntries, { onConflict: "userId" });

      if (upsertError) {
        console.error("Leaderboard upsert error:", upsertError);
        // Non-fatal: still return the leaderboard data
      }
    }

    const leaderboard = (topUsers ?? []).map((user, index) => ({
      ...user,
      rank: index + 1,
      leaderboardId: user.id, // Will be the matching leaderboard entry's id
    }));

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}