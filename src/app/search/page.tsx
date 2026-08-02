"use client";

import { ReactNode } from "react";
import { Configure, Index, useInfiniteHits, useInstantSearch, useStats } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";

import { liteClient as algoliasearch } from "algoliasearch/lite";
import { type Hit as SearchHit } from "instantsearch.js";
import Link from "next/link";

import SearchBox from "@/app/search/SearchBox";
import EmptySearchIllustration from "@/components/EmptySearchIllustration";

const searchClient = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!, process.env.NEXT_PUBLIC_ALGOLIA_API_KEY!);

const INDEX_NAME = "verses";
const POEM_PAGE_SIZE = 5;
const VERSE_PAGE_SIZE = 20;
const VERSE_TEXT_ATTRIBUTES = ["content", "contentUrdu", "contentEnglish"];

// Function words that should never force a verse out of the results when the rest of the line matches.
const STOP_WORDS = new Set([
  "کے",
  "کی",
  "کا",
  "کو",
  "سے",
  "پر",
  "نے",
  "میں",
  "ہے",
  "ہیں",
  "تھا",
  "تھی",
  "اور",
  "بھی",
  "ہی",
  "تو",
  "کہ",
  "یہ",
  "وہ",
  "از",
  "در",
  "را",
  "بہ",
  "کن",
  "ای",
]);

function optionalStopWords(query: string) {
  return query.split(/\s+/).filter((word) => STOP_WORDS.has(word));
}

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

// InstantSearch queries Algolia with its own placeholder tags, then HTML-escapes each hit value and
// swaps the placeholders for literal `<mark>` tags. So highlights always arrive as escaped text with
// `<mark>` in it, whatever the index is configured to use — parse that, and unescape what's left.
const HIGHLIGHT_PATTERN = /<mark>([\s\S]*?)<\/mark>/g;

function unescapeHighlight(value: string) {
  return value
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&");
}

/** Turns an Algolia highlight value into nodes, marking the matched words. */
function highlightNodes(value: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of value.matchAll(HIGHLIGHT_PATTERN)) {
    const start = match.index ?? 0;

    if (start > cursor) {
      nodes.push(unescapeHighlight(value.slice(cursor, start)));
    }

    nodes.push(
      <mark className="rounded-[2px] bg-yellow-100/80 text-inherit" key={start}>
        {unescapeHighlight(match[1])}
      </mark>,
    );
    cursor = start + match[0].length;
  }

  if (cursor < value.length) {
    nodes.push(unescapeHighlight(value.slice(cursor)));
  }

  return nodes;
}

function highlighted(hit: SearchHit<SearchHitItem>, attribute: "content" | "poemName", fallback: string) {
  const value = (hit._highlightResult?.[attribute] as { value?: string } | undefined)?.value;
  return value ? highlightNodes(value) : [fallback];
}

const FOCUS_RING = "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700/40";
const RESULT_ROW =
  "group relative border-b border-[#EFEDE8] px-4 py-3.5 font-mehr-nastaliq transition-colors duration-[120ms] last:border-b-0 hover:bg-[#FAFAF8] motion-reduce:transition-none";
// Stretches the result's own link across the whole row, so the hover band and the hit target match.
// Source links sit above it on their own stacking layer and stay independently clickable.
const STRETCHED_LINK = `block text-2xl leading-[1.9] after:absolute after:inset-0 after:content-[''] ${FOCUS_RING}`;
const SOURCE_LINK = `whitespace-nowrap transition-colors duration-[120ms] hover:text-green-700 motion-reduce:transition-none ${FOCUS_RING}`;

/** Where the hit comes from: quiet, small, and always on its own edge of the row. */
function ResultSource({
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
    <div className="relative z-10 flex w-fit items-center gap-x-1.5 text-[13px] leading-[1.6] text-[#9A9A9A] transition-colors duration-[120ms] group-hover:text-[#6B6B6B] motion-reduce:transition-none">
      <Link className={SOURCE_LINK} href={`/${bookId}`}>
        {bookName}
      </Link>
      {sectionName && (
        <>
          <span aria-hidden>&#183;</span>
          <Link className={SOURCE_LINK} href={`/${bookId}?hash=${sectionId}`}>
            {sectionName}
          </Link>
        </>
      )}
      {showPoem && poemName && (
        <>
          <span aria-hidden>&#183;</span>
          <Link className={`truncate ${SOURCE_LINK}`} href={`/${bookId}/${sectionId}/${poemId}`}>
            {poemName}
          </Link>
        </>
      )}
    </div>
  );
}

/**
 * One misra. Unlike `Verse` on the reading page this wraps freely — no shared min-width and no
 * justification, both of which are column-alignment devices that misbehave in a results list.
 */
function VerseLine({ children }: { children: ReactNode }) {
  return <div className="[text-wrap:balance]">{children}</div>;
}

