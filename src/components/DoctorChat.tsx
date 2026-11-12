"use client";

import { useEffect, useRef, useState } from "react";
import { useSeedShield } from "@/lib/store";
import clsx from "clsx";

const QUICK = [
  { en: "Is this about fertility diagnosis?", ar: "هل هذا تشخيص خصوبة؟" },
  { en: "Should I stop my medication?", ar: "هل أوقف دوائي؟" },
  { en: "Sudden testicular pain", ar: "ألم خصوي مفاجئ" },
  { en: "What should I do about heat?", ar: "ماذا أفعل تجاه الحرارة؟" },
];

export function DoctorChat() {
  const { chat, sendChat, locale, vitalityIndex } = useSeedShield();
  const ar = locale === "ar";
  const [text, setText] = useState("");
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.length]);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!text.trim()) return;
    sendChat(text);
    setText("");
  }

  return (
    <div className="flex h-[min(70vh,640px)] flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--mist)]">
      <div className="border-b border-[var(--line)] bg-[var(--cedar)] px-4 py-3 text-[var(--mist)]">
        <div className="text-sm font-semibold">
          {ar ? "محادثة مع الدليل السريري" : "Chat with clinical guide"}
        </div>
        <div className="text-[11px] text-[var(--mist)]/75">
          {ar
            ? `مؤشرك ${vitalityIndex} · إرشاد فحص · مراجعة بشرية عند الحاجة`
            : `Your index ${vitalityIndex} · screening guidance · human review when needed`}
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {chat.map((m) => (
          <div
            key={m.id}
            className={clsx(
              "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
              m.role === "user"
                ? "ms-auto bg-[var(--cedar)] text-[var(--mist)]"
                : "bg-[var(--sand)] text-[var(--ink)]",
            )}
          >
            {m.text}
          </div>
        ))}
        <div ref={bottom} />
      </div>

      <div className="flex flex-wrap gap-1 border-t border-[var(--line)] px-3 py-2">
        {QUICK.map((q) => (
          <button
            key={q.en}
            type="button"
            onClick={() => sendChat(ar ? q.ar : q.en)}
            className="rounded-full border border-[var(--line)] px-2.5 py-1 text-[10px] text-[var(--cedar)]"
          >
            {ar ? q.ar : q.en}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="flex gap-2 border-t border-[var(--line)] p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            ar ? "اكتب سؤالك…" : "Ask about work, body, sleep, heat…"
          }
          className="flex-1 rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--cedar)]"
        />
        <button
          type="submit"
          className="rounded-xl bg-[var(--cedar)] px-4 py-2 text-sm font-medium text-[var(--mist)]"
        >
          {ar ? "إرسال" : "Send"}
        </button>
      </form>
    </div>
  );
}
