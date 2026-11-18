/**
 * Output guard for model-written chat replies. Conservative on purpose: if a reply
 * looks like a diagnosis, a prescription, or an outcome claim, the app discards it
 * and falls back to its fixed rule-based reply. "This is not a diagnosis" is allowed.
 */
const BLOCKED: RegExp[] = [
  /\byou (likely |probably |may well |definitely )?(have|suffer from|are suffering from) (low testosterone|hypogonadism|infertility|a varicocele|varicocele|an infection|a condition|a disease|a disorder)/i,
  /\byou (are|'re) (infertile|sterile|diagnosed)/i,
  /\bdiagnosed with\b/i,
  /\b(prescrib\w*|dosage|dose of)\b/i,
  /\b\d+(\.\d+)?\s?(mg|mcg|µg|iu|ml)\b/i,
  /\b(start|begin|stop|quit|increase|decrease|skip|take)\s+(taking\s+)?(your\s+|the\s+)?(trt|testosterone|clomiphene|hcg|medication|medicine|pills?|supplements?)\b/i,
  /\b(guarantee\w*|pregnancy (chance|odds|rate)|chance of (conceiving|pregnancy))\b/i,
  /أنت (مصاب|عقيم)/,
  /تشخيصك/,
  /جرعة/,
  /أصف لك/,
  /ابدأ (بتناول|بأخذ)|توقف عن (تناول|أخذ)/,
];

export function isSafeChatReply(text: string): boolean {
  const t = text.trim();
  if (!t || t.length > 1500) return false;
  return !BLOCKED.some((re) => re.test(t));
}
