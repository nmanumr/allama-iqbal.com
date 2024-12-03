import { useSearchBox } from "react-instantsearch";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import Text from "@tiptap/extension-text";
import { EditorContent, useEditor } from "@tiptap/react";
import { useQueryState } from "nuqs";

import SuggestionList from "./SearchBox/SuggestionsList";
import { EditorContext } from "./SearchBox/context";
import { WordSuggestion } from "./SearchBox/suggestions-ext";
import "./searchbox.css";
import { useEffect } from "react";

const CustomDocument = Document.extend({
  content: "block",
});

export default function SearchBox() {
  const [inputValue, setInputValue] = useQueryState("q");
  const { refine } = useSearchBox({}, { $$widgetType: "ais.searchBox" });

  function setQuery(q: string) {
    setInputValue(q);
    refine(q);
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      CustomDocument,
      Text,
      Paragraph,
      WordSuggestion,
      Placeholder.configure({
        placeholder: "کتابیں، نظمیں یا اشعار تلاش کریں",
      }),
    ],
    content: inputValue,
    onUpdate: ({ editor: ed }) => {
      setQuery(ed.getText());
    },
  });

  useEffect(() => {
    if (inputValue) {
      refine(inputValue);
    }
  }, []);

  return (
    <div className="relative">
      {editor?.isInitialized && (
        <div className="absolute inset-y-0 start-3 flex items-center">
          <MagnifyingGlassIcon className="size-5 text-gray-600" strokeWidth={1.7} />
        </div>
      )}

      <EditorContext.Provider value={editor}>
        <EditorContent dir="rtl" className="editor leading-[2]" editor={editor} />
        <SuggestionList />
      </EditorContext.Provider>
    </div>
  );
}
