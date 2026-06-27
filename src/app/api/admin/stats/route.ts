import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [
      totalUsers,
      totalLessonsCompleted,
      totalQuizzesTaken,
      totalPosts,
      totalProjectsSubmitted,
      totalChallengesCompleted,
      totalCertificates,
      avgQuizScoreResult,
      activeUsersThisWeek,
    ] = await Promise.all([
      db.user.count(),
      db.userProgress.count({ where: { status: "completed" } }),
      db.quizAttempt.count(),
      db.discussionPost.count(),
      db.projectSubmission.count(),
      db.challengeSubmission.count({ where: { passed: true } }),
      db.certificate.count(),
      // Average quiz score
      db.quizAttempt.aggregate({
        _avg: { score: true },
        _count: true,
      }),
      // Active users this week
      db.user.count({
        where: {
          lastLoginDate: {
            gte: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0],
          },
        },
      }),
    ]);

    const avgQuizScore = avgQuizScoreResult._avg.score
      ? Math.round(avgQuizScoreResult._avg.score * 10) / 10
      : 0;

    // Total XP across all users
    const totalXpResult = await db.user.aggregate({ _sum: { xp: true } });
    const totalXP = totalXpResult._sum.xp || 0;

    // Achievement stats
    const totalAchievementsEarned = await db.userAchievement.count();
    const totalAchievements = await db.achievement.count();

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