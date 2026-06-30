import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";
    const includeQuestions = searchParams.get("questions") === "true";

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let quizQuery = supabase
      .from("Quiz")
      .select("*", { count: "exact" })
      .order("createdAt", { ascending: false })
      .range(from, to);

    if (search) {
      quizQuery = quizQuery.ilike("title", `%${search}%`);
    }

    const { data: quizzes, count: total, error: quizError } = await quizQuery;
    if (quizError) {
      return NextResponse.json({ error: quizError.message }, { status: 500 });
    }

    const quizIds = (quizzes || []).map((q) => q.id);

    if (includeQuestions && quizIds.length > 0) {
      const { data: questions, error: qError } = await supabase
        .from("QuizQuestion")
        .select("*")
        .in("quizId", quizIds)
        .order("order", { ascending: true });

      if (qError) {
        return NextResponse.json({ error: qError.message }, { status: 500 });
      }

      const questionsByQuiz = new Map<string, typeof questions>();
      for (const q of questions || []) {
        const list = questionsByQuiz.get(q.quizId) || [];
        list.push(q);
        questionsByQuiz.set(q.quizId, list);
      }

      const enriched = (quizzes || []).map((quiz) => ({
        ...quiz,
        questions: questionsByQuiz.get(quiz.id) || [],
      }));

      return NextResponse.json({
        quizzes: enriched,
        total: total ?? 0,
        page,
        totalPages: Math.ceil((total ?? 0) / limit),
      });
    }

    // Without questions: include counts
    if (quizIds.length > 0) {
      const [questionCounts, attemptCounts] = await Promise.all([
        supabase.from("QuizQuestion").select("quizId").in("quizId", quizIds),
        supabase.from("QuizAttempt").select("quizId").in("quizId", quizIds),
      ]);

      const qcMap = new Map<string, number>();
      for (const row of questionCounts.data || []) {
        qcMap.set(row.quizId, (qcMap.get(row.quizId) || 0) + 1);
      }
      const acMap = new Map<string, number>();
      for (const row of attemptCounts.data || []) {
        acMap.set(row.quizId, (acMap.get(row.quizId) || 0) + 1);
      }

      const enriched = (quizzes || []).map((quiz) => ({
        ...quiz,
        _count: {
          questions: qcMap.get(quiz.id) || 0,
          attempts: acMap.get(quiz.id) || 0,
        },
      }));

      return NextResponse.json({
        quizzes: enriched,
        total: total ?? 0,
        page,
        totalPages: Math.ceil((total ?? 0) / limit),
      });
    }

    return NextResponse.json({
      quizzes: quizzes || [],
      total: total ?? 0,
      page,
      totalPages: Math.ceil((total ?? 0) / limit),
    });
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

    const { data: quiz, error: quizError } = await supabase
      .from("Quiz")
      .insert({
        title,
        description: description || "",
        difficulty: difficulty || "easy",
        moduleId: moduleId || null,
      })
      .select()
      .single();

    if (quizError) {
      return NextResponse.json({ error: quizError.message }, { status: 500 });
    }

    const questionRows = questions.map((q: Record<string, unknown>, i: number) => ({
      quizId: quiz.id,
      question: q.question as string,
      type: (q.type as string) || "multiple_choice",
      options: typeof q.options === "string" ? q.options : JSON.stringify(q.options || []),
      correctAnswer: q.correctAnswer as string,
      explanation: (q.explanation as string) || null,
      codeSnippet: (q.codeSnippet as string) || null,
      order: i,
      points: (q.points as number) || 10,
    }));

    const { data: insertedQuestions, error: qError } = await supabase
      .from("QuizQuestion")
      .insert(questionRows)
      .select()
      .order("order", { ascending: true });

    if (qError) {
      // Rollback: delete the quiz we just created
      await supabase.from("Quiz").delete().eq("id", quiz.id);
      return NextResponse.json({ error: qError.message }, { status: 500 });
    }

    return NextResponse.json({ quiz: { ...quiz, questions: insertedQuestions || [] } }, { status: 201 });
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

    const { data: existing, error: findError } = await supabase
      .from("Quiz")
      .select("*")
      .eq("id", id)
      .single();

    if (findError || !existing) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Delete old questions if new ones provided
    if (questions && Array.isArray(questions)) {
      const { error: deleteQError } = await supabase
        .from("QuizQuestion")
        .delete()
        .eq("quizId", id);

      if (deleteQError) {
        return NextResponse.json({ error: deleteQError.message }, { status: 500 });
      }
    }

    // Update quiz
    const { data: updated, error: updateError } = await supabase
      .from("Quiz")
      .update({
        title: title ?? existing.title,
        description: description ?? existing.description,
        difficulty: difficulty ?? existing.difficulty,
        moduleId: moduleId !== undefined ? moduleId : existing.moduleId,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Insert new questions if provided
    if (questions && Array.isArray(questions)) {
      const questionRows = questions.map((q: Record<string, unknown>, i: number) => ({
        quizId: id,
        question: q.question as string,
        type: (q.type as string) || "multiple_choice",
        options: typeof q.options === "string" ? q.options : JSON.stringify(q.options || []),
        correctAnswer: q.correctAnswer as string,
        explanation: (q.explanation as string) || null,
        codeSnippet: (q.codeSnippet as string) || null,
        order: i,
        points: (q.points as number) || 10,
      }));

      const { data: insertedQuestions, error: qError } = await supabase
        .from("QuizQuestion")
        .insert(questionRows)
        .select()
        .order("order", { ascending: true });

      if (qError) {
        return NextResponse.json({ error: qError.message }, { status: 500 });
      }

      return NextResponse.json({ quiz: { ...updated, questions: insertedQuestions || [] } });
    }

    // Fetch existing questions if no new ones provided
    const { data: existingQuestions } = await supabase
      .from("QuizQuestion")
      .select("*")
      .eq("quizId", id)
      .order("order", { ascending: true });

    return NextResponse.json({ quiz: { ...updated, questions: existingQuestions || [] } });
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

    const { data: existing, error: findError } = await supabase
      .from("Quiz")
      .select("id")
      .eq("id", id)
      .single();

    if (findError || !existing) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Delete questions first (in case cascade isn't set up)
    await supabase.from("QuizQuestion").delete().eq("quizId", id);

    const { error: deleteError } = await supabase
      .from("Quiz")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Quiz deleted" });
  } catch (error) {
    console.error("Delete quiz error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}