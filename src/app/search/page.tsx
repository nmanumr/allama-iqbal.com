"use client";

import { ReactNode } from "react";
import { Hits, useInstantSearch } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";

import { liteClient as algoliasearch } from "algoliasearch/lite";
import { type Hit as SearchHit } from "instantsearch.js";
import Link from "next/link";

import { SizeProvider, Verse } from "@/app/[book]/[section]/[poem]/components";
import SearchBox from "@/app/search/SearchBox";

const searchClient = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!, process.env.NEXT_PUBLIC_ALGOLIA_API_KEY!);

function SearchResult({ hit }: { hit: SearchHit<{ id: string; content: string }> }) {
  const ids = hit.id.split("/");
  const stanzaId = ids.pop();

  return (
    <Link href={`/${ids.join("/")}?cplt=${stanzaId}`} className="boder-gray-300 block border-b py-4">
      <SizeProvider>
        {hit.content
          .split("\n")
          .map((line, i) => [i, line] as const)
          .map(([i, line]) => (
            <Verse content={line} key={i} />
          ))}
      </SizeProvider>
    </Link>
  );
}

function EmptyQueryBoundary({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { indexUiState } = useInstantSearch();

  if (!indexUiState.query) {
    return (
      <>
        {fallback}
        <div hidden>{children}</div>
      </>
    );
  }

  return children;
}

export default function App() {
  return (
    <div
      className="mx-auto px-4 py-10 font-nastaliq leading-[2] sm:px-6 md:max-w-2xl md:px-4 lg:max-w-4xl lg:px-12"
      dir="rtl"
    >
      <InstantSearchNext future={{ preserveSharedStateOnUnmount: true }} searchClient={searchClient} indexName="verses">
        <SearchBox />
        <EmptyQueryBoundary>
          <Hits hitComponent={SearchResult} />
        </EmptyQueryBoundary>
      </InstantSearchNext>
    </div>
  );
}
