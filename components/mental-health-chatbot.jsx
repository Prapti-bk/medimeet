"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Send, User, Sparkles } from "lucide-react";

export default function MentalHealthChatbot({ patientName }) {
  const [messages, setMessages] = useState(() => {
    const greetingName = patientName ? `, ${patientName}` : "";
    return [
      {
        role: "assistant",
        content:
          `Hi${greetingName}! I’m your mental health companion. ` +
          "Tell me what you’re going through today, and I’ll help with some calming, practical steps.",
      },
    ];
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canSend = useMemo(() => input.trim().length > 0 && !isLoading, [
    input,
    isLoading,
  ]);

  async function handleSend(e) {
    e?.preventDefault?.();
    if (!canSend) return;

    const userMessage = input.trim();
    setInput("");

    const optimistic = {
      role: "user",
      content: userMessage,
    };

    setMessages((prev) => [...prev, optimistic]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/mental-health-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          name: patientName || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      const data = await res.json();
      const assistantMessage = {
        role: "assistant",
        content:
          data?.reply ||
          "I’m here for you. Please share a bit more about what’s been bothering you, and we can work through it step by step.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      toast.error("Failed to get bot response");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry—I'm having trouble right now. Please try again in a moment, or reach out to a professional for support.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-emerald-900/20 bg-white">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
            <Sparkles className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            Supportive chat (not medical advice)
          </div>
        </div>

        <div
          className="h-[320px] overflow-auto rounded-lg border bg-muted/20 p-3 space-y-3"
          aria-label="Chat messages"
        >
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={
                m.role === "user"
                  ? "flex justify-end"
                  : "flex justify-start"
              }
            >
              <div
                className={
                  m.role === "user"
                    ? "max-w-[85%] rounded-2xl bg-emerald-600 text-white px-4 py-2"
                    : "max-w-[85%] rounded-2xl bg-white px-4 py-2 border"
                }
              >
                <div className="text-xs opacity-80 mb-1 flex items-center gap-2">
                  {m.role === "user" ? (
                    <User className="h-3.5 w-3.5" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  )}
                  {m.role === "user" ? "You" : "Bot"}
                </div>
                <div className="whitespace-pre-wrap text-sm">{m.content}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl bg-white px-4 py-2 border flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        <form
          className="mt-3 flex items-end gap-2"
          onSubmit={handleSend}
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="How are you feeling?"
            rows={2}
            className="min-h-[48px] resize-none"
          />

          <Button
            type="submit"
            disabled={!canSend}
            className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-4"
          >
            <Send className="h-4 w-4" />
            <span className="ml-2">Send</span>
          </Button>
        </form>

        <div className="mt-2 text-xs text-muted-foreground">
          If you feel unsafe or in immediate danger, contact local emergency
          services or a crisis hotline.
        </div>
      </div>
    </Card>
  );
}

