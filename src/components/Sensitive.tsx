"use client";

import { useSeedShield } from "@/lib/store";
import { useState, type ReactNode } from "react";

/**
 * In discreet mode, sensitive text is blurred until the person taps it, so a
 * glance over the shoulder or a shared screen does not reveal it.
 */
export function Sensitive({ children, as: Tag = "span" }: { children: ReactNode; as?: "span" | "div" }) {
  const { discreet, locale } = useSeedShield();
  const [shown, setShown] = useState(false);
  if (!discreet || shown) {
    return discreet ? (
      <Tag onClick={() => setShown(false)} title={locale === "ar" ? "اضغط للإخفاء" : "Tap to hide"}>
        {children}
      </Tag>
    ) : (
      <>{children}</>
    );
  }
  return (
    <Tag
      role="button"
      tabIndex={0}
      aria-label={locale === "ar" ? "مخفي في الوضع الخفي. اضغط للإظهار" : "Hidden in discreet mode. Tap to show"}
      data-discreet-hidden="true"
      onClick={() => setShown(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setShown(true);
        }
      }}
      className="cursor-pointer select-none blur-sm"
    >
      {children}
    </Tag>
  );
}
