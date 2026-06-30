-- JavaScript Hero Academy - Supabase Schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==================== USERS ====================
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "avatar" TEXT,
  "bio" TEXT,
  "role" TEXT NOT NULL DEFAULT 'student',
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "xp" INTEGER NOT NULL DEFAULT 0,
  "coins" INTEGER NOT NULL DEFAULT 0,
  "streak" INTEGER NOT NULL DEFAULT 0,
  "lastLoginDate" TEXT,
  "lastActiveAt" TIMESTAMPTZ,
  "totalTimeSpent" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_xp_idx" ON "User"("xp");
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");

-- ==================== USER PROGRESS ====================
CREATE TABLE IF NOT EXISTS "UserProgress" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "lessonId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'not_started',
  "xpEarned" INTEGER NOT NULL DEFAULT 0,
  "timeSpent" INTEGER NOT NULL DEFAULT 0,
  "completedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("userId", "lessonId")
);
CREATE INDEX IF NOT EXISTS "UserProgress_userId_idx" ON "UserProgress"("userId");

-- ==================== LESSON NOTES ====================
CREATE TABLE IF NOT EXISTS "LessonNote" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "lessonId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("userId", "lessonId")
);
CREATE INDEX IF NOT EXISTS "LessonNote_userId_idx" ON "LessonNote"("userId");

-- ==================== BOOKMARKS ====================
CREATE TABLE IF NOT EXISTS "Bookmark" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "lessonId" TEXT,
  "postId" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "Bookmark_userId_idx" ON "Bookmark"("userId");

-- ==================== QUIZZES ====================
CREATE TABLE IF NOT EXISTS "Quiz" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "difficulty" TEXT NOT NULL DEFAULT 'easy',
  "moduleId" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "QuizQuestion" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "quizId" TEXT NOT NULL REFERENCES "Quiz"("id") ON DELETE CASCADE,
  "question" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'multiple_choice',
  "options" TEXT,
  "correctAnswer" TEXT NOT NULL,
  "explanation" TEXT,
  "codeSnippet" TEXT,
  "order" INTEGER NOT NULL,
  "points" INTEGER NOT NULL DEFAULT 10
);

-- ==================== QUIZ ATTEMPTS ====================
CREATE TABLE IF NOT EXISTS "QuizAttempt" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "quizId" TEXT NOT NULL REFERENCES "Quiz"("id") ON DELETE CASCADE,
  "score" INTEGER NOT NULL,
  "totalPoints" INTEGER NOT NULL,
  "correctCount" INTEGER NOT NULL,
  "totalQuestions" INTEGER NOT NULL,
  "answers" TEXT NOT NULL,
  "timeTaken" INTEGER NOT NULL DEFAULT 0,
  "completedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==================== CERTIFICATES ====================
CREATE TABLE IF NOT EXISTS "Certificate" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "courseName" TEXT NOT NULL,
  "levelName" TEXT NOT NULL,
  "certificateId" TEXT NOT NULL UNIQUE,
  "issuedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "Certificate_userId_idx" ON "Certificate"("userId");

-- ==================== ACHIEVEMENTS ====================
CREATE TABLE IF NOT EXISTS "Achievement" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "icon" TEXT NOT NULL,
  "xpReward" INTEGER NOT NULL,
  "condition" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "UserAchievement" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "achievementId" TEXT NOT NULL REFERENCES "Achievement"("id") ON DELETE CASCADE,
  "earnedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("userId", "achievementId")
);

-- ==================== PROJECTS ====================
CREATE TABLE IF NOT EXISTS "Project" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "difficulty" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "duration" TEXT NOT NULL,
  "skills" TEXT NOT NULL,
  "steps" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "ProjectSubmission" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "projectId" TEXT NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
  "codeUrl" TEXT,
  "screenshotUrl" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "score" INTEGER,
  "feedback" TEXT,
  "submittedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "reviewedAt" TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "ProjectSubmission_userId_idx" ON "ProjectSubmission"("userId");
CREATE INDEX IF NOT EXISTS "ProjectSubmission_projectId_idx" ON "ProjectSubmission"("projectId");

