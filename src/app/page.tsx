"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useAppStore, type ViewType } from "@/lib/store";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { RoadmapSection } from "@/components/home/RoadmapSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { TestimonialsAndCTA } from "@/components/home/TestimonialsAndCTA";
import { CoursesView } from "@/components/courses/CoursesView";
import { LessonView } from "@/components/courses/LessonView";
import { PlaygroundView } from "@/components/playground/PlaygroundView";
import { QuizzesView } from "@/components/quizzes/QuizzesView";
import { QuizTakeView } from "@/components/quizzes/QuizTakeView";
import { ChallengesView } from "@/components/challenges/ChallengesView";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { ProjectsView } from "@/components/projects/ProjectsView";
import { ProjectDetailView } from "@/components/projects/ProjectDetailView";
import { AITutorView } from "@/components/ai-tutor/AITutorView";
import { CommunityView } from "@/components/community/CommunityView";
import { PostDetailView } from "@/components/community/PostDetailView";
import { ProfileView } from "@/components/profile/ProfileView";
import { CertificateView } from "@/components/certificates/CertificateView";
import { LeaderboardView } from "@/components/leaderboard/LeaderboardView";
import { AdminView } from "@/components/admin/AdminView";
import { SearchView } from "@/components/search/SearchView";
import { LoginView } from "@/components/auth/LoginView";
import { RegisterView } from "@/components/auth/RegisterView";

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

function ViewRouter() {
  const { currentView } = useAppStore();

  // Homepage is a special multi-section page
  if (currentView === "home") {
    return (
      <motion.div
        key="home"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3 }}
      >
        <HeroSection />
        <StatsSection />
        <RoadmapSection />
        <FeaturesSection />
        <TestimonialsAndCTA />
      </motion.div>
    );
  }

  // All other views
  const viewComponents: Record<ViewType, React.ReactNode> = {
    courses: <CoursesView />,
    lesson: <LessonView />,
    playground: <PlaygroundView />,
    quizzes: <QuizzesView />,
    "quiz-take": <QuizTakeView />,
    challenges: <ChallengesView />,
    dashboard: <DashboardView />,
    projects: <ProjectsView />,
    "project-detail": <ProjectDetailView />,
    "ai-tutor": <AITutorView />,
    community: <CommunityView />,
    "post-detail": <PostDetailView />,
    profile: <ProfileView />,
    certificates: <CertificateView />,
    leaderboard: <LeaderboardView />,
    admin: <AdminView />,
    search: <SearchView />,
    login: <LoginView />,
    register: <RegisterView />,
    home: null,
  };

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={currentView}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.25 }}
        className="flex-1"
      >
        {viewComponents[currentView]}
      </motion.main>
    </AnimatePresence>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <ViewRouter />
      <Footer />
    </div>
  );
}
