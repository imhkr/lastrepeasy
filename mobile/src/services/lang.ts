import { useCallback, useEffect, useState } from "react";
import { loadJson, saveJson } from "./kv";

export type Lang = "en" | "hi";

/** English or Hinglish for every coaching sentence. Remembered between launches. Hinglish by default. */
export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>("hi");
  useEffect(() => {
    loadJson<Lang>("coach_lang", "hi").then(setLangState);
  }, []);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    saveJson("coach_lang", l);
  }, []);
  return [lang, setLang];
}