-- ==================== DISCUSSION ====================
CREATE TABLE IF NOT EXISTS "DiscussionPost" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "tags" TEXT,
  "likes" INTEGER NOT NULL DEFAULT 0,
  "replyCount" INTEGER NOT NULL DEFAULT 0,
  "isPinned" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "DiscussionPost_userId_idx" ON "DiscussionPost"("userId");
CREATE INDEX IF NOT EXISTS "DiscussionPost_createdAt_idx" ON "DiscussionPost"("createdAt");

CREATE TABLE IF NOT EXISTS "DiscussionReply" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "postId" TEXT NOT NULL REFERENCES "DiscussionPost"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "content" TEXT NOT NULL,
  "likes" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "DiscussionReply_postId_idx" ON "DiscussionReply"("postId");
CREATE INDEX IF NOT EXISTS "DiscussionReply_userId_idx" ON "DiscussionReply"("userId");

-- ==================== CODE SNIPPETS ====================
CREATE TABLE IF NOT EXISTS "CodeSnippet" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "html" TEXT NOT NULL DEFAULT '',
  "css" TEXT NOT NULL DEFAULT '',
  "javascript" TEXT NOT NULL DEFAULT '',
  "isPublic" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "CodeSnippet_userId_idx" ON "CodeSnippet"("userId");

-- ==================== DAILY CHALLENGES ====================
CREATE TABLE IF NOT EXISTS "DailyChallenge" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "difficulty" TEXT NOT NULL,
  "codeTemplate" TEXT NOT NULL,
  "testCases" TEXT NOT NULL,
  "solution" TEXT NOT NULL,
  "xpReward" INTEGER NOT NULL DEFAULT 50,
  "date" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "ChallengeSubmission" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "challengeId" TEXT NOT NULL REFERENCES "DailyChallenge"("id") ON DELETE CASCADE,
  "code" TEXT NOT NULL,
  "passed" BOOLEAN NOT NULL,
  "testResults" TEXT NOT NULL,
  "score" INTEGER NOT NULL DEFAULT 0,
  "xpEarned" INTEGER NOT NULL DEFAULT 0,
  "submittedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "ChallengeSubmission_userId_idx" ON "ChallengeSubmission"("userId");
CREATE INDEX IF NOT EXISTS "ChallengeSubmission_challengeId_idx" ON "ChallengeSubmission"("challengeId");

-- ==================== LEADERBOARD ====================
CREATE TABLE IF NOT EXISTS "Leaderboard" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
  "xp" INTEGER NOT NULL,
  "rank" INTEGER NOT NULL
);

-- ==================== NOTIFICATIONS ====================
CREATE TABLE IF NOT EXISTS "Notification" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS "Notification_read_idx" ON "Notification"("read");

-- ==================== ACTIVITY LOG ====================
CREATE TABLE IF NOT EXISTS "ActivityLog" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "action" TEXT NOT NULL,
  "details" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "ActivityLog_userId_idx" ON "ActivityLog"("userId");
CREATE INDEX IF NOT EXISTS "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- ==================== PASSWORD RESET ====================
CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "token" TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "used" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==================== ADMIN IMAGES ====================
CREATE TABLE IF NOT EXISTS "AdminImage" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "filename" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "alt" TEXT,
  "size" INTEGER NOT NULL DEFAULT 0,
  "mimeType" TEXT NOT NULL DEFAULT 'image/png',
  "uploadedBy" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "AdminImage_uploadedBy_idx" ON "AdminImage"("uploadedBy");

-- ==================== AI PROMPTS ====================
CREATE TABLE IF NOT EXISTS "AIPrompt" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "systemPrompt" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'general',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "usageCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "AIPrompt_category_idx" ON "AIPrompt"("category");

-- ==================== UPDATED AT TRIGGER ====================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updatedAt
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT table_name FROM information_schema.columns WHERE column_name = 'updatedAt' AND table_schema = 'public'
  LOOP
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON "%I" FOR EACH ROW EXECUTE FUNCTION update_updated_at()', tbl);
  END LOOP;
END;
$$;

-- ==================== DISABLE RLS (for API-driven auth) ====================
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('ALTER TABLE "%I" ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('CREATE POLICY "Allow all" ON "%I" FOR ALL USING (true) WITH CHECK (true)', tbl);
  END LOOP;
END;
$$;