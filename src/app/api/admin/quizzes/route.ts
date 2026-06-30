import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";
    const includeQuestions = searchParams.get("questions") === "true";

    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (search) {
      where.title = { contains: search };
    }

    const [quizzes, total] = await Promise.all([
      db.quiz.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: includeQuestions
          ? { questions: { orderBy: { order: "asc" } } }
          : { _count: { select: { questions: true, attempts: true } } },
      }),
      db.quiz.count({ where }),
    ]);

    return NextResponse.json({ quizzes, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("List quizzes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, difficulty, moduleId, questions } = body;

    if (!title || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Title and questions are required" }, { status: 400 });
    }

    const quiz = await db.quiz.create({
      data: {
        title,
        description: description || "",
        difficulty: difficulty || "easy",
        moduleId: moduleId || null,
        questions: {
          create: questions.map((q: Record<string, unknown>, i: number) => ({
            question: q.question as string,
            type: (q.type as string) || "multiple_choice",
            options: typeof q.options === "string" ? q.options : JSON.stringify(q.options || []),
            correctAnswer: q.correctAnswer as string,
            explanation: (q.explanation as string) || null,
            codeSnippet: (q.codeSnippet as string) || null,
            order: i,
            points: (q.points as number) || 10,
          })),
        },
      },
      include: { questions: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ quiz }, { status: 201 });
  } catch (error) {
    console.error("Create quiz error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, difficulty, moduleId, questions } = body;

    if (!id) {
      return NextResponse.json({ error: "Quiz ID is required" }, { status: 400 });
    }

    const existing = await db.quiz.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    if (questions && Array.isArray(questions)) {
      await db.quizQuestion.deleteMany({ where: { quizId: id } });
    }

    const quiz = await db.quiz.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        description: description ?? existing.description,
        difficulty: difficulty ?? existing.difficulty,
        moduleId: moduleId !== undefined ? moduleId : existing.moduleId,
        ...(questions && Array.isArray(questions)
          ? {
              questions: {
                create: questions.map((q: Record<string, unknown>, i: number) => ({
                  question: q.question as string,
                  type: (q.type as string) || "multiple_choice",
                  options: typeof q.options === "string" ? q.options : JSON.stringify(q.options || []),
                  correctAnswer: q.correctAnswer as string,
                  explanation: (q.explanation as string) || null,
                  codeSnippet: (q.codeSnippet as string) || null,
                  order: i,
                  points: (q.points as number) || 10,
                })),
              },
            }
          : {}),
      },
      include: { questions: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error("Update quiz error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Quiz ID is required" }, { status: 400 });
    }

    const existing = await db.quiz.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    await db.quiz.delete({ where: { id } });
    return NextResponse.json({ message: "Quiz deleted" });
  } catch (error) {
    console.error("Delete quiz error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}