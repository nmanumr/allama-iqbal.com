import { Metadata } from "next";
import Link from "next/link";

import { numberFormat } from "@/utils/intl";

import indexItems from "../assets/index.json";

const languages: Record<string, string> = {
  ur: "اردو",
  fa: "فارسی",
};

export default async function Home() {
  return (
    <div
      className="mx-auto px-4 py-10 font-nastaliq leading-[2] sm:px-6 md:max-w-2xl md:px-4 lg:max-w-4xl lg:px-12"
      dir="rtl"
    >
      <div className="text-center text-4xl leading-[2]">کلیات اقبال</div>

      {/*<input*/}
      {/*  value={searchValue}*/}
      {/*  onChange={(e) => setSearchValue(e.target.value)}*/}
      {/*  className="mt-6 mb-10 border-gray-200 w-full text-center py-2 text-lg rounded bg-gray-50"*/}
      {/*  type="search"*/}
      {/*  placeholder="...Search"*/}
      {/*/>*/}

      {/*<div className="divide-y divide-gray-200">*/}
      {/*  {searchResults?.map((searchResult) => {*/}
      {/*    const bookName = (searchResult.item).bookName;*/}
      {/*    const sectionName = (searchResult.item).sectionName;*/}
      {/*    const to = [*/}
      {/*      searchResult.item.bookId,*/}
      {/*      searchResult.item.sectionId,*/}
      {/*      searchResult.item.id,*/}
      {/*    ]*/}
      {/*      .filter(Boolean)*/}
      {/*      .join('/');*/}

      {/*    return (*/}
      {/*      <Link*/}
      {/*        to={'/' + to}*/}
      {/*        className="py-6 px-4 block text-xl leading-[2] hover:bg-gray-50 transition"*/}
      {/*        key={to}*/}
      {/*      >*/}
      {/*        {(bookName || sectionName) && (*/}
      {/*          <div className="text-lg mb-2 text-gray-500 flex items-center gap-3">*/}
      {/*            <span>{bookName}</span>*/}
      {/*            {sectionName && (*/}
      {/*              <>*/}
      {/*                <ChevronLeftIcon className="size-3" strokeWidth={3} />*/}
      {/*                <span>{sectionName}</span>*/}
      {/*              </>*/}
      {/*            )}*/}
      {/*          </div>*/}
      {/*        )}*/}
      {/*        <div>{searchResult.item.name}</div>*/}
      {/*      </Link>*/}
      {/*    );*/}
      {/*  })}*/}

      {/*  {searchValue && !searchResults.length && (*/}
      {/*    <div className="text-center">*/}
      {/*      No Result Found*/}
      {/*    </div>*/}
      {/*  )}*/}
      {/*</div>*/}

      {indexItems.map((book, index) => (
        <Link
          className="flex items-baseline gap-x-6 py-4 text-start text-lg leading-[2]"
          key={book.id}
          href={`/${book.id}`}
        >
          <div className="flex items-baseline">
            <div className="pe-4">({numberFormat.format(index + 1)})</div>
            {book.name}
            <div className="ms-4 text-sm text-gray-600">
              {languages[book.language] ? `(${languages[book.language]})` : null}
            </div>
          </div>
          <div className="flex-1 border-b border-dashed border-gray-300" />
          <div>{book.year}</div>
        </Link>
      ))}
    </div>
  );
}

export const metadata: Metadata = {
  title: "Allama Iqbal's Literary Works - Complete Collection",
  description:
    "Explore the complete collection of Allama Iqbal's literary masterpieces, including poetry, prose, and philosophical works. Access his books, translated versions, and more.",
};
