import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

    const [
      userGrowthRes,
      dailyActiveRes,
      quizActivityRes,
      challengeActivityRes,
      topUsersRes,
      lessonCompletionsRes,
      popularLessonsRes,
      discussionPostsRes,
      certificateRes,
      allQuizScoresRes,
      recentActivityRes,
    ] = await Promise.all([
      // User growth - users created in last 30 days
      supabase
        .from("User")
        .select("createdAt")
        .gte("createdAt", thirtyDaysAgo.toISOString())
        .order("createdAt", { ascending: true }),
      // Daily active users
      supabase
        .from("User")
        .select("lastLoginDate")
        .gte("lastLoginDate", sevenDaysAgo.toISOString().split("T")[0]),
      // Quiz attempts in last 30 days
      supabase
        .from("QuizAttempt")
        .select("completedAt, score, totalPoints")
        .gte("completedAt", thirtyDaysAgo.toISOString())
        .order("completedAt", { ascending: true }),
      // Challenge submissions in last 30 days
      supabase
        .from("ChallengeSubmission")
        .select("submittedAt")
        .gte("submittedAt", thirtyDaysAgo.toISOString())
        .order("submittedAt", { ascending: true }),
      // Top 10 users by XP
      supabase
        .from("User")
        .select("id, name, xp, streak, createdAt")
        .order("xp", { ascending: false })
        .limit(10),
      // Lesson completion distribution - fetch all progress statuses
      supabase.from("UserProgress").select("status"),
      // Popular lessons - fetch completed progress with lessonId
      supabase.from("UserProgress").select("lessonId").eq("status", "completed"),
      // Discussion stats
      supabase.from("DiscussionPost").select("likes"),
      // Certificates count
      supabase.from("Certificate").select("id", { count: "exact", head: true }),
      // All quiz scores for distribution
      supabase.from("QuizAttempt").select("score, totalPoints"),
      // Recent activity with user relation
      supabase
        .from("ActivityLog")
        .select("id, action, details, createdAt, userId, User(name, email)")
        .order("createdAt", { ascending: false })
        .limit(20),
    ]);

    // Process user growth by date
    const growthMap = new Map<string, number>();
    for (const u of userGrowthRes.data || []) {
      const date = new Date(u.createdAt).toISOString().split("T")[0];
      growthMap.set(date, (growthMap.get(date) || 0) + 1);
    }
    const userGrowth = Array.from(growthMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Process daily active by date
    const activeMap = new Map<string, number>();
    for (const u of dailyActiveRes.data || []) {
      const date = u.lastLoginDate || "unknown";
      activeMap.set(date, (activeMap.get(date) || 0) + 1);
    }
    const dailyActive = Array.from(activeMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Process quiz activity by date
    const quizMap = new Map<string, { count: number; totalScore: number; total: number }>();
    for (const q of quizActivityRes.data || []) {
      const date = new Date(q.completedAt).toISOString().split("T")[0];
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
    for (const c of challengeActivityRes.data || []) {
      const date = new Date(c.submittedAt).toISOString().split("T")[0];
      challengeMap.set(date, (challengeMap.get(date) || 0) + 1);
    }
    const challengeActivity = Array.from(challengeMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Lesson completion distribution - group by status in JS
    const completionMap = new Map<string, number>();
    for (const p of lessonCompletionsRes.data || []) {
      const status = p.status || "unknown";
      completionMap.set(status, (completionMap.get(status) || 0) + 1);
    }
    const lessonCompletions = Array.from(completionMap.entries())
      .map(([status, count]) => ({ status, count }));

    // Popular lessons - group by lessonId in JS
    const lessonMap = new Map<string, number>();
    for (const p of popularLessonsRes.data || []) {
      const lid = p.lessonId || "unknown";
      lessonMap.set(lid, (lessonMap.get(lid) || 0) + 1);
    }
    const popularLessons = Array.from(lessonMap.entries())
      .map(([lessonId, completions]) => ({ lessonId, completions }))
      .sort((a, b) => b.completions - a.completions)
      .slice(0, 10);

    // Discussion stats - compute in JS
    const posts = discussionPostsRes.data || [];
    const totalPosts = posts.length;
    let avgLikes = 0;
    if (posts.length > 0) {
      const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);
      avgLikes = Math.round((totalLikes / posts.length) * 10) / 10;
    }

    // Score distribution
    const scoreDistribution = { "0-25": 0, "26-50": 0, "51-75": 0, "76-100": 0 };
    for (const a of allQuizScoresRes.data || []) {
      const pct = a.totalPoints > 0 ? Math.round((a.score / a.totalPoints) * 100) : 0;
      if (pct <= 25) scoreDistribution["0-25"]++;
      else if (pct <= 50) scoreDistribution["26-50"]++;
      else if (pct <= 75) scoreDistribution["51-75"]++;
      else scoreDistribution["76-100"]++;
    }

    // Recent activity - extract user data from join
    const recentActivity = (recentActivityRes.data || []).map((a) => {
      const user = a.User as { name?: string; email?: string } | null;
      return {
        id: a.id,
        action: a.action,
        details: a.details,
        createdAt: new Date(a.createdAt).toISOString(),
        userName: user?.name || "Unknown",
        userEmail: user?.email || "",
      };
    });

    return NextResponse.json({
      userGrowth,
      dailyActive,
      quizActivity,
      challengeActivity,
      topUsers: (topUsersRes.data || []).map((u) => ({
        ...u,
        createdAt: new Date(u.createdAt).toISOString(),
      })),
      lessonCompletions,
      popularLessons,
      discussionStats: { totalPosts, avgLikes },
      certificateCount: certificateRes.count ?? 0,
      scoreDistribution,
      recentActivity,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}