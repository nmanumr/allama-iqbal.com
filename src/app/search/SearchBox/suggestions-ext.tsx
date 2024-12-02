import { Extension } from "@tiptap/core";
import Suggestion, { SuggestionOptions as BaseSuggestionOptions } from "@tiptap/suggestion";
import { getDefaultStore } from "jotai";

import { suggestionProps$, suggestionsKeydownHandler$ } from "./state";
import getTransliterationFetcher from "./translitration-fetcher";
import { findSuggestionMatch } from "./findSuggestionMatch";

export type SuggestionOptions = {
  suggestion: Omit<BaseSuggestionOptions, "editor">;
};

const fetcher = getTransliterationFetcher();

export const WordSuggestion = Extension.create<SuggestionOptions>({
  name: "transliteration-suggestion",
  addOptions() {
    return {
      suggestion: {
        allowedPrefixes: null,
        char: " ",
        findSuggestionMatch,
        command: ({ editor, range, props }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertContent(" " + props.text + " ")
            .run();
        },
        allow: ({ range }) => {
          const length = range.to - range.from;
          return length >= 1;
        },
        items: ({ query }) => fetcher(query),
        render: () => {
          const store = getDefaultStore();

          return {
            onStart(props) {
              console.log(props.items);
              store.set(suggestionProps$, props);
            },
            onUpdate(props) {
              console.log(props.items);
              store.set(suggestionProps$, props);
            },
            onExit() {
              store.set(suggestionProps$, null);
            },
            onKeyDown: (props) => {
              const handler = store.get(suggestionsKeydownHandler$);

              if (handler) {
                return handler(props);
              }
              return false;
            },
          };
        },
      } satisfies Partial<BaseSuggestionOptions>,
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        ...this.options.suggestion,
        editor: this.editor,
      }),
    ];
  },
});
