import { notFound } from "next/navigation";
import Link from "next/link";
import indexItems from '../../assets/index.json';

export default async function Book({ params }: { params: Promise<{ book: string }> }) {
  const { book: bookId } = await params;
  const book = indexItems.find((book) => book.id === bookId);

  if (!book) {
    notFound();
  }

  return (
    <div
      className="mx-auto px-4 py-10 text-center font-nastaliq leading-[2] sm:px-6 md:max-w-2xl md:px-4 lg:max-w-4xl lg:px-12"
      dir="rtl"
    >
      <div className="mb-10 text-4xl">{book.name}</div>
      {book.sections.map((section) => (
        <section key={section.id}>
          <div className="sticky top-0 border-b border-gray-200 bg-white py-4 text-2xl">{section.name}</div>

          {section.poems.map((poem) => (
            <Link
              key={poem.id}
              href={`/${book.id}/${section.id}/${poem.id}`}
              className="block px-4 py-3 text-start text-lg leading-[2]"
            >
              {poem.name}
            </Link>
          ))}
        </section>
      ))}
    </div>
  );
}
