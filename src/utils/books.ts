import { cache } from "react";

import indexItems from "@/assets/index.json";

export const flattenIndex = cache(() => {
  const books = indexItems.map((book) => ({
    type: "book",
    id: book.id,
    name: book.name,
    nameEn: book["name-en"],
    year: book.year,
  }));

  const sectionsWithBookName = indexItems.flatMap((book) =>
    book.sections.map((s) => ({
      ...s,
      bookId: book.id,
      bookName: book.name,
      bookNameEn: book["name-en"],
    })),
  );

  const poemsWithSectionName = sectionsWithBookName.flatMap((section) =>
    section.poems.map((p) => ({
      ...p,
      bookName: section.bookName,
      bookNameEn: section.bookNameEn,
      sectionId: section.id,
      bookId: section.bookId,
      sectionName: section.name,
      sectionNameEn: (section as Record<string, unknown>)["name-en"],
    })),
  );

  const sections = sectionsWithBookName
    .filter((e) => !!(e as Record<string, unknown>)["name-en"])
    .map((section) => ({
      id: section.id,
      type: "section",
      name: section.name,
      nameEn: (section as Record<string, unknown>)["name-en"],
      bookId: section.bookId,
      bookName: section.bookName,
      bookNameEn: section.bookNameEn,
    }));

  const poems = poemsWithSectionName
    .filter((e) => !!e["name-en"])
    .map((poem) => ({
      id: poem.id,
      type: "poem",
      name: poem.name,
      nameEn: poem["name-en"],
      bookId: poem.bookId,
      bookName: poem.bookName,
      bookNameEn: poem.bookNameEn,
      sectionId: poem.sectionId,
      sectionName: poem.sectionName,
      sectionNameEn: poem.sectionNameEn,
    }));

  return [...books, ...sections, ...poems] as {
    type: "poem" | "book" | "section";
    id: string;
    name: string;
    nameEn?: string;
    bookId?: string;
    bookName?: string;
    bookNameEn?: string;
    sectionId?: string;
    sectionName?: string;
    sectionNameEn?: string;
  }[];
});

export function findAdjacentPoems(bookId: string, sectionId: string, poemId: string) {
  let prev = null;
  let next = null;

  const flattenedPoems = flattenIndex();

  const currentIndex = flattenedPoems.findIndex(
    (poem) => poem.bookId === bookId && poem.sectionId === sectionId && poem.id === poemId,
  );

  if (currentIndex > 0) {
    prev = flattenedPoems[currentIndex - 1];
  }

  if (currentIndex < flattenedPoems.length - 1) {
    next = flattenedPoems[currentIndex + 1];
  }

  return { prev, next };
}
