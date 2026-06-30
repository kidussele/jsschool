import { NextResponse } from "next/server";
import { courseData } from "@/lib/course-data";

// Read-only access to static course structure for admin reference
export async function GET() {
  try {
    const courses = courseData.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      icon: course.icon,
      difficulty: course.difficulty,
      totalLessons: course.modules.reduce((sum, m) => sum + m.lessons.length, 0),
      totalModules: course.modules.length,
      modules: course.modules.map((m) => ({
        id: m.id,
        title: m.title,
        lessonCount: m.lessons.length,
        lessons: m.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          duration: l.duration,
          type: l.type,
          hasCodeExamples: !!l.codeExamples?.length,
          contentLength: l.content?.length || 0,
        })),
      })),
    }));

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("Course data error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}