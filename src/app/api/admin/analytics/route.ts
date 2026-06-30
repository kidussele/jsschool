import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

    const [
      userGrowthData,
      dailyActiveData,
      quizActivityData,
      challengeActivityData,
      topUsers,
      lessonCompletions,
      popularLessons,
      discussionStats,
      certificateCount,
      allQuizScores,
      recentActivity,
    ] = await Promise.all([
      // User growth - get users created in last 30 days
      db.user.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      // Daily active users
      db.user.findMany({
        where: { lastLoginDate: { gte: sevenDaysAgo.toISOString().split("T")[0] } },
        select: { lastLoginDate: true },
      }),
      // Quiz attempts
      db.quizAttempt.findMany({
        where: { completedAt: { gte: thirtyDaysAgo } },
        select: { completedAt: true, score: true, totalPoints: true },
        orderBy: { completedAt: "asc" },
      }),
      // Challenge submissions
      db.challengeSubmission.findMany({
        where: { submittedAt: { gte: thirtyDaysAgo } },
        select: { submittedAt: true },
        orderBy: { submittedAt: "asc" },
      }),
      // Top users
      db.user.findMany({
        orderBy: { xp: "desc" },
        take: 10,
        select: { id: true, name: true, xp: true, streak: true, createdAt: true },
      }),
      // Lesson completion distribution
      db.userProgress.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      // Popular lessons
      db.userProgress.groupBy({
        by: ["lessonId"],
        where: { status: "completed" },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
      // Discussion stats
      db.discussionPost.aggregate({ _count: { id: true }, _avg: { likes: true } }),
      // Certificates
      db.certificate.count(),
      // All quiz scores for distribution
      db.quizAttempt.findMany({ select: { score: true, totalPoints: true } }),
      // Recent activity
      db.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

    // Process user growth by date
    const growthMap = new Map<string, number>();
    for (const u of userGrowthData) {
      const date = u.createdAt.toISOString().split("T")[0];
      growthMap.set(date, (growthMap.get(date) || 0) + 1);
    }
    const userGrowth = Array.from(growthMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Process daily active by date
    const activeMap = new Map<string, number>();
    for (const u of dailyActiveData) {
      const date = u.lastLoginDate || "unknown";
      activeMap.set(date, (activeMap.get(date) || 0) + 1);
    }
    const dailyActive = Array.from(activeMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Process quiz activity by date
    const quizMap = new Map<string, { count: number; totalScore: number; total: number }>();
    for (const q of quizActivityData) {
      const date = q.completedAt.toISOString().split("T")[0];
      const existing = quizMap.get(date) || { count: 0, totalScore: 0, total: 0 };
      existing.count++;
      if (q.totalPoints > 0) {
        existing.totalScore += (q.score / q.totalPoints) * 100;
        existing.total++;
      }
      quizMap.set(date, existing);
    }
    const quizActivity = Array.from(quizMap.entries())
      .map(([date, data]) => ({
        date,
        count: data.count,
        avgScore: data.total > 0 ? Math.round((data.totalScore / data.total) * 10) / 10 : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Process challenge activity by date
    const challengeMap = new Map<string, number>();
    for (const c of challengeActivityData) {
      const date = c.submittedAt.toISOString().split("T")[0];
      challengeMap.set(date, (challengeMap.get(date) || 0) + 1);
    }
    const challengeActivity = Array.from(challengeMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Score distribution
    const scoreDistribution = { "0-25": 0, "26-50": 0, "51-75": 0, "76-100": 0 };
    for (const a of allQuizScores) {
      const pct = a.totalPoints > 0 ? Math.round((a.score / a.totalPoints) * 100) : 0;
      if (pct <= 25) scoreDistribution["0-25"]++;
      else if (pct <= 50) scoreDistribution["26-50"]++;
      else if (pct <= 75) scoreDistribution["51-75"]++;
      else scoreDistribution["76-100"]++;
    }

    return NextResponse.json({
      userGrowth,
      dailyActive,
      quizActivity,
      challengeActivity,
      topUsers: topUsers.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      })),
      lessonCompletions: lessonCompletions.map((l) => ({ status: l.status, count: l._count.id })),
      popularLessons: popularLessons.map((l) => ({ lessonId: l.lessonId, completions: l._count.id })),
      discussionStats: {
        totalPosts: discussionStats._count.id,
        avgLikes: discussionStats._avg.likes ? Math.round(discussionStats._avg.likes * 10) / 10 : 0,
      },
      certificateCount,
      scoreDistribution,
      recentActivity: recentActivity.map((a) => ({
        id: a.id,
        action: a.action,
        details: a.details,
        createdAt: a.createdAt.toISOString(),
        userName: a.user.name,
        userEmail: a.user.email,
      })),
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}