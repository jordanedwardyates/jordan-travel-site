import type { Block } from "./content";

/**
 * Destination guides — editorial region pages that double as an advisor's
 * counsel and a way into a quote. Authored here, in Jordan's voice.
 */

export type Destination = {
  slug: string;
  /** e.g. "The Greek Isles". */
  name: string;
  /** Standfirst line under the title. */
  dek: string;
  /** Latitude/longitude label for the chart flourish, e.g. "37°N · 25°E". */
  coordinates: string;
  /** Higher shows first on the index. */
  order: number;
  /** Opening essay. */
  intro: Block[];
  /** "When to sail" — a short seasonal read. */
  whenToSail: string;
  /** Ports worth the time — name + one honest line each. */
  ports: { name: string; note: string }[];
  /** Ships / lines that do the region right — line + why. */
  ships: { name: string; note: string }[];
  /** Optional Field Note slug to cross-link. */
  relatedNote?: string;
};

const DESTINATIONS: Destination[] = [
  {
    slug: "the-greek-isles",
    name: "The Greek Isles",
    dek: "The Aegean and its scattered islands — white towns, low light, and water the colour of a good afternoon.",
    coordinates: "37°N · 25°E",
    order: 30,
    relatedNote: "santorini-before-the-crowds",
    intro: [
      {
        type: "para",
        text: "There is no single Greece. The Cyclades — Santorini, Mykonos, Naxos — are the postcard: whitewashed, wind-scoured, dazzling. But sail east to the Dodecanese and you find the Crusader stone of Rhodes and the quiet of Symi; go north and Thessaloniki opens onto a different, older country entirely. The pleasure of the Aegean is that a week of it can hold four Greeces, and the right itinerary makes them rhyme.",
      },
      {
        type: "para",
        text: "This is small-ship country. The islands worth the trouble are often the ones the large vessels cannot reach, and the ports that can take a megaship tend to be the ones already braced for one. My counsel here almost always begins with the size of the room.",
      },
    ],
    whenToSail:
      "Late April into June, then September into early October. July and August are hot, bright, and busy — beautiful, but you share every view. The shoulder months give you the same sea, longer light, and islands that still belong to the people who live on them.",
    ports: [
      {
        name: "Santorini",
        note: "Worth every bit of its reputation — if you arrive in the morning rather than the afternoon crush. Ask me to choose the sailing.",
      },
      {
        name: "Náfplio",
        note: "The mainland's most graceful town, and a gateway to Epidaurus and Mycenae. Overlooked precisely because it is not an island.",
      },
      {
        name: "Symi",
        note: "A neoclassical harbour in ochre and rose that the big ships sail past. The reward for being on a small one.",
      },
      {
        name: "Rhodes",
        note: "The medieval old town is genuinely medieval — a walled Crusader city, best walked before the day-trippers land.",
      },
    ],
    ships: [
      {
        name: "Small-ship & yacht-style lines",
        note: "For the Cyclades and Dodecanese, a few hundred guests is the point — they berth where the cities cannot.",
      },
      {
        name: "Premium ocean lines",
        note: "A sensible middle for a first Aegean sailing: real range, good value, and I can usually negotiate the veranda categories well.",
      },
    ],
  },
  {
    slug: "the-adriatic",
    name: "The Adriatic",
    dek: "The Dalmatian coast — Venetian stone, walled towns, and a sea that Croatia has quietly perfected.",
    coordinates: "43°N · 16°E",
    order: 20,
    relatedNote: "shoulder-season-on-the-adriatic",
    intro: [
      {
        type: "para",
        text: "The eastern Adriatic is what the Mediterranean looked like before the twentieth century got to it: a string of walled towns built by Venice, wrapped in stone the colour of honey, set against water that has no business being that clear. Croatia holds most of the coastline and nearly all of the fame, but the small run south into Montenegro — the fjord-like Bay of Kotor — is, for my money, the finest single morning on the whole sea.",
      },
      {
        type: "para",
        text: "Distances here are short and the towns are close together, which makes it ideal cruising country: you wake in a new harbour most mornings without ever feeling rushed between them.",
      },
    ],
    whenToSail:
      "Late May and again in September. The coast is a furnace of visitors in July and August — Dubrovnik especially — and a different, better place in the shoulder weeks, when the fares soften and the walls empty out.",
    ports: [
      {
        name: "Dubrovnik",
        note: "The walled old town deserves its billing. Walk the ramparts early, before the tenders and the coaches converge.",
      },
      {
        name: "Kotor",
        note: "Montenegro's great set piece — a walled town at the head of a bay so steep it reads as a fjord. The approach alone earns the trip.",
      },
      {
        name: "Korčula",
        note: "A miniature, quieter Dubrovnik that claims Marco Polo as a son. The kind of place small ships were made for.",
      },
      {
        name: "Split",
        note: "A living Roman palace with a city grown up inside its walls — Diocletian's retirement home, now full of cafés.",
      },
    ],
    ships: [
      {
        name: "Small-ship lines",
        note: "The Dalmatian islands reward the shallow draught and the small harbour. This is not megaship water.",
      },
      {
        name: "Luxury & expedition-style vessels",
        note: "For the Bay of Kotor and the quieter islands, a smaller luxury ship gets you in close and keeps the day unhurried.",
      },
    ],
  },
  {
    slug: "the-norwegian-fjords",
    name: "The Norwegian Fjords",
    dek: "The far north — sheer walls, hanging water, and a scale of landscape the Mediterranean cannot answer.",
    coordinates: "62°N · 7°E",
    order: 10,
    intro: [
      {
        type: "para",
        text: "If the Aegean is about light, the fjords are about scale. This is the one region where the landscape genuinely dwarfs the ship — a mile-high wall of rock rising straight out of water so deep the vessel can sit almost against the cliff, with waterfalls hanging off the top like loose thread. Photographs undersell it, because a photograph has no way to say how big it is.",
      },
      {
        type: "para",
        text: "It is also a region where the ship's route is the attraction. The best hours are spent simply sailing — Geirangerfjord, the Nærøyfjord — with nowhere to be but on deck. Choose the itinerary for its water, not only its ports.",
      },
    ],
    whenToSail:
      "June and July, for the long light — the sun barely sets, and the days feel twice their length. May and August work and cost less; by late September the season closes and the weather turns serious.",
    ports: [
      {
        name: "Geiranger",
        note: "The most famous fjord for good reason. The approach by ship, past the Seven Sisters falls, is the whole point.",
      },
      {
        name: "Flåm",
        note: "A tiny village at the end of a long arm of water, and the start of one of the world's great short railways.",
      },
      {
        name: "Bergen",
        note: "The handsome, rainy gateway city — the Hanseatic wharf and the fish market earn a day before or after the fjords.",
      },
      {
        name: "Ålesund",
        note: "Rebuilt in Art Nouveau after a fire, and quietly one of the prettiest towns on the coast.",
      },
    ],
    ships: [
      {
        name: "Premium ocean lines",
        note: "The fjords suit a mid-size ship well — enough deck to enjoy the scenic cruising, enough range to reach the good water.",
      },
      {
        name: "Expedition-style vessels",
        note: "For the narrower arms and the smaller villages, a smaller ship goes where the big ones must turn around.",
      },
    ],
  },
];

/** All destinations, most-featured first. */
export function getDestinations(): Destination[] {
  return [...DESTINATIONS].sort((a, b) => b.order - a.order);
}

export function getDestination(slug: string): Destination | null {
  return DESTINATIONS.find((d) => d.slug === slug) ?? null;
}
