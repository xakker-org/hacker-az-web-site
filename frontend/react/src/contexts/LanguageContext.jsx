import { createContext, useContext, useState } from "react";

const LANG_KEY = "xk_ui_lang";
const Ctx = createContext({ lang: "az", setLang: () => {} });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem(LANG_KEY) || "az"; } catch { return "az"; }
  });
  const setLang = (l) => {
    setLangState(l);
    try { localStorage.setItem(LANG_KEY, l); } catch {}
  };
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
