import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function executeCodeSafely(code: string, testCases: { input: string; expected: string }[]) {
  const results: { input: string; expected: string; actual: string; passed: boolean }[] = [];

  for (const tc of testCases) {
    try {
      // Capture console.log output
      const logs: string[] = [];
      const mockConsole = {
        log: (...args: unknown[]) => {
          logs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" "));
        },
      };

      // Extract the function from the code and run test
      const wrappedCode = `
        ${code}
        const __input = ${JSON.stringify(tc.input)};
        let __result;
        // Try to find and call the function
        const __fnNames = Object.keys(globalThis || {}).filter(k => typeof (globalThis as Record<string, unknown>)[k] === 'function' && k !== 'log' && !k.startsWith('_'));
        if (__fnNames.length > 0) {
          __result = (globalThis as Record<string, (...a: unknown[]) => unknown>)[__fnNames[0]](__input);
        }
        return JSON.stringify(__result);
      `;

      const fn = new Function("console", wrappedCode);
      const actual = fn(mockConsole);
      const logOutput = logs.length > 0 ? logs.join("\n") : actual;

      results.push({
        input: tc.input,
        expected: tc.expected,
        actual: logOutput,
        passed: logOutput.trim() === String(tc.expected).trim(),
      });
    } catch {
      results.push({
        input: tc.input,
        expected: tc.expected,
        actual: "Error: Code execution failed",
        passed: false,
      });
    }
  }

  return results;
}

export async function POST(request: NextRequest) {
  try {
    const { userId, challengeId, code } = await request.json();

    if (!userId || !challengeId || !code) {
      return NextResponse.json(
        { error: "userId, challengeId, and code are required" },
        { status: 400 }
      );
    }

    const { data: challenge, error: challengeErr } = await supabase
      .from("DailyChallenge")
      .select("*")
      .eq("id", challengeId)
      .single();

    if (challengeErr || !challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    const testCases = JSON.parse(challenge.testCases) as { input: string; expected: string }[];
    const testResults = executeCodeSafely(code, testCases);
    const passedCount = testResults.filter((r) => r.passed).length;
    const allPassed = passedCount === testCases.length;
    const score = allPassed ? 100 : Math.round((passedCount / testCases.length) * 100);

    // Save submission
    const { data: submission, error: subErr } = await supabase
      .from("ChallengeSubmission")
      .insert({
        userId,
        challengeId,
        code,
        passed: allPassed,
        testResults: JSON.stringify(testResults),
        score,
        xpEarned: allPassed ? challenge.xpReward : 0,
      })
      .select()
      .single();

    if (subErr) {
      console.error("Save challenge submission error:", subErr);
      return NextResponse.json({ error: "Failed to save submission" }, { status: 500 });
    }

    // Award XP if passed
    if (allPassed) {
      const { data: currentUser } = await supabase
        .from("User")
        .select("xp")
        .eq("id", userId)
        .single();
      if (currentUser) {
        await supabase
          .from("User")
          .update({ xp: (currentUser.xp || 0) + challenge.xpReward })
          .eq("id", userId);
      }

      await supabase.from("Notification").insert({
        userId,
        type: "general",
        title: "Challenge Completed! 🎉",
        message: `You solved "${challenge.title}" — +${challenge.xpReward} XP`,
      });

      await supabase.from("ActivityLog").insert({
        userId,
        action: "challenge_submitted",
        details: JSON.stringify({ challengeId, passed: true, xpEarned: challenge.xpReward }),
      });
    }

    return NextResponse.json({
      submission,
      testResults,
      passed: allPassed,
      score,
      xpEarned: allPassed ? challenge.xpReward : 0,
      message: allPassed ? "All test cases passed! 🎉" : `${passedCount}/${testCases.length} test cases passed`,
    });
  } catch (error) {
    console.error("Submit challenge error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}