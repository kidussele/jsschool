import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { courseData } from "@/lib/course-data";
import { quizData } from "@/lib/quiz-data";
import { projectData } from "@/lib/project-data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const type = searchParams.get("type"); // lessons, quizzes, projects, posts

    if (!q.trim()) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 });
    }

    const results: Record<string, unknown[]> = {
      lessons: [],
      quizzes: [],
      projects: [],
      posts: [],
    };

    const query = q.toLowerCase();

    if (!type || type === "lessons") {
      for (const level of courseData) {
        for (const mod of level.modules) {
          for (const lesson of mod.lessons) {
            if (
              lesson.title.toLowerCase().includes(query) ||
              lesson.content.toLowerCase().includes(query)
            ) {
              results.lessons.push({
                id: lesson.id,
                title: lesson.title,
                type: "lesson",
                level: level.title,
                module: mod.title,
              });
            }
          }
        }
      }
    }

    if (!type || type === "quizzes") {
      for (const quiz of quizData) {
        if (
          quiz.title.toLowerCase().includes(query) ||
          quiz.description.toLowerCase().includes(query)
        ) {
          results.quizzes.push({
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            difficulty: quiz.difficulty,
            type: "quiz",
          });
        }
      }
    }

    if (!type || type === "projects") {
      for (const project of projectData) {
        if (
          project.title.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.skills.some((s) => s.toLowerCase().includes(query))
        ) {
          results.projects.push({
            id: project.id,
            title: project.title,
            description: project.description,
            difficulty: project.difficulty,
            type: "project",
          });
        }
      }
    }

    if (!type || type === "posts") {
      const { data: posts, error } = await supabase
        .from("DiscussionPost")
        .select("id, title")
        .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
        .limit(10);

      if (!error && posts) {
        results.posts = posts.map((p) => ({ ...p, type: "post" }));
      }
    }

    const total = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

    return NextResponse.json({ results, total, query: q });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}