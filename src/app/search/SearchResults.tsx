import Fuse from "fuse.js";

import { SizeProvider, Verse } from "@/app/[book]/[section]/[poem]/components";

interface SearchResultsProps {
  query: string;
  index: Fuse<{ id: string; content: string }>;
}

export default function SearchResults({ query, index }: SearchResultsProps) {
  const result = index.search(query);

  return result.slice(0, 10).map((element) => {
    return (
      <div key={element.item.id} className="boder-gray-300 border-b py-4">
        <SizeProvider>
          {element.item.content
            .split("\n")
            .map((line, i) => [i, line] as const)
            .map(([i, line]) => (
              <Verse content={line} key={i} />
            ))}
        </SizeProvider>
      </div>
    );
  });
}
