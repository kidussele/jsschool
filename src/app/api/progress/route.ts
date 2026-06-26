import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { courseData } from "@/lib/course-data";

// Helper: check and award achievements
async function checkAchievements(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return [];

  const completedLessons = await db.userProgress.count({
    where: { userId, status: "completed" },
  });

  const totalLessons = courseData.reduce(
    (acc, level) => acc + level.modules.reduce((a, mod) => a + mod.lessons.length, 0),
    0
  );

  const perfectQuizzes = await db.quizAttempt.findMany({
    where: { userId, score: { gt: 0 } },
    include: { quiz: { include: { questions: true } } },
  });

  const hasPerfectQuiz = perfectQuizzes.some(
    (a) => a.totalQuestions > 0 && a.correctCount === a.totalQuestions
  );

  const challengeSubmissions = await db.challengeSubmission.count({
    where: { userId, passed: true },
  });

  const achievements = await db.achievement.findMany();
  const newlyEarned: string[] = [];

  const checks: Record<string, boolean> = {
    "first-steps": completedLessons >= 1,
    "quick-learner": completedLessons >= 10,
    "quiz-master": hasPerfectQuiz,
    "code-warrior": challengeSubmissions >= 5,
    "streak-king": user.streak >= 7,
    "halfway-hero": totalLessons > 0 && completedLessons >= Math.floor(totalLessons * 0.5),
    "javascript-hero": totalLessons > 0 && completedLessons >= totalLessons,
  };

  // Project builder check
  const projectSubmissions = await db.projectSubmission.count({
    where: { userId },
  });
  checks["project-builder"] = projectSubmissions >= 1;

  for (const achievement of achievements) {
    if (checks[achievement.id]) {
      const existing = await db.userAchievement.findUnique({
        where: {
          userId_achievementId: { userId, achievementId: achievement.id },
        },
      });
      if (!existing) {
        await db.userAchievement.create({
          data: { userId, achievementId: achievement.id },
        });
        // Award XP
        await db.user.update({
          where: { id: userId },
          data: { xp: { increment: achievement.xpReward } },
        });
        // Create notification
        await db.notification.create({
          data: {
            userId,
            type: "achievement_unlocked",
            title: "Achievement Unlocked!",
            message: `You earned "${achievement.name}" — +${achievement.xpReward} XP`,
          },
        });
        newlyEarned.push(achievement.id);
      }
    }
  }

  return newlyEarned;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const progress = await db.userProgress.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error("Get progress error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, lessonId, status, xpEarned, timeSpent } = await request.json();

    if (!userId || !lessonId || !status) {
      return NextResponse.json(
        { error: "userId, lessonId, and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = ["not_started", "in_progress", "completed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be not_started, in_progress, or completed" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const progress = await db.userProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      create: {
        userId,
        lessonId,
        status,
        xpEarned: xpEarned || 0,
        timeSpent: timeSpent || 0,
        completedAt: status === "completed" ? new Date() : null,
      },
      update: {
        status,
        xpEarned: xpEarned || 0,
        timeSpent: timeSpent || 0,
        completedAt: status === "completed" ? new Date() : undefined,
      },
    });

    // Award XP to user if completed
    if (status === "completed" && xpEarned > 0) {
      await db.user.update({
        where: { id: userId },
        data: {
          xp: { increment: xpEarned },
          totalTimeSpent: { increment: Math.floor((timeSpent || 0) / 60) },
        },
      });

      // Create notification
      await db.notification.create({
        data: {
          userId,
          type: "course_completed",
          title: "Lesson Completed!",
          message: `You earned ${xpEarned} XP for completing a lesson.`,
        },
      });

      // Log activity
      await db.activityLog.create({
        data: {
          userId,
          action: "lesson_completed",
          details: JSON.stringify({ lessonId, xpEarned }),
        },
      });
    }

    // Check achievements
    const newAchievements = await checkAchievements(userId);

    return NextResponse.json({
      progress,
      newAchievements,
      message: "Progress saved successfully",
    });
  } catch (error) {
    console.error("Save progress error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}