import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ViewType =
  | "home"
  | "courses"
  | "lesson"
  | "playground"
  | "quizzes"
  | "quiz-take"
  | "projects"
  | "dashboard"
  | "ai-tutor"
  | "community"
  | "profile"
  | "certificates"
  | "challenges"
  | "leaderboard";

export interface LessonMeta {
  id: string;
  title: string;
  moduleId: string;
  levelId: string;
  order: number;
}

export interface QuizMeta {
  id: string;
  title: string;
  difficulty: string;
}

interface AppState {
  // Navigation
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  previousView: ViewType | null;
  navigateTo: (view: ViewType) => void;

  // Lesson
  currentLesson: LessonMeta | null;
  setCurrentLesson: (lesson: LessonMeta | null) => void;

  // Quiz
  currentQuiz: QuizMeta | null;
  setCurrentQuiz: (quiz: QuizMeta | null) => void;

  // User
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    xp: number;
    streak: number;
    level: number;
  } | null;
  setUser: (user: AppState["user"]) => void;
  addXp: (amount: number) => void;

  // Mobile menu
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Navigation
      currentView: "home",
      setCurrentView: (view) =>
        set({ currentView: view, previousView: get().currentView }),
      previousView: null,
      navigateTo: (view) =>
        set({ currentView: view, previousView: get().currentView }),

      // Lesson
      currentLesson: null,
      setCurrentLesson: (lesson) => set({ currentLesson: lesson }),

      // Quiz
      currentQuiz: null,
      setCurrentQuiz: (quiz) => set({ currentQuiz: quiz }),

      // User
      user: null,
      setUser: (user) => set({ user }),
      addXp: (amount) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                xp: state.user.xp + amount,
                level: Math.floor((state.user.xp + amount) / 500) + 1,
              }
            : null,
        })),

      // Mobile menu
      mobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
    }),
    {
      name: "js-hero-academy",
      partialize: (state) => ({
        user: state.user,
        currentView: state.currentView,
      }),
    }
  )
);