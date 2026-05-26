import { pt } from "./pt";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { ptBR } from "./pt-BR";
import { ja } from "./ja";

export const translations = {
  pt,
  en,
  es,
  fr,
  "pt-BR": ptBR,
  ja,
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.pt;
