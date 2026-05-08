const LANGUAGE_STORAGE_KEY = "xk_ui_lang";

export const SUPPORTED_LANGUAGES = {
  az: "AZ",
  en: "EN",
};

export function getStoredStudyLanguage() {
  if (typeof window === "undefined") return "az";
  const lang = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (lang === "az" || lang === "en") return lang;
  return "az";
}

export function setStoredStudyLanguage(lang) {
  if (typeof window === "undefined") return;
  if (lang !== "az" && lang !== "en") return;
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
}

export function pickByLanguage(map, lang) {
  return map?.[lang] || map?.az || "";
}
