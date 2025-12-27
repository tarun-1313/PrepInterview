"use client";

import { useEffect, useRef, useState } from "react";
import { HelpCircle, MessageCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type PrepCoachWidgetProps = {
  initialGreeting: string;
};

const PrepCoachWidget = ({ initialGreeting }: PrepCoachWidgetProps) => {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: initialGreeting },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, isOpen]);

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
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      <button
        type="button"
        className="flex items-center gap-1 rounded-full bg-linear-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 border border-primary-200/60 px-3 py-1 text-[11px] text-light-200 hover:from-indigo-500/40 hover:via-purple-500/40 hover:to-pink-500/40 shadow-[0_0_18px_rgba(129,140,248,0.7)] animate-pulse"
        onClick={() => router.push("/prep-coach")}
        aria-label="Open full PrepWise Prep Coach page"
      >
        <HelpCircle size={14} />
        <span>Need prep help?</span>
      </button>
      {isOpen && (
        <div className="glass-card w-[360px] max-w-[90vw] max-h-[60vh] flex flex-col shadow-xl border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-black/70">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-light-400 uppercase tracking-[0.18em]">
                PrepWise Coach
              </span>
              <span className="text-[11px] text-emerald-400">
                Quick prep help
              </span>
            </div>
            <button
              type="button"
              className="h-6 w-6 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <X size={14} />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 px-3 py-2 space-y-2 overflow-y-auto bg-linear-to-b from-black/30 via-black/70 to-black/90"
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
                  <div className="h-6 w-6 rounded-full bg-primary-200/10 border border-primary-200/40 flex items-center justify-center text-primary-200 text-[10px]">
                    PW
                  </div>
                )}
                <div
                  className={
                    message.role === "assistant"
                      ? "rounded-2xl bg-white/5 px-3 py-2 text-xs max-w-[80%]"
                      : "rounded-2xl bg-primary-200 text-black px-3 py-2 text-xs max-w-[80%]"
                  }
                >
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-[11px] text-light-400">
                <div className="h-6 w-6 rounded-full bg-primary-200/10 border border-primary-200/40 flex items-center justify-center text-primary-200 text-[10px]">
                  PW
                </div>
                <div className="rounded-2xl bg-white/5 px-3 py-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-light-400 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-light-400/70 animate-pulse delay-75" />
                  <span className="w-1.5 h-1.5 rounded-full bg-light-400/50 animate-pulse delay-150" />
                  <span className="text-[10px] text-light-300 ml-1">
                    Thinking...
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 bg-black/80 px-3 py-2">
            <div className="flex items-end gap-2 rounded-2xl bg-white/5 border border-white/10 px-2 py-1 focus-within:border-primary-200/70">
              <textarea
                className="w-full bg-transparent text-xs outline-none resize-none max-h-24 placeholder:text-light-400/70"
                placeholder="Quick prep question..."
                value={input}
                rows={1}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button
                size="icon"
                type="button"
                className="h-8 w-8 rounded-full bg-primary-200 text-black hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSend}
                disabled={loading || !input.trim()}
              >
                {loading ? (
                  <span className="h-3 w-3 rounded-full border-2 border-black/40 border-t-transparent animate-spin" />
                ) : (
                  <MessageCircle size={14} />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <Button
          type="button"
          className="h-11 w-11 rounded-full flex items-center justify-center bg-linear-to-br from-purple-500 via-fuchsia-500 to-amber-300 text-black shadow-[0_0_22px_rgba(192,132,252,0.9)] hover:shadow-[0_0_32px_rgba(251,191,36,1)] transition-shadow duration-300"
          onClick={() => setIsOpen((current) => !current)}
          aria-label="Open PrepWise Coach"
        >
          {isOpen ? <X size={18} /> : <MessageCircle size={18} />}
        </Button>

        {!isOpen && (
          <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-amber-300 text-[9px] font-semibold text-black flex items-center justify-center shadow-[0_0_10px_rgba(251,191,36,0.9)]">
            ?
          </span>
        )}
      </div>
    </div>
  );
};

export default PrepCoachWidget;
