import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JavaScript Hero Academy - Master JavaScript From Beginner To Hero",
  description:
    "Learn JavaScript with interactive lessons, projects, quizzes, and real-world applications. Go from absolute beginner to professional developer.",
  keywords: [
    "JavaScript",
    "learn JavaScript",
    "JavaScript tutorial",
    "JavaScript course",
    "coding",
    "web development",
    "programming",
    "beginner to advanced",
    "interactive learning",
  ],
  authors: [{ name: "JavaScript Hero Academy" }],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23F7DF1E'/><text x='50' y='68' font-size='50' text-anchor='middle' font-weight='bold' fill='%23000'>JS</text></svg>",
  },
  openGraph: {
    title: "JavaScript Hero Academy",
    description:
      "Master JavaScript from beginner to hero with interactive lessons, projects, and quizzes.",
    type: "website",
    siteName: "JavaScript Hero Academy",
  },
  twitter: {
    card: "summary_large_image",
    title: "JavaScript Hero Academy",
    description:
      "Master JavaScript from beginner to hero with interactive lessons, projects, and quizzes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}