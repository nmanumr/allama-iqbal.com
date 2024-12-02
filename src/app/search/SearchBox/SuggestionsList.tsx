"use client";

import { suggestionProps$, suggestionsKeydownHandler$ } from "@/app/search/SearchBox/state";
import { Portal } from "@radix-ui/react-portal";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SuggestionKeyDownProps } from "@tiptap/suggestion";
import clsx from "clsx";
import { autoUpdate, flip, offset, shift, useFloating } from "@floating-ui/react";

export default function SuggestionList() {
  const suggestionProps = useAtomValue(suggestionProps$);
  const setKeydownHandler = useSetAtom(suggestionsKeydownHandler$);
  const [selectionIdx, setSelectionIdx] = useState(0);

  const clientRect = useMemo(() => suggestionProps?.clientRect?.(), [suggestionProps]);

  const { refs, floatingStyles } = useFloating({
    placement: "bottom",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
    middleware: [offset(10), flip(), shift()], // Adjust as needed
  });

  useEffect(() => {
    if (clientRect) {
      refs.setReference({ getBoundingClientRect: () => clientRect });
    }
  }, [clientRect]);

  const keydownHandler = useCallback(
    (props: SuggestionKeyDownProps) => {
      const item = suggestionProps?.items?.[selectionIdx];
      const itemsLength = suggestionProps?.items.length ?? 0;
      if (props.event.key === "ArrowDown" && itemsLength) {
        setSelectionIdx((idx) => (idx + 1) % itemsLength);
        return true;
      }

      if (props.event.key === "ArrowUp") {
        setSelectionIdx((idx) => (idx + (itemsLength - 1)) % itemsLength);
        return true;
      }

      if (props.event.key === "Enter" && item) {
        suggestionProps?.command({ ...suggestionProps, text: item });
        setSelectionIdx(0);
        return true;
      }

      return false;
    },
    [selectionIdx, suggestionProps],
  );

  useEffect(() => {
    setKeydownHandler(() => keydownHandler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keydownHandler]);

  if (!suggestionProps || suggestionProps?.items?.length === 0) {
    return null;
  }
  return (
    <Portal>
      <div
        ref={refs.setFloating}
        style={{ ...floatingStyles }}
        className="z-50 w-48 rounded-lg border border-gray-200 bg-white shadow-lg"
      >
        <ul className="py-1" dir="rtl">
          {suggestionProps?.items.map((item, index) => (
            <li
              onClick={() => suggestionProps?.command({ ...suggestionProps, text: item })}
              key={item}
              className={clsx(
                `cursor-pointer px-4 py-2 font-mehr-nastaliq leading-relaxed`,
                selectionIdx === index ? "bg-gray-100" : "hover:bg-gray-100",
              )}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </Portal>
  );
}
