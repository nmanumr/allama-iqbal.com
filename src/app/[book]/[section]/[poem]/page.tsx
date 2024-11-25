import { SizeProvider, Stanza } from "./components";
import type PoemType from "@/assets/content/armaghan-e-hijaz/01/01.json";
import { Metadata } from "next";

type Props = {
  params: Promise<{ book: string; section: string; poem: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { book, section, poem: poemId } = await params;

  const poem = await import(`../../../../assets/content/${book}/${section}/${poemId}.json`).then(
    (m) => m.default as typeof PoemType,
  );

  const description = `Explore the profound words of Allama Iqbal in '${poem?.name}' from his book '${poem.bookName}'. Dive deep into his philosophical and poetic genius.`;
  const title = `${poem?.name} - ${poem.bookName}`;

  return {
    title: `${title} | allama-iqbal.com`,
    openGraph: {
      type: 'article',
      title,
      description,
      siteName: 'Iqbal\'s Poetry',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    authors: {name: 'Allama Iqbal'},
    keywords: `Iqbal, Poetry, ${poem.bookName}, ${poem?.name}, Allama Iqbal Poems, Urdu Poetry, Persian Poetry`,
    description,
  };
}

export default async function Poem({ params }: Props) {
  const { book, section, poem: poemId } = await params;

  const poem = await import(`../../../../assets/content/${book}/${section}/${poemId}.json`).then(
    (m) => m.default as typeof PoemType,
  );

  const urTrans = true;
  const enTrans = true;

  return (
    <div className="px-4 py-10 text-center font-nastaliq leading-[2] sm:px-6 md:px-4 lg:px-12" dir="rtl">
      <div dir="ltr" className="flex max-w-fit items-center gap-x-4">
        <div>
          <div>Translation:</div>
        </div>
        <div className="flex items-center gap-x-2">
          <input className="relative -top-0.5" defaultChecked={enTrans} type="checkbox" id="show-en-translation" />
          <label htmlFor="show-en-translation">English</label>
        </div>
        <div className="flex items-center gap-x-2">
          <input className="relative -top-0.5" defaultChecked={urTrans} type="checkbox" id="show-ur-translation" />
          <label htmlFor="show-ur-translation">Urdu</label>
        </div>
      </div>

      <div dir="rtl" className="mb-10 text-center font-nastaliq leading-[2]">
        <div dir="rtl">
          {poem.bookName} &gt; {poem.sectionName}
        </div>
        <div className="mt-4 text-4xl leading-[2]">{poem?.name}</div>
      </div>

      <div className="flex flex-col items-center justify-center font-nastaliq text-2xl leading-[2.2] @container">
        {poem.Para.map((para) => (
          <SizeProvider key={para.id}>
            <Stanza urTrans={urTrans} enTrans={enTrans} para={para} />
          </SizeProvider>
        ))}
      </div>
    </div>
  );
}
