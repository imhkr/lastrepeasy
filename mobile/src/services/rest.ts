// Pure helpers (no React Native imports) so they can be tested with plain node.

/** "~2-3 min" -> 180, "30-60 sec" -> 60, "~0.5-1 min" -> 60, "N/A" or "" -> 0. Uses the upper end of the range. */
export function restSeconds(rest: string): number {
  const m = rest.match(/(\d+(?:\.\d+)?)\s*(?:-\s*(\d+(?:\.\d+)?))?\s*(min|sec)/i);
  if (!m) return 0;
  const top = parseFloat(m[2] ?? m[1]);
  return Math.round(m[3].toLowerCase() === "min" ? top * 60 : top);
}

export const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
