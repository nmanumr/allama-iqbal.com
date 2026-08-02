"use client";

import { ReactNode } from "react";
import { Configure, Index, useInfiniteHits, useInstantSearch } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";

import { liteClient as algoliasearch } from "algoliasearch/lite";
import { type Hit as SearchHit } from "instantsearch.js";
import Link from "next/link";

import { SizeProvider, Verse } from "@/app/[book]/[section]/[poem]/components";
import SearchBox from "@/app/search/SearchBox";
import EmptySearchIllustration from "@/components/EmptySearchIllustration";

const searchClient = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!, process.env.NEXT_PUBLIC_ALGOLIA_API_KEY!);

const INDEX_NAME = "verses";
const POEM_PAGE_SIZE = 10;
const VERSE_PAGE_SIZE = 20;

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

function PoemSearchResult({ hit }: { hit: SearchHit<SearchHitItem> }) {
  const [bookId, sectionId, poemId] = hit.id.split("/");
  const title = poemTitle(hit);

  return (
    <div className="boder-gray-300 border-b px-4 py-4 font-mehr-nastaliq">
      <Link href={`/${bookId}/${sectionId}/${poemId}`} className="text-2xl pb-4 block">
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

function VerseSearchResult({ hit }: { hit: SearchHit<SearchHitItem> }) {
  const [bookId, sectionId, poemId, stanzaId] = hit.id.split("/");
  const title = poemTitle(hit);

  return (
    <div className="boder-gray-300 border-b px-4 py-4 font-mehr-nastaliq">
      <Link href={`/${bookId}/${sectionId}/${poemId}/?hash=cplt${stanzaId}`} className="text-2xl pb-4 block">
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

function HitSection({
  heading,
  moreLabel,
  hitComponent: HitComponent,
}: {
  heading: string;
  moreLabel: string;
  hitComponent: (props: { hit: SearchHit<SearchHitItem> }) => ReactNode;
}) {
  const { items, isLastPage, showMore } = useInfiniteHits<SearchHitItem>();

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <h2 className="border-b border-gray-300 px-4 pb-2 text-lg text-gray-500">{heading}</h2>
      {items.map((hit) => (
        <HitComponent hit={hit} key={hit.objectID} />
      ))}
      {!isLastPage && (
        <button className="px-4 py-4 text-gray-500 transition hover:text-green-700" onClick={showMore} type="button">
          {moreLabel}
        </button>
      )}
    </section>
  );
}

function EmptyQueryBoundary({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { indexUiState, scopedResults } = useInstantSearch();
  const hasQuery = Boolean(indexUiState.query);
  const hasHits = scopedResults.some(({ results }) => (results?.nbHits ?? 0) > 0);

  if (!hasQuery || !hasHits) {
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
        indexName={INDEX_NAME}
      >
        {/* Suppress unused root-index hits; poems and verses are queried separately. */}
        <Configure hitsPerPage={0} />
        <SearchBox />
        <EmptyQueryBoundary fallback={<EmptyState />}>
          <div className="mt-10">
            <Index indexId="poem-hits" indexName={INDEX_NAME}>
              <Configure filters="type:poem" hitsPerPage={POEM_PAGE_SIZE} />
              <HitSection heading="نظمیں" hitComponent={PoemSearchResult} moreLabel="مزید نظمیں دکھائیں" />
            </Index>
            <Index indexId="verse-hits" indexName={INDEX_NAME}>
              <Configure filters="type:verse" hitsPerPage={VERSE_PAGE_SIZE} />
              <HitSection heading="اشعار" hitComponent={VerseSearchResult} moreLabel="مزید اشعار دکھائیں" />
            </Index>
          </div>
        </EmptyQueryBoundary>
      </InstantSearchNext>
    </div>
  );
}
