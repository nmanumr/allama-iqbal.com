import { atom } from "jotai";
import { type SuggestionKeyDownProps, type SuggestionProps } from "@tiptap/suggestion";

export const suggestionProps$ = atom<SuggestionProps | null>(null);
export const suggestionsKeydownHandler$ = atom<((props: SuggestionKeyDownProps) => boolean) | null>(null);
