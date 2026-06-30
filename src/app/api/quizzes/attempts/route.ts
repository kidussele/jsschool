import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const quizId = searchParams.get("quizId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    let query = supabase
      .from("QuizAttempt")
      .select("*, quiz:Quiz(id,title,difficulty)")
      .eq("userId", userId)
      .order("completedAt", { ascending: false });

    if (quizId) {
      query = query.eq("quizId", quizId);
    }

    const { data: attempts, error } = await query;

    if (error) {
      console.error("Get quiz attempts error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ attempts: attempts || [] });
  } catch (error) {
    console.error("Get quiz attempts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, quizId, answers, timeTaken } = await request.json();

    if (!userId || !quizId || !answers) {
      return NextResponse.json(
        { error: "userId, quizId, and answers are required" },
        { status: 400 }
      );
    }

    const { data: quiz, error: quizErr } = await supabase
      .from("Quiz")
      .select("*, questions:QuizQuestion(*)")
      .eq("id", quizId)
      .single();

    if (quizErr || !quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Calculate score
    let correctCount = 0;
    let totalPoints = 0;

    const sortedQuestions = [...(quiz.questions || [])].sort((a, b) => a.order - b.order);

    for (const question of sortedQuestions) {
      totalPoints += question.points;
      const userAnswer = answers[question.id];
      if (userAnswer !== undefined) {
        // For multiple_answer, userAnswer is an array
        if (question.type === "multiple_answer") {
          const correct = Array.isArray(userAnswer) && JSON.stringify([...userAnswer].sort()) === JSON.stringify(JSON.parse(question.correctAnswer).sort());
          if (correct) correctCount++;
        } else {
          if (String(userAnswer).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase()) {
            correctCount++;
          }
        }
      }
    }

    const score = sortedQuestions
      .filter((q) => {
        const userAnswer = answers[q.id];
        if (q.type === "multiple_answer") {
          return Array.isArray(userAnswer) && JSON.stringify([...userAnswer].sort()) === JSON.stringify(JSON.parse(q.correctAnswer).sort());
        }
        return userAnswer !== undefined && String(userAnswer).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
      })
      .reduce((sum, q) => sum + q.points, 0);

    // Save attempt
    const { data: attempt, error: attemptErr } = await supabase
      .from("QuizAttempt")
      .insert({
        userId,
        quizId,
        score,
        totalPoints,
        correctCount,
        totalQuestions: sortedQuestions.length,
        answers: JSON.stringify(answers),
        timeTaken: timeTaken || 0,
      })
      .select()
      .single();

    if (attemptErr) {
      console.error("Create quiz attempt error:", attemptErr);
      return NextResponse.json({ error: "Failed to save quiz attempt" }, { status: 500 });
    }

    // Award XP (10 XP per correct answer)
    const xpEarned = correctCount * 10;
    if (xpEarned > 0) {
      const { data: currentUser } = await supabase
        .from("User")
        .select("xp")
        .eq("id", userId)
        .single();
      if (currentUser) {
        await supabase
          .from("User")
          .update({ xp: (currentUser.xp || 0) + xpEarned })
          .eq("id", userId);
      }
    }

    // Create notification
    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
    await supabase.from("Notification").insert({
      userId,
      type: "quiz_graded",
      title: "Quiz Completed!",
      message: `You scored ${percentage}% on "${quiz.title}" — +${xpEarned} XP`,
    });

    // Log activity
    await supabase.from("ActivityLog").insert({
      userId,
      action: "quiz_taken",
      details: JSON.stringify({ quizId, score, percentage, xpEarned }),
    });

    // Check certificate eligibility — if user scores 100%, check if all quizzes for a level are passed
    let certificateEligible = false;
    if (percentage === 100) {
      certificateEligible = true;
    }

    return NextResponse.json({
      attempt,
      score,
      totalPoints,
      correctCount,
      totalQuestions: sortedQuestions.length,
      percentage,
      xpEarned,
      certificateEligible,
      message: "Quiz submitted successfully",
    });
  } catch (error) {
    console.error("Submit quiz error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}