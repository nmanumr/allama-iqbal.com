"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import Placeholder from '@tiptap/extension-placeholder'
import Text from "@tiptap/extension-text";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import { WordSuggestion } from "./SearchBox/suggestions-ext";
import SuggestionList from "./SearchBox/SuggestionsList";
import { EditorContext } from "./SearchBox/context";

import './searchbox.css';

const CustomDocument = Document.extend({
  content: "block",
});

export default function SearchBox() {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [CustomDocument, Text, Paragraph, WordSuggestion, Placeholder.configure({
      placeholder: 'کتابیں، نظمیں یا اشعار تلاش کریں'
    })],
    content: "",
  });

  return (
    <div className="relative">
      {editor?.isInitialized && (
        <div className="absolute inset-y-0 start-3 flex items-center">
          <MagnifyingGlassIcon className="size-5 text-gray-700" />
        </div>
      )}

      <EditorContext.Provider value={editor}>
        <EditorContent dir="rtl" className="editor leading-[2]" editor={editor} />
        <SuggestionList />
      </EditorContext.Provider>
    </div>
  );
}
