import type { Block } from "./content";

/**
 * Field Notes — the house journal. Short, opinionated essays in Jordan's
 * voice: what he's learned from sailings, ship visits, and kept notes.
 * Editorial content, authored here rather than in the quote database.
 */

export type FieldNote = {
  slug: string;
  title: string;
  /** Standfirst — the italic line under the title. */
  dek: string;
  /** Small-caps kicker: the subject bucket. */
  category: string;
  /** Display date, e.g. "June 2026". Also drives sort order via `order`. */
  date: string;
  /** Higher shows first. */
  order: number;
  readingMinutes: number;
  /** Optional destination slug this note is in conversation with. */
  relatedDestination?: string;
  body: Block[];
};

const NOTES: FieldNote[] = [
  {
    slug: "the-case-for-the-smaller-ship",
    title: "The Case for the Smaller Ship",
    dek: "Why the vessel that carries a few hundred often beats the one that carries a few thousand.",
    category: "On Ships",
    date: "June 2026",
    order: 30,
    readingMinutes: 4,
    body: [
      {
        type: "para",
        text: "The first question most people ask me is which line is best. It is the wrong question. The right one is how many people you want to share your holiday with — because that single number quietly decides almost everything else about the trip.",
      },
      {
        type: "para",
        text: "A ship carrying three thousand guests is a small city, and it behaves like one. It docks where a city can dock: the large commercial ports, often a shuttle-ride from the place you actually came to see. It boards and disembarks on a civic timetable. It tenders in waves. None of this is a flaw in the ship; it is simply the arithmetic of scale.",
      },
      {
        type: "subhead",
        text: "What smaller buys you",
      },
      {
        type: "para",
        text: "A ship carrying two or three hundred plays by different rules. It slips into the small harbours the big vessels cannot enter — the fishing town rather than the industrial terminal, the island the day-trippers never reach. You step off onto the quay, not onto a queue. Dinner is never a reservation you had to win. And the crew, blessedly, learn your name by the second morning.",
      },
      {
        type: "pull",
        text: "You are not paying for a bigger boat. You are paying for a shorter distance between you and the place.",
      },
      {
        type: "para",
        text: "There is a fair trade to acknowledge. The smaller ship has fewer restaurants, no West End show, no third pool. If those are the point of the holiday for you, I will happily point you to a larger vessel and negotiate it well. But for the traveller whose holiday is the destination — the harbour at dusk, the market before the coaches arrive — the smaller ship is not a luxury. It is the whole argument.",
      },
      {
        type: "para",
        text: "So when we talk, expect me to ask about people before I ask about ports. The size of the room decides the size of the trip.",
      },
    ],
  },
  {
    slug: "shoulder-season-on-the-adriatic",
    title: "Shoulder Season on the Adriatic",
    dek: "The fortnight either side of summer is, quietly, the best time to sail the Dalmatian coast.",
    category: "On Timing",
    date: "May 2026",
    order: 20,
    readingMinutes: 3,
    relatedDestination: "the-adriatic",
    body: [
      {
        type: "para",
        text: "High summer on the Adriatic is a wonderful thing to read about and a difficult thing to stand in. Dubrovnik in mid-July receives more visitors in a morning than its old town was built to hold in a week. The stone holds the heat. The walls have a queue. It is still beautiful — beauty is hard to ruin — but you spend the day negotiating with the crowd for a glimpse of it.",
      },
      {
        type: "para",
        text: "Move the same trip to late May, or to the second half of September, and the coast returns to itself. The sea is still warm enough to swim. The light lengthens rather than blazes. And the towns — Korčula, Hvar, Kotor across the border — go back to being places where people live rather than places people photograph.",
      },
      {
        type: "pull",
        text: "The destination does not change. The number of people between you and it does.",
      },
      {
        type: "para",
        text: "There is a practical dividend, too. Shoulder-season sailings are where the genuine value lives — the fares soften, the better cabins open up, and the same ship costs meaningfully less than it did three weeks earlier. It is the rare case where the quieter choice is also the cheaper one.",
      },
      {
        type: "para",
        text: "My only caution is to book the shoulder, not the edge. The first week of October can turn; the last week of April can stay cool. The sweet spots are narrower than the brochures suggest, and they are exactly the sort of thing worth a short conversation before you commit.",
      },
    ],
  },
  {
    slug: "santorini-before-the-crowds",
    title: "Santorini, Before the Crowds",
    dek: "The most photographed island in the Aegean is still worth it — if you meet it on the right terms.",
    category: "On Places",
    date: "April 2026",
    order: 10,
    readingMinutes: 3,
    relatedDestination: "the-greek-isles",
    body: [
      {
        type: "para",
        text: "I am often asked whether Santorini is overrated. The honest answer is that it is neither over- nor under-rated; it is mistimed. Almost everyone arrives in the same four hours, on the same afternoon, to watch the same sunset from the same three hundred metres of Oía. Of course it feels like a scrum. You have been handed the island at its single worst moment and asked to judge the whole.",
      },
      {
        type: "para",
        text: "The trick is arrival. A ship that anchors in the caldera overnight, or one that comes in early rather than at midday, hands you the island in the morning — Fira before the funicular fills, the caldera path with the light still low and the cafés just opening. The view that launched a thousand postcards is genuinely worth the fuss. You simply want it at eight, not at six.",
      },
      {
        type: "pull",
        text: "It is not overrated. It is over-attended, for about four hours a day.",
      },
      {
        type: "para",
        text: "The second trick is to leave the rim. Most of the crowd never travels more than a few streets from where the tender lands. Twenty minutes inland there are villages — Pyrgos, Megalochori — with the same volcanic light and almost none of the traffic, and a glass of Assyrtiko tastes considerably better without a queue behind you.",
      },
      {
        type: "para",
        text: "So: yes to Santorini. But let me choose the sailing that gives you the morning, and I promise you will come home defending it rather than apologising for it.",
      },
    ],
  },
];

/** All notes, newest/most-featured first. */
export function getFieldNotes(): FieldNote[] {
  return [...NOTES].sort((a, b) => b.order - a.order);
}

export function getFieldNote(slug: string): FieldNote | null {
  return NOTES.find((n) => n.slug === slug) ?? null;
}
