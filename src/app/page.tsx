import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Metadata } from "next";
import Link from "next/link";

import { urNumberFormat } from "@/utils/intl";

import indexItems from "../assets/new-index.json";

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
      <div className="flex-1 text-center text-4xl leading-[2]">کلیات اقبال</div>

      <div className="mt-6 flex justify-center">
        <Link
          href="/search"
          className="relative flex w-64 items-center gap-x-4 rounded-md bg-gray-100 px-4 py-2.5 hover:bg-gray-200 focus:outline-none"
        >
          <MagnifyingGlassIcon className="absolute size-5 text-gray-600" />
          <div className="w-full text-center text-gray-600">تلاش کریں...</div>
        </Link>
      </div>

      <div className="mt-6">
        {indexItems.map((book, index) => (
          <Link
            className="flex items-baseline gap-x-6 py-4 text-start text-lg leading-[2]"
            key={book.id}
            href={`/${book.slug}`}
          >
            <div className="flex items-baseline">
              <div className="pe-4">({urNumberFormat.format(index + 1)})</div>
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
    </div>
  );
}

export const metadata: Metadata = {
  title: "Allama Iqbal's Literary Works - Complete Collection",
  description:
    "Explore the complete collection of Allama Iqbal's literary masterpieces, including poetry, prose, and philosophical works. Access his books, translated versions, and more.",
};
