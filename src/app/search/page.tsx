"use client";

import { ReactNode } from "react";
import { Configure, Hits, useInstantSearch } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";

import { liteClient as algoliasearch } from "algoliasearch/lite";
import { type Hit as SearchHit } from "instantsearch.js";
import Link from "next/link";

import { SizeProvider, Verse } from "@/app/[book]/[section]/[poem]/components";
import SearchBox from "@/app/search/SearchBox";
import EmptySearchIllustration from "@/components/EmptySearchIllustration";

const searchClient = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!, process.env.NEXT_PUBLIC_ALGOLIA_API_KEY!);

interface SearchHitItem {
  id: string;
  type?: "poem" | "verse";
  content: string;
  bookName: string;
  sectionName: string;
  poemName: string;
  poemLabel?: string;
  paraName: string;
}

function poemTitle(hit: SearchHitItem) {
  return hit.poemLabel || hit.poemName;
}

function ResultBreadcrumb({
  bookId,
  sectionId,
  poemId,
  bookName,
  sectionName,
  poemName,
  showPoem,
}: {
  bookId: string;
  sectionId: string;
  poemId: string;
  bookName: string;
  sectionName: string;
  poemName: string;
  showPoem?: boolean;
}) {
  return (
    <div className="flex items-center">
      <Link className="whitespace-nowrap px-2 transition hover:text-green-700" href={`/${bookId}`}>
        {bookName}
      </Link>
      {sectionName && (
        <>
          &#183;
          <Link
            className="whitespace-nowrap px-2 transition hover:text-green-700"
            href={`/${bookId}?hash=${sectionId}`}
          >
            {sectionName}
          </Link>
        </>
      )}
      {showPoem && poemName && (
        <>
          &#183;
          <Link className="truncate px-2 transition hover:text-green-700" href={`/${bookId}/${sectionId}/${poemId}`}>
            {poemName}
          </Link>
        </>
      )}
    </div>
  );
}

function SearchResult({ hit }: { hit: SearchHit<SearchHitItem> }) {
  const [bookId, sectionId, poemId, stanzaId] = hit.id.split("/");
  const poemHref = `/${bookId}/${sectionId}/${poemId}`;
  const title = poemTitle(hit);

  if (hit.type === "poem") {
    return (
      <div className="boder-gray-300 border-b px-4 py-4 font-mehr-nastaliq">
        <Link href={poemHref} className="text-2xl pb-4 block">
          {title}
        </Link>
        <ResultBreadcrumb
          bookId={bookId}
          sectionId={sectionId}
          poemId={poemId}
          bookName={hit.bookName}
          sectionName={hit.sectionName}
          poemName={title}
        />
      </div>
    );
  }

  return (
    <div className="boder-gray-300 border-b px-4 py-4 font-mehr-nastaliq">
      <Link href={`${poemHref}/?hash=cplt${stanzaId}`} className="text-2xl pb-4 block">
        <SizeProvider>
          {hit.content
            .split("\n")
            .map((line, i) => [i, line] as const)
            .map(([i, line]) => (
              <Verse content={line} key={i} />
            ))}
        </SizeProvider>
      </Link>
      <ResultBreadcrumb
        bookId={bookId}
        sectionId={sectionId}
        poemId={poemId}
        bookName={hit.bookName}
        sectionName={hit.sectionName}
        poemName={title}
        showPoem
      />
    </div>
  );
}

const MAX_POEM_HITS = 3;

function promotePoems<T extends { type?: string }>(items: T[]) {
  const poems = items.filter((item) => item.type === "poem").slice(0, MAX_POEM_HITS);
  const verses = items.filter((item) => item.type !== "poem");
  return [...poems, ...verses];
}

function EmptyQueryBoundary({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { indexUiState, results } = useInstantSearch();
  if (!indexUiState.query || results.hits.length === 0) {
    return (
      <>
        {fallback}
        <div hidden>{children}</div>
      </>
    );
  }

  return children;
}

function EmptyState() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center">
        <EmptySearchIllustration />
        <div className="mt-4">اقبال کے کلیات میں سے کتابیں، نظمیں یا اشعار تلاش کریں۔</div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div
      className="mx-auto flex min-h-full flex-col px-4 py-10 font-nastaliq leading-[2] sm:px-6 md:max-w-2xl md:px-4 lg:max-w-4xl lg:px-12"
      dir="rtl"
    >
      <InstantSearchNext
        future={{ preserveSharedStateOnUnmount: true }}
        insights
        searchClient={searchClient}
        indexName="verses"
      >
        <Configure optionalFilters={["type:poem<score=1000>"]} />
        <SearchBox />
        <EmptyQueryBoundary fallback={<EmptyState />}>
          <Hits className="mt-10" hitComponent={SearchResult} transformItems={promotePoems} />
        </EmptyQueryBoundary>
      </InstantSearchNext>
    </div>
  );
}
