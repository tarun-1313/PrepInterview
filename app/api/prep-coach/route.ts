import { google } from "@ai-sdk/google";
import { generateText } from "ai";

import { getCurrentUser } from "@/lib/actions/auth.action";

const prepCoachSystemPrompt = `
You are PrepWise Preparation Coach, a text-based AI mentor that prepares users before mock interviews.

You do not conduct interviews.
You do not ask interview questions.
You do not use voice.

Your purpose is to guide users on what to study, how to explain concepts, pros and cons, common mistakes, and interview expectations.

Automatic user profile handling:
- You automatically receive and analyze the user profile context passed in the system message.

- You adapt explanations to the user's role and experience.
- You adjust depth automatically:
  - Fresher: simpler explanations and fundamentals.
  - 1–3 years: examples and reasoning.
  - 3+ years: trade-offs and architecture.
- You use the user's tech stack in examples whenever possible.

Conversation start rule:
- Greet the user.
- Acknowledge their detected profile.
- Briefly describe what you will focus on for their preparation.

Core responsibilities:
1) Personalized concept roadmaps
- When the user asks what to prepare, generate a roadmap prioritized by role, experience, and interview type.
- Use this structure:
  1. Concept name
     - Why it matters for this role
     - Key subtopics to revise

2) Interview-oriented concept explanations
- Always keep answers interview-focused.
- Mandatory structure when explaining a concept:
  - Definition (simple)
  - How it works
  - Real-world or project example
  - Pros
  - Cons

3) Common interview mistakes
- Highlight mistakes commonly made for the user's role and stack.

4) What interviewers expect
- Explicitly state what interviewers want to hear for this topic.

5) Answer framing guidance
- Teach users how to speak, not just what to know.
- Example pattern:
  - Start with a definition.
  - Give a real project example.
  - Explain trade-offs or decisions.

6) Comparisons
- When comparing technologies or approaches:
  - Clearly show differences.
  - Explain when to use which option.

7) Readiness checklists
- Provide short checklists to verify readiness before a mock interview.

Tone and communication:
- Friendly mentor.
- Calm and supportive.
- Clear and structured.
- Interview-focused language.
- No robotic tone.
- No long unstructured paragraphs.
- No asking interview questions back to the user.

Session ending:
- When the user seems ready, end with a gentle suggestion:
  "Once you are comfortable with these topics, you can start your mock interview."
`;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const { messages }: { messages: ChatMessage[] } = await request.json();

  const profileSummary = user
    ? `
User profile:
- Name: ${user.name ?? "Unknown"}
- Target job role: ${(user as any).targetRole ?? "Unknown"}
- Experience level: ${(user as any).experienceLevel ?? "Unknown"}
- Preferred tech stack: ${
        (user as any).techstack?.join(", ") ??
        (user as any).techstack?.join(", ") ??
        "Unknown"
      }
- Interview language: ${(user as any).interviewLanguage ?? "Unknown"}
`
    : `
User profile:
- Unknown.
Use default assumptions for a software interview candidate.
`;

  const fullPrompt = `${prepCoachSystemPrompt}

${profileSummary}
`;

  const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!googleApiKey) {
    const lastUserMessage =
      messages.filter((message) => message.role === "user").slice(-1)[0]
        ?.content ?? "";

    const reply = [
      "Hi, I am your PrepWise Preparation Coach running in local demo mode.",
      "",
      "Here is how you can use this space effectively:",
      "- Tell me your target role, experience, and tech stack.",
      "- Share the job description or interview type you are aiming for.",
      "- Paste any question or topic you are unsure about.",
      "",
      "Based on that, I will outline:",
      "- A focused preparation roadmap.",
      "- How to explain key concepts in interviews.",
      "- Common mistakes and what interviewers expect.",
      "",
      lastUserMessage
        ? `You just asked:\n"${lastUserMessage}"\n\nStart by breaking this into 3 parts: definition, how it works in your projects, and trade-offs. Then think of one concrete example from your experience that you can describe in 30–60 seconds.`
        : "Start by asking something like: \"What should I prepare for a frontend interview with React and TypeScript?\" or \"How do I explain REST vs GraphQL in interviews?\"",
    ].join("\n");

    return Response.json(
      {
        reply,
      },
      { status: 200 }
    );
  }

  const aiMessages: {
    role: "system" | "user" | "assistant";
    content: string;
  }[] = [
    {
      role: "system",
      content: fullPrompt,
    },
    ...messages,
  ];

  try {
    const result = await generateText({
      model: google("models/gemini-2.5-flash"),
      messages: aiMessages,
    });

    return Response.json(
      {
        reply: result.text,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Prep coach Gemini error:", error);

    const lastUserMessage =
      messages.filter((message) => message.role === "user").slice(-1)[0]
        ?.content ?? "";

    const fallbackReply = [
      "I had trouble reaching the AI model just now, so I will still give you structured guidance based on your message.",
      "",
      lastUserMessage
        ? `You asked:\n"${lastUserMessage}"`
        : "You can ask things like: \"What should I prepare for a backend interview with Node and React?\"",
      "",
      "Use this pattern to prepare any topic:",
      "- Start with a one-line definition.",
      "- Explain how it works in your own projects.",
      "- Mention 2–3 pros and 1–2 cons.",
      "- Add a short example from your experience.",
      "",
      "Try sending another question or paste a job description and I will help you turn it into a focused preparation plan.",
    ].join("\n");

    return Response.json(
      {
        reply: fallbackReply,
      },
      { status: 200 }
    );
  }
}
