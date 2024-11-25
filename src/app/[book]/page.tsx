import { notFound } from "next/navigation";
import Link from "next/link";
import indexItems from "@/assets/index.json";
import { numberFormat } from "@/utils/intl";

export default async function Book({ params }: { params: Promise<{ book: string }> }) {
  const { book: bookId } = await params;
  const bookIndex = indexItems.findIndex((book) => book.id === bookId);
  const book = indexItems[bookIndex];

  if (!book) {
    notFound();
  }

  return (
    <div
      className="mx-auto px-4 pb-10 text-center font-nastaliq leading-[2] sm:px-6 md:max-w-2xl md:px-4 lg:max-w-4xl lg:px-12"
      dir="rtl"
    >
      <div className="my-20 text-4xl">
        <span className="pe-4">({numberFormat.format(bookIndex + 1)})</span> {book.name}
      </div>
      {book.sections.map((section, sectionIndex) => (
        <section key={section.id} id={section.id} className="mt-10">
          {section.name && (
            <Link href={`#${section.id}`} className="sticky top-0 block border-b border-gray-200 bg-white py-4 text-xl">
              <span className="pe-4">({numberFormat.format(sectionIndex + 1)})</span> {section.name}
            </Link>
          )}

          {section.poems.map((poem, poemIndex) => (
            <Link
              key={poem.id}
              href={`/${book.id}/${section.id}/${poem.id}`}
              className="block px-4 py-3 text-start leading-[2]"
            >
              <span className="pe-4">({numberFormat.format(poemIndex + 1)})</span>
              {poem.name}
            </Link>
          ))}
        </section>
      ))}
    </div>
  );
}

export function generateStaticParams() {
  return indexItems.map((book) => ({ params: { book: book.id } }));
}
