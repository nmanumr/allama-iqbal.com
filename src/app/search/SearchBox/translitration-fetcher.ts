const cache = new Map();

export default function getTransliterationFetcher() {
  let lastRequestSignal: AbortController | undefined;

  return (query: string, lang: "ur" | "fa" = "ur") => {
    if (!query || query.length < 2 || !/^[\x00-\x7F]*$/.test(query)) {
      return [];
    }

    if (lastRequestSignal) {
      lastRequestSignal.abort("Test");
    }

    lastRequestSignal = new AbortController();
    return fetchTransliterations(query, lang, lastRequestSignal).then((res) => {
      lastRequestSignal = undefined;
      return res;
    });
  };
}

export async function fetchTransliterations(query: string, lang: "ur" | "fa" = "ur", controller?: AbortController) {
  const cacheKey = `${lang}-${query}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  let response;
  try {
    const res1 = await fetch(
      `https://inputtools.google.com/request?text=${query}&itc=${lang}-t-i0-und&num=4&cp=0&cs=1&ie=utf-8&oe=utf-8`,
      { signal: controller?.signal },
    );
    response = await res1.json();
  } catch (e) {
    return [];
  }
  const suggestions = response[1][0][1] as string[];

  if (suggestions.length > 1) {
    cache.set(cacheKey, suggestions);
  }
  return suggestions;
}
