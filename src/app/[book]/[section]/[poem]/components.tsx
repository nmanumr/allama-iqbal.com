"use client";

import { createContext, PropsWithChildren, use, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import type PoemType from "@/assets/content/armaghan-e-hijaz/01/01.json";

const SizeContext = createContext<{
  setChildSize: (size: number) => void;
  maxSize: number | undefined;
  fontsLoaded: boolean;
} | null>(null);

export function Stanza({
  para,
  urTrans,
  enTrans,
}: {
  para: (typeof PoemType)["Para"][0];
  urTrans: boolean;
  enTrans: boolean;
}) {
  const verses = Array.isArray(para.Verse) ? para.Verse : [para.Verse];

  return (
    <>
      {para.name && <div className="my-4 text-start text-2xl">{para.name}</div>}

      {verses.map((couplet) => {
        const originalText = couplet.Text.find((node) => node.lang === "Original")
          ?._content?.split("\n")
          .map((v) => v?.trim())
          .filter(Boolean);

        const urduText = couplet.Text.find((node) => node.lang === "Urdu")?._content;
        const englishText = couplet.Text.find((node) => node.lang === "English")?._content;

        const id = couplet.id;

        return (
          <SizeProvider key={id}>
            <div
              className={clsx(
                "relative w-full max-w-6xl border-b border-black/10 px-4 py-2",
                (urTrans || enTrans) && "grid-cols-5 lg:grid lg:gap-x-10",
              )}
              id={`cplt${id}`}
            >
              <div className="relative col-span-2 flex flex-col justify-center ps-8 font-mehr-nastaliq">
                {id && (
                  <a
                    href={`#cplt${id}`}
                    className="absolute inset-y-0 -start-2 flex items-center font-sans text-xl font-black text-gray-200 transition hover:text-gray-400"
                  >
                    {id}
                  </a>
                )}
                {originalText?.map((verse) => (
                  <div key={verse} className="flex justify-center">
                    <Verse content={verse} />
                  </div>
                ))}
              </div>

              {(urTrans || enTrans) && (
                <div className="col-span-3 mt-4 flex-col justify-center gap-y-0.5 text-center lg:mt-0 lg:flex">
                  {urTrans && (
                    <div className="whitespace-pre-line text-start font-mehr-nastaliq text-xl leading-[2]" dir="rtl">
                      {urduText}
                    </div>
                  )}
                  {enTrans && (
                    <div className="whitespace-pre-line text-start font-mehr-nastaliq text-sm" dir="ltr">
                      {englishText}
                    </div>
                  )}
                </div>
              )}
            </div>
          </SizeProvider>
        );
      })}
    </>
  );
}

function Verse({ content }: { content: string }) {
  const sizeContext = use(SizeContext);

  return (
    <div
      ref={(el) => {
        if (el?.clientWidth && sizeContext?.setChildSize && sizeContext?.fontsLoaded) {
          sizeContext.setChildSize(el?.clientWidth);
        }
      }}
      key={sizeContext?.fontsLoaded ? 'pending': 'loaded'}
      style={{ minWidth: sizeContext?.maxSize ? `${sizeContext?.maxSize}px` : undefined }}
      className={clsx("inline-block w-fit leading-[1.8]", sizeContext?.maxSize && "flex justify-between")}
    >
      {content
        .split(" ")
        .filter(Boolean)
        .map((word, index) => [word, index] as const)
        .map(([word, i]) => (
          <div key={i} className="inline-block px-0.5">
            {word}&nbsp;
          </div>
        ))}
    </div>
  );
}

export function SizeProvider({ children }: PropsWithChildren<object>) {
  const [maxSize, setMaxSize] = useState<number>();
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    document.fonts.ready.then(() => {
      setFontsLoaded(true);
    })
  }, []);

  return (
    <SizeContext.Provider
      value={{
        maxSize,
        setChildSize: (size) => {
          setMaxSize((s) => Math.max(s ?? 0, size));
        },
        fontsLoaded,
      }}
    >
      {children}
    </SizeContext.Provider>
  );
}
