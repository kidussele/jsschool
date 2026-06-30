import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { courseData } from "@/lib/course-data";

// Helper: increment a user's XP atomically via fetch-then-update
async function incrementUserXp(userId: string, xpAmount: number, timeMinutes?: number) {
  const { data: user, error: fetchErr } = await supabase
    .from("User")
    .select("xp, totalTimeSpent")
    .eq("id", userId)
    .single();
  if (fetchErr || !user) return;

  const updateData: Record<string, unknown> = {
    xp: (user.xp || 0) + xpAmount,
  };
  if (timeMinutes !== undefined) {
    updateData.totalTimeSpent = (user.totalTimeSpent || 0) + timeMinutes;
  }

  await supabase.from("User").update(updateData).eq("id", userId);
}

// Helper: check and award achievements
async function checkAchievements(userId: string) {
  const { data: user, error: userErr } = await supabase
    .from("User")
    .select("*")
    .eq("id", userId)
    .single();
  if (userErr || !user) return [];

  const { count: completedLessons } = await supabase
    .from("UserProgress")
    .select("id", { count: "exact", head: true })
    .eq("userId", userId)
    .eq("status", "completed");

  const totalLessons = courseData.reduce(
    (acc, level) => acc + level.modules.reduce((a, mod) => a + mod.lessons.length, 0),
    0
  );

  const { data: perfectQuizzes } = await supabase
    .from("QuizAttempt")
    .select("*")
    .eq("userId", userId)
    .gt("score", 0);

  const hasPerfectQuiz = (perfectQuizzes || []).some(
    (a) => a.totalQuestions > 0 && a.correctCount === a.totalQuestions
  );

  const { count: challengeSubmissions } = await supabase
    .from("ChallengeSubmission")
    .select("id", { count: "exact", head: true })
    .eq("userId", userId)
    .eq("passed", true);

  const { data: achievements, error: achErr } = await supabase
    .from("Achievement")
    .select("*");
  if (achErr || !achievements) return [];

  const newlyEarned: string[] = [];

  const checks: Record<string, boolean> = {
    "first-steps": (completedLessons || 0) >= 1,
    "quick-learner": (completedLessons || 0) >= 10,
    "quiz-master": hasPerfectQuiz,
    "code-warrior": (challengeSubmissions || 0) >= 5,
    "streak-king": (user.streak || 0) >= 7,
    "halfway-hero": totalLessons > 0 && (completedLessons || 0) >= Math.floor(totalLessons * 0.5),
    "javascript-hero": totalLessons > 0 && (completedLessons || 0) >= totalLessons,
  };

  // Project builder check
  const { count: projectSubmissions } = await supabase
    .from("ProjectSubmission")
    .select("id", { count: "exact", head: true })
    .eq("userId", userId);
  checks["project-builder"] = (projectSubmissions || 0) >= 1;

  for (const achievement of achievements) {
    if (checks[achievement.id]) {
      const { data: existing } = await supabase
        .from("UserAchievement")
        .select("id")
        .eq("userId", userId)
        .eq("achievementId", achievement.id)
        .maybeSingle();
      if (!existing) {
        await supabase.from("UserAchievement").insert({
          userId,
          achievementId: achievement.id,
        });
        // Award XP
        await incrementUserXp(userId, achievement.xpReward);
        // Create notification
        await supabase.from("Notification").insert({
          userId,
          type: "achievement_unlocked",
          title: "Achievement Unlocked!",
          message: `You earned "${achievement.name}" — +${achievement.xpReward} XP`,
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

    const { data: progress, error } = await supabase
      .from("UserProgress")
      .select("*")
      .eq("userId", userId)
      .order("updatedAt", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
    }

    return NextResponse.json({ progress: progress || [] });
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

    const { data: user, error: userErr } = await supabase
      .from("User")
      .select("id")
      .eq("id", userId)
      .single();
    if (userErr || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const upsertData = {
      userId,
      lessonId,
      status,
      xpEarned: xpEarned || 0,
      timeSpent: timeSpent || 0,
      completedAt: status === "completed" ? new Date().toISOString() : null,
    };

    const { data: progress, error: upsertErr } = await supabase
      .from("UserProgress")
      .upsert(upsertData, { onConflict: "userId,lessonId" })
      .select()
      .single();

    if (upsertErr) {
      console.error("Upsert progress error:", upsertErr);
      return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
    }

    // Award XP to user if completed
    if (status === "completed" && xpEarned > 0) {
      await incrementUserXp(userId, xpEarned, Math.floor((timeSpent || 0) / 60));

      // Create notification
      await supabase.from("Notification").insert({
        userId,
        type: "course_completed",
        title: "Lesson Completed!",
        message: `You earned ${xpEarned} XP for completing a lesson.`,
      });

      // Log activity
      await supabase.from("ActivityLog").insert({
        userId,
        action: "lesson_completed",
        details: JSON.stringify({ lessonId, xpEarned }),
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