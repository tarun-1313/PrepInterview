"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type PrepCoachChatProps = {
  initialGreeting: string;
};

const PrepCoachChat = ({ initialGreeting }: PrepCoachChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: initialGreeting },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const nextMessages = [
      ...messages,
      { role: "user", content: trimmed } as ChatMessage,
    ];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/prep-coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content:
              "I could not reach the preparation coach service. Try again in a moment.",
          },
          {
            role: "assistant",
            content: errorText,
          },
        ]);
        return;
      }

      const data = (await response.json()) as { reply: string };

      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Something went wrong while calling the preparation coach. Check your connection and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 w-full py-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-light-400 bg-white/5">
          <span className="h-5 w-5 rounded-full bg-primary-200/10 border border-primary-200/40 flex items-center justify-center text-primary-200">
            <Sparkles size={12} />
          </span>
          <span>PrepWise Preparation Coach</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold">
          Where should we begin?
        </h1>
        <p className="text-sm text-light-200 max-w-xl">
          Ask what to study, paste a job description, or share a question you
          are unsure about. I will tailor the guidance to your role and level.
        </p>
      </div>

      <div className="glass-card w-full max-w-3xl h-[420px] md:h-[520px] flex flex-col shadow-2xl border border-white/10 overflow-hidden">
        <div
          ref={scrollRef}
          className="flex-1 px-4 py-4 space-y-3 overflow-y-auto bg-linear-to-b from-black/40 via-black/70 to-black/90"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={
                message.role === "assistant"
                  ? "flex items-start gap-2"
                  : "flex items-start gap-2 justify-end"
              }
            >
              {message.role === "assistant" && (
                <div className="h-7 w-7 rounded-full bg-primary-200/10 border border-primary-200/40 flex items-center justify-center text-primary-200 text-xs">
                  PW
                </div>
              )}
              <div
                className={
                  message.role === "assistant"
                    ? "rounded-2xl bg-white/5 px-4 py-3 text-sm max-w-[80%]"
                    : "rounded-2xl bg-primary-200 text-black px-4 py-3 text-sm max-w-[80%]"
                }
              >
                <p className="whitespace-pre-wrap leading-relaxed text-[13px]">
                  {message.content}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-light-400">
              <div className="h-7 w-7 rounded-full bg-primary-200/10 border border-primary-200/40 flex items-center justify-center text-primary-200 text-xs">
                PW
              </div>
              <div className="rounded-2xl bg-white/5 px-4 py-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-light-400 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-light-400/70 animate-pulse delay-75" />
                <span className="w-1.5 h-1.5 rounded-full bg-light-400/50 animate-pulse delay-150" />
                <span className="text-[11px] text-light-300 ml-2">
                  Thinking about the best explanation for your profile...
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 bg-black/70 px-3 py-3">
          <div className="flex items-end gap-2 rounded-2xl bg-white/5 border border-white/10 px-3 py-2 focus-within:border-primary-200/70">
            <textarea
              className="w-full bg-transparent text-sm outline-none resize-none max-h-32 placeholder:text-light-400/70"
              placeholder="Ask what to prepare, how to explain a concept, or paste a question..."
              value={input}
              rows={1}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button
              size="icon"
              type="button"
              className="h-9 w-9 rounded-full bg-primary-200 text-black hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              {loading ? (
                <span className="h-3 w-3 rounded-full border-2 border-black/40 border-t-transparent animate-spin" />
              ) : (
                <MessageCircle size={16} />
              )}
            </Button>
          </div>
          <p className="mt-1 text-[10px] text-light-400/70">
            Press Enter to send · Shift+Enter for a new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrepCoachChat;
