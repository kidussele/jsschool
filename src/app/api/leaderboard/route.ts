import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // Get top users by XP
    const topUsers = await db.user.findMany({
      orderBy: { xp: "desc" },
      take: limit,
      select: {
        id: true,
        name: true,
        avatar: true,
        xp: true,
        streak: true,
        coins: true,
      },
    });

    // Upsert leaderboard entries with correct ranks
    const leaderboardEntries = await Promise.all(
      topUsers.map((user, index) =>
        db.leaderboard.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            xp: user.xp,
            rank: index + 1,
          },
          update: {
            xp: user.xp,
            rank: index + 1,
          },
        })
      )
    );

    const leaderboard = topUsers.map((user, index) => ({
      ...user,
      rank: index + 1,
      leaderboardId: leaderboardEntries[index].id,
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