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
  | "project-detail"
  | "dashboard"
  | "ai-tutor"
  | "community"
  | "post-detail"
  | "profile"
  | "certificates"
  | "challenges"
  | "challenge-detail"
  | "leaderboard"
  | "admin"
  | "search"
  | "login"
  | "register";

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

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  xp: number;
  coins: number;
  streak: number;
  role: string;
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

  // Challenge
  currentChallengeId: string | null;
  setCurrentChallengeId: (id: string | null) => void;

  // Post
  currentPostId: string | null;
  setCurrentPostId: (id: string | null) => void;

  // Project
  currentProjectId: string | null;
  setCurrentProjectId: (id: string | null) => void;

  // Auth
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  isAuthenticated: boolean;

  // Mobile menu
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

  // Search
  searchQuery: string;
  searchResults: SearchResults | null;
  isSearching: boolean;
  setSearchQuery: (q: string) => void;
  performSearch: (q: string) => Promise<void>;
}

export interface SearchResults {
  lessons: { id: string; title: string; type: string }[];
  quizzes: { id: string; title: string; type: string }[];
  projects: { id: string; title: string; type: string }[];
  posts: { id: string; title: string; type: string }[];
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

      // Challenge
      currentChallengeId: null,
      setCurrentChallengeId: (id) => set({ currentChallengeId: id }),

      // Post
      currentPostId: null,
      setCurrentPostId: (id) => set({ currentPostId: id }),

      // Project
      currentProjectId: null,
      setCurrentProjectId: (id) => set({ currentProjectId: id }),

      // Auth
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),

      // Mobile menu
      mobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

      // Search
      searchQuery: "",
      searchResults: null,
      isSearching: false,
      setSearchQuery: (q) => set({ searchQuery: q }),
      performSearch: async (q) => {
        if (!q.trim()) {
          set({ searchResults: null, isSearching: false });
          return;
        }
        set({ isSearching: true, searchQuery: q });
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
          const data = await res.json();
          set({ searchResults: data, isSearching: false });
        } catch {
          set({ searchResults: null, isSearching: false });
        }
      },
    }),
    {
      name: "js-hero-academy",
      partialize: (state) => ({
        user: state.user,
        currentView: state.currentView,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);