function PoemSearchResult({ hit }: { hit: SearchHit<SearchHitItem> }) {
  const [bookId, sectionId, poemId] = hit.id.split("/");
  const title = poemTitle(hit);

  return (
    <div
      className={`${RESULT_ROW} flex flex-col gap-y-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-x-8`}
    >
      <Link className={STRETCHED_LINK} href={`/${bookId}/${sectionId}/${poemId}`}>
        {highlighted(hit, "poemName", title)}
      </Link>
      <ResultSource
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
  const lines = highlighted(hit, "content", hit.content);

  return (
    <div className={RESULT_ROW}>
      <Link className={STRETCHED_LINK} href={`/${bookId}/${sectionId}/${poemId}/?hash=cplt${stanzaId}`}>
        {splitLines(lines).map((line, i) => (
          <VerseLine key={i}>{line}</VerseLine>
        ))}
      </Link>
      <div className="relative z-10 mt-1 w-fit">
        <ResultSource
          bookId={bookId}
          sectionId={sectionId}
          poemId={poemId}
          bookName={hit.bookName}
          sectionName={hit.sectionName}
          poemName={title}
          showPoem
        />
      </div>
    </div>
  );
}

/** Re-splits highlighted nodes on newlines so each misra stays its own measured line. */
function splitLines(nodes: ReactNode[]): ReactNode[][] {
  const lines: ReactNode[][] = [[]];

  for (const node of nodes) {
    if (typeof node !== "string") {
      lines[lines.length - 1].push(node);
      continue;
    }

    const parts = node.split("\n");
    lines[lines.length - 1].push(parts[0]);

    for (const part of parts.slice(1)) {
      lines.push([part]);
    }
  }

  return lines.filter((line) => line.some((node) => node !== ""));
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
  const { nbHits } = useStats();

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mb-10">
      <h2 className="mb-2 flex items-baseline gap-x-2 border-b border-[#EFEDE8] px-4 pb-2 text-lg text-[#9A9A9A]">
        <span>{heading}</span>
        <span className="text-sm">{nbHits}</span>
      </h2>
      {items.map((hit) => (
        <HitComponent hit={hit} key={hit.objectID} />
      ))}
      {!isLastPage && (
        <button
          className={`px-4 pt-4 text-[13px] text-[#9A9A9A] transition-colors duration-[120ms] hover:text-green-700 motion-reduce:transition-none ${FOCUS_RING}`}
          onClick={showMore}
          type="button"
        >
          {moreLabel}
        </button>
      )}
    </section>
  );
}

function SearchResults() {
  const { indexUiState } = useInstantSearch();
  const optionalWords = optionalStopWords(indexUiState.query ?? "");

  return (
    <div className="mt-10">
      <Index indexId="poem-hits" indexName={INDEX_NAME}>
        <Configure filters="type:poem" hitsPerPage={POEM_PAGE_SIZE} />
        <HitSection heading="نظمیں" hitComponent={PoemSearchResult} moreLabel="مزید نظمیں دکھائیں" />
      </Index>
      <Index indexId="verse-hits" indexName={INDEX_NAME}>
        {/* Text only: book/section/poem names outrank `content` in searchableAttributes, so leaving
            them searchable here fills the verse list with every verse of a matching section. */}
        <Configure
          distinct
          filters="type:verse"
          hitsPerPage={VERSE_PAGE_SIZE}
          optionalWords={optionalWords}
          restrictSearchableAttributes={VERSE_TEXT_ATTRIBUTES}
        />
        <HitSection heading="اشعار" hitComponent={VerseSearchResult} moreLabel="مزید اشعار دکھائیں" />
      </Index>
    </div>
  );
}

function ResultsBoundary({ children }: { children: ReactNode }) {
  const { indexUiState, scopedResults, status } = useInstantSearch();
  const query = indexUiState.query?.trim();
  const hasHits = scopedResults.some(({ results }) => (results?.nbHits ?? 0) > 0);

  if (!query) {
    return (
      <>
        <EmptyState />
        <div hidden>{children}</div>
      </>
    );
  }

  if (!hasHits && status === "idle") {
    return (
      <>
        <NoResults query={query} />
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

function NoResults({ query }: { query: string }) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex max-w-md flex-col items-center text-center">
        <EmptySearchIllustration />
        <div className="mt-4 text-xl">
          <span className="text-gray-500">کوئی نتیجہ نہیں ملا: </span>
          {query}
        </div>
        <div className="mt-2 text-gray-500">
          املا دوبارہ دیکھیں، یا کم الفاظ استعمال کریں۔ شعر کا صرف ایک ٹکڑا بھی کافی ہے۔
        </div>
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
        <ResultsBoundary>
          <SearchResults />
        </ResultsBoundary>
      </InstantSearchNext>
    </div>
  );
}
