import Link from "next/link";
import indexItems from '../assets/index.json';

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

      {indexItems.map((book) => (
        <Link className="block py-4 text-center text-xl leading-[2]" key={book.id} href={`/${book.id}`}>
          {book.name}
        </Link>
      ))}
    </div>
  );
}
