import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const [
      usersRes,
      lessonsCompletedRes,
      quizzesTakenRes,
      postsRes,
      projectsRes,
      challengesCompletedRes,
      certificatesRes,
      quizAttemptsRes,
      activeUsersRes,
      usersXpRes,
      userAchievementsRes,
      achievementsRes,
    ] = await Promise.all([
      supabase.from("User").select("id", { count: "exact", head: true }),
      supabase.from("UserProgress").select("id", { count: "exact", head: true }).eq("status", "completed"),
      supabase.from("QuizAttempt").select("id", { count: "exact", head: true }),
      supabase.from("DiscussionPost").select("id", { count: "exact", head: true }),
      supabase.from("ProjectSubmission").select("id", { count: "exact", head: true }),
      supabase.from("ChallengeSubmission").select("id", { count: "exact", head: true }).eq("passed", true),
      supabase.from("Certificate").select("id", { count: "exact", head: true }),
      // Average quiz score - fetch all scores
      supabase.from("QuizAttempt").select("score, totalPoints"),
      // Active users this week
      supabase.from("User").select("id", { count: "exact", head: true }).gte("lastLoginDate", new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]),
      // Total XP
      supabase.from("User").select("xp"),
      // Achievement stats
      supabase.from("UserAchievement").select("id", { count: "exact", head: true }),
      supabase.from("Achievement").select("id", { count: "exact", head: true }),
    ]);

    const totalUsers = usersRes.count ?? 0;
    const totalLessonsCompleted = lessonsCompletedRes.count ?? 0;
    const totalQuizzesTaken = quizzesTakenRes.count ?? 0;
    const totalPosts = postsRes.count ?? 0;
    const totalProjectsSubmitted = projectsRes.count ?? 0;
    const totalChallengesCompleted = challengesCompletedRes.count ?? 0;
    const totalCertificates = certificatesRes.count ?? 0;
    const activeUsersThisWeek = activeUsersRes.count ?? 0;
    const totalAchievementsEarned = userAchievementsRes.count ?? 0;
    const totalAchievements = achievementsRes.count ?? 0;

    // Average quiz score
    const attempts = quizAttemptsRes.data || [];
    let avgQuizScore = 0;
    if (attempts.length > 0) {
      const totalScore = attempts.reduce((sum, a) => {
        const pct = a.totalPoints > 0 ? (a.score / a.totalPoints) * 100 : 0;
        return sum + pct;
      }, 0);
      avgQuizScore = Math.round((totalScore / attempts.length) * 10) / 10;
    }

    // Total XP
    const allUsers = usersXpRes.data || [];
    const totalXP = allUsers.reduce((sum, u) => sum + (u.xp || 0), 0);

    return NextResponse.json({
      totalUsers,
      totalLessonsCompleted,
      totalQuizzesTaken,
      totalPosts,
      totalProjectsSubmitted,
      totalChallengesCompleted,
      totalCertificates,
      avgQuizScore,
      activeUsersThisWeek,
      totalXP,
      totalAchievementsEarned,
      totalAchievements,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}