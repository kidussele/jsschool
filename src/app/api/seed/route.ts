import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { quizData } from "@/lib/quiz-data";
import { projectData } from "@/lib/project-data";

export async function POST() {
  try {
    const results: Record<string, number> = {
      achievements: 0,
      quizzes: 0,
      questions: 0,
      projects: 0,
      challenges: 0,
      adminUser: 0,
    };

    // 1. Seed Achievements
    const achievements = [
      {
        id: "first-steps",
        name: "First Steps",
        description: "Complete your first lesson",
        icon: "🎯",
        xpReward: 50,
        condition: JSON.stringify({ type: "lessons_completed", count: 1 }),
      },
      {
        id: "quick-learner",
        name: "Quick Learner",
        description: "Complete 10 lessons",
        icon: "⚡",
        xpReward: 200,
        condition: JSON.stringify({ type: "lessons_completed", count: 10 }),
      },
      {
        id: "quiz-master",
        name: "Quiz Master",
        description: "Score 100% on any quiz",
        icon: "🧠",
        xpReward: 150,
        condition: JSON.stringify({ type: "perfect_quiz" }),
      },
      {
        id: "code-warrior",
        name: "Code Warrior",
        description: "Complete 5 coding challenges",
        icon: "⚔️",
        xpReward: 300,
        condition: JSON.stringify({ type: "challenges_completed", count: 5 }),
      },
      {
        id: "streak-king",
        name: "Streak King",
        description: "Maintain a 7-day login streak",
        icon: "🔥",
        xpReward: 200,
        condition: JSON.stringify({ type: "streak", count: 7 }),
      },
      {
        id: "project-builder",
        name: "Project Builder",
        description: "Submit your first project",
        icon: "🏗️",
        xpReward: 250,
        condition: JSON.stringify({ type: "projects_submitted", count: 1 }),
      },
      {
        id: "halfway-hero",
        name: "Halfway Hero",
        description: "Complete 50% of all lessons",
        icon: "🌟",
        xpReward: 500,
        condition: JSON.stringify({ type: "lessons_percentage", percentage: 50 }),
      },
      {
        id: "javascript-hero",
        name: "JavaScript Hero",
        description: "Complete all lessons",
        icon: "🏆",
        xpReward: 1000,
        condition: JSON.stringify({ type: "lessons_percentage", percentage: 100 }),
      },
    ];

    for (const a of achievements) {
      await db.achievement.upsert({
        where: { id: a.id },
        create: a,
        update: { name: a.name, description: a.description, xpReward: a.xpReward },
      });
      results.achievements++;
    }

    // 2. Seed Quizzes from quizData
    for (const quiz of quizData) {
      const dbQuiz = await db.quiz.upsert({
        where: { id: quiz.id },
        create: {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          difficulty: quiz.difficulty,
          moduleId: quiz.moduleId || null,
        },
        update: {
          title: quiz.title,
          description: quiz.description,
          difficulty: quiz.difficulty,
        },
      });

      results.quizzes++;

      for (const q of quiz.questions) {
        await db.quizQuestion.upsert({
          where: { id: q.id },
          create: {
            id: q.id,
            quizId: dbQuiz.id,
            question: q.question,
            type: q.type,
            options: q.options ? JSON.stringify(q.options) : null,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || null,
            codeSnippet: q.codeSnippet || null,
            points: q.points,
            order: quiz.questions.indexOf(q),
          },
          update: {
            question: q.question,
            correctAnswer: q.correctAnswer,
            points: q.points,
          },
        });
        results.questions++;
      }
    }

    // 3. Seed Projects from projectData
    for (const proj of projectData) {
      await db.project.upsert({
        where: { id: proj.id },
        create: {
          id: proj.id,
          title: proj.title,
          description: proj.description,
          difficulty: proj.difficulty,
          category: proj.category,
          duration: proj.duration,
          skills: JSON.stringify(proj.skills),
          steps: JSON.stringify(proj.steps),
        },
        update: {
          title: proj.title,
          description: proj.description,
        },
      });
      results.projects++;
    }

    // 4. Seed Daily Challenges
    const { dailyChallenges } = await import("@/lib/quiz-data");
    const today = new Date().toISOString().split("T")[0];

    for (let i = 0; i < dailyChallenges.length; i++) {
      const dc = dailyChallenges[i];
      const date = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];

      await db.dailyChallenge.upsert({
        where: { id: dc.id },
        create: {
          id: dc.id,
          title: dc.title,
          description: dc.description,
          difficulty: dc.difficulty,
          codeTemplate: dc.codeTemplate,
          testCases: JSON.stringify(dc.testCases),
          solution: dc.solution,
          xpReward: dc.xpReward,
          date,
        },
        update: {
          title: dc.title,
          description: dc.description,
          difficulty: dc.difficulty,
          codeTemplate: dc.codeTemplate,
          testCases: JSON.stringify(dc.testCases),
          solution: dc.solution,
          xpReward: dc.xpReward,
        },
      });
      results.challenges++;
    }

    // 5. Seed Admin User
    const adminEmail = "admin@jshero.academy";
    const existingAdmin = await db.user.findUnique({ where: { email: adminEmail } });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 12);
      await db.user.create({
        data: {
          email: adminEmail,
          name: "Admin",
          password: hashedPassword,
          role: "admin",
          xp: 0,
          lastLoginDate: today,
        },
      });
      results.adminUser = 1;
    } else {
      results.adminUser = 0;
    }

    return NextResponse.json({
      message: "Database seeded successfully",
      results,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Internal server error during seeding" },
      { status: 500 }
    );
  }
}