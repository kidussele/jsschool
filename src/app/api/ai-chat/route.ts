import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    const systemPrompt = `You are "JS Tutor", a friendly and expert JavaScript tutor for the JavaScript Hero Academy learning platform. Your role is to help students learn JavaScript.

Guidelines:
- Be encouraging, patient, and clear
- Explain concepts with simple code examples
- Provide code snippets using markdown code blocks
- If asked about non-JS topics, briefly redirect to JavaScript
- Keep answers concise but thorough
- Reference practical real-world usage
- Match the student level - start simple, go deeper
- Use a friendly, approachable tone with occasional emojis`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(Array.isArray(history) ? history.slice(-10) : []),
      { role: "user", content: message },
    ];

    const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ZAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "glm-4-flash",
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I'm having trouble right now. Please try again!";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("AI Chat error:", error);
    return NextResponse.json(
      { reply: "Something went wrong. Please try again in a moment." },
      { status: 500 }
    );
  }
}