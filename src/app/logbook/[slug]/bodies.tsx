import type { ReactNode } from "react";

import TextLink from "@/components/TextLink";

/* Prose primitives — kept local to the Logbook so the reading column has its
   own measured rhythm without leaking global styles. */

function P({ children }: { children: ReactNode }) {
  return (
    <p className="mt-6 font-serif text-lg leading-[1.75] text-deep-harbor">
      {children}
    </p>
  );
}

function H({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-12 font-serif text-2xl tracking-tight text-deep-harbor">
      {children}
    </h2>
  );
}

function Lead({ children }: { children: ReactNode }) {
  // First paragraph carries a small-caps opening for a printed feel.
  return (
    <p className="mt-8 font-serif text-xl leading-[1.7] text-deep-harbor first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-6xl first-letter:leading-[0.8] first-letter:text-compass-gold">
      {children}
    </p>
  );
}

/**
 * Article bodies, keyed by slug. Metadata (title, dek, dates) lives in
 * src/lib/logbook.ts; this holds only the prose.
 */
export const LOGBOOK_BODIES: Record<string, ReactNode> = {
  "never-pay-retail": (
    <>
      <Lead>
        Never pay retail. It&rsquo;s the shortest way I know to say what I do for
        people, and I mean it as more than a slogan. A cruise fare is not a fixed
        price stamped on a shelf. It only looks that way from the outside &mdash;
        and the traveller who assumes the number on the website is <em>the</em>{" "}
        number is almost always the one who pays the most.
      </Lead>

      <P>
        Here is the part that surprises people first: booking through me does not
        cost you a penny more than booking direct. The cruise lines hold their
        published fares steady across every channel &mdash; their own site, their
        call centre, my desk. When you book with an advisor, the line pays the
        commission, not you. So the honest question is never &ldquo;what will an
        advisor add to the price?&rdquo; It&rsquo;s &ldquo;why would I book the
        same cabin, at the same price, and walk away with less?&rdquo;
      </P>

      <H>Where the real money lives</H>
      <P>
        The published fare is the ceiling, not the deal. Underneath it sits a
        whole layer most travellers never see: negotiated group space an advisor
        holds at better rates, amenity credits that turn into onboard spending
        money, prepaid gratuities, beverage or Wi-Fi packages, a better cabin in a
        better position for the same fare. None of that appears on the booking
        page, because the booking page is built to sell you the cabin, not to hand
        you the extras. That is my job, and I do it in the background on every
        booking &mdash; not as a favour, but as the baseline.
      </P>
      <P>
        There is also timing. When a line quietly drops a price or opens a
        promotion, they tell their trusted advisors first, before it&rsquo;s ever
        announced to the public. I watch your fare between the day you book and
        the day you pay in full, and if it moves in your favour, I move with it.
        Most people never think to look. Looking is half of what I&rsquo;m for.
      </P>

      <H>What &ldquo;never pay retail&rdquo; actually buys you</H>
      <P>
        It is not about squeezing a line for the cheapest possible number. The
        cheapest cabin on the wrong ship is no bargain. It&rsquo;s about making
        sure that whatever you sail, you sail it having captured every advantage
        that was quietly available &mdash; the credit, the upgrade, the perk, the
        better week, the fare drop &mdash; instead of leaving all of it on the
        table because no one told you it was there.
      </P>

      <P>
        So before you put your card down on a cruise-line website, let me look at
        it first. Same ship, same cabin, same price &mdash; and, nearly always,
        more in your pocket by the time you sail.{" "}
        <TextLink href="/journeys">Send me what you&rsquo;re considering</TextLink>{" "}
        and I&rsquo;ll show you the difference.
      </P>
    </>
  ),
  "one-line-or-the-right-line": (
    <>
      <Lead>
        Most people come to me having already decided on a brand. They&rsquo;ve
        seen one line&rsquo;s advertising, a friend sailed it once, and now
        they&rsquo;re shopping a single company as if it were the only ship on the
        water. That&rsquo;s the most expensive way to buy a cruise &mdash; not in
        dollars, but in what you end up with.
      </Lead>

      <P>
        I don&rsquo;t work for a cruise line. I work for you. That distinction is
        the whole point of an advisor, and it&rsquo;s why the first thing I do is
        widen the frame. If you&rsquo;re looking at one four-star luxury line,
        you should be weighing it honestly against its peers at the same level
        &mdash; Silversea against Seabourn, say &mdash; because they are genuinely
        comparable ships, and in any given season one of them is simply sailing
        better than the other.
      </P>

      <H>The part you can&rsquo;t get from a website</H>
      <P>
        A booking page can tell you a deck plan and a price. It can&rsquo;t tell
        you what I hear every week. I know which ship is impressing people right
        now and which one has quietly slipped. I&rsquo;ll hear that a particular
        vessel on a particular routing is nursing a plumbing issue, or that the
        service has fallen off since a crew change &mdash; and I&rsquo;ll say so
        before you book, not after you&rsquo;re aboard. That&rsquo;s the difference
        between shopping a brand and being advised: the advice is current, it&rsquo;s
        specific, and it&rsquo;s honest even when it costs me the easy sale.
      </P>
      <P>
        More often than you&rsquo;d think, that conversation ends with a switch.
        You came in set on one ship; I move you to a comparable one at the same
        tier that&rsquo;s having a better year &mdash; and I&rsquo;ve usually got a
        deal worked out with that line&rsquo;s rep that makes the better ship the
        better price, too. Same standard, happier sailing, and a fare you
        wouldn&rsquo;t have found on your own.
      </P>

      <H>Where the unsold cabins really go</H>
      <P>
        Here&rsquo;s something the lines don&rsquo;t advertise. Did you ever wonder
        where the cabins that go unbooked as a sailing fills in end up? They
        don&rsquo;t get posted on a billboard. When a line has space to move, they
        pick up the phone and call the advisors they trust to fill it well &mdash;
        and I&rsquo;m on that call. Those cabins come to me, and I place them with
        the clients they actually suit. You can&rsquo;t search your way to that
        inventory. You have to know the person holding it.
      </P>

      <P>
        So don&rsquo;t start by picking a line. Start by telling me what you want
        the voyage to feel like, and let me tell you &mdash; without a brand in the
        fight &mdash; which ship is worth your money this season.{" "}
        <TextLink href="/journeys">Tell me what you&rsquo;re weighing</TextLink> and
        I&rsquo;ll give you the unvarnished read.
      </P>
    </>
  ),
  "when-a-big-ship-is-the-right-call": (
    <>
      <Lead>
        People are sometimes surprised to hear a boutique advisor recommend a
        Royal Caribbean sailing. They shouldn&rsquo;t be. My work is not to sell
        the most expensive cabin on the smallest ship &mdash; it is to match a
        particular group of people to the voyage that will actually make them
        happy. And when that group spans three generations, the big ships very
        often win.
      </Lead>

      <P>
        The large mainstream lines &mdash; Royal Caribbean, Norwegian, MSC,
        Disney &mdash; are engineered to solve one specific and genuinely hard
        problem: keeping a six-year-old, a sixteen-year-old, their parents, and
        their grandparents all content on the same afternoon. That is not the
        problem a quiet luxury ship is built for, and pretending otherwise does a
        family no favours.
      </P>

      <H>What the megaships do brilliantly</H>
      <P>
        The defining feature of a large ship is that everyone can pursue a
        different day and still meet for dinner. The teenagers disappear to the
        surf simulator and the arcade; the youngest are in a supervised kids&rsquo;
        club the grandparents trust; the adults find a quiet deck, a spa, or a
        cooking class. No one is negotiating a single itinerary that pleases
        no one fully. On a small ship, that same range of ages is often stuck
        with each other &mdash; charming for a weekend, wearing for a week.
      </P>
      <P>
        There is also the matter of arithmetic. A multigenerational trip usually
        means three, four, or five staterooms. The large lines offer connecting
        cabins, family suites, and a fare structure that keeps the total within
        reach &mdash; which frequently decides whether the whole family can come
        at all. Flexible dining removes the nightly ordeal of getting nine people
        to a table at the same hour. These are unglamorous virtues, and they are
        exactly the ones that make or break a family sailing.
      </P>

      <H>When Royal Caribbean and its peers are the right call</H>
      <P>
        I point families toward a big ship when the group is genuinely wide in age
        &mdash; grandparents and grandchildren both aboard; when it is someone&rsquo;s
        first cruise and the sheer abundance of things to do lowers the stakes;
        when the budget has to stretch across many cabins; and when the point of
        the trip is the time together rather than any single port. For a reunion,
        a milestone birthday, or a first family voyage, the ship <em>is</em> the
        destination &mdash; and the big lines build the best version of that ship.
      </P>

      <H>When they are not</H>
      <P>
        The honest other half: a large ship is the wrong instrument for a couple
        seeking quiet, for travellers who care most about the food and wine, and
        for anyone whose reason to sail is the destination itself &mdash; the
        small harbours a megaship physically cannot enter. If the Aegean&rsquo;s
        quieter islands or a table worth crossing an ocean for is what you&rsquo;re
        after, we should be talking about very different ships. Knowing which
        conversation you&rsquo;re in is most of the job.
      </P>

      <H>Where an advisor still earns their place</H>
      <P>
        &ldquo;Book a big ship&rdquo; is not the end of the advice; it is the
        beginning. Which ship in the fleet &mdash; the newest and busiest, or a
        slightly older hull with more room to breathe? Which week, which cabins
        adjacent to one another, which dining plan for a group this size? And the
        fares on the large lines move constantly, which means the same sailing can
        be negotiated well or booked at retail. That is the part I do quietly in
        the background, whichever ship turns out to be right for you.
      </P>

      <P>
        If you&rsquo;re planning a trip with the whole family &mdash; the full span
        of ages, more cabins than you can count on one hand &mdash;{" "}
        <TextLink href="/journeys">tell me who&rsquo;s coming</TextLink> and I&rsquo;ll
        tell you honestly whether the answer is a grand ship or a small one.
      </P>
    </>
  ),
  "when-to-sail-the-greek-islands": (
    <>
      <Lead>
        There is a version of the Aegean that appears on postcards, and there is
        the Aegean as it actually behaves through the year &mdash; and the gap
        between the two is where a good voyage is won or lost. The islands do not
        have a single &ldquo;best&rdquo; season so much as a set of distinct ones,
        each with its own light, its own temperament, and its own crowd. Knowing
        which you are sailing into matters more than the ship you sail on.
      </Lead>

      <P>
        What follows is how I think about the calendar when a client asks the
        deceptively simple question: <em>when should we go?</em>
      </P>

      <H>Late spring: May into mid-June</H>
      <P>
        This is, for most travellers, the quietly correct answer. The hillsides
        are still green from the winter rains, the wildflowers have not yet
        surrendered to the sun, and the sea has warmed enough to swim without
        bravado. Days settle in the low twenties Celsius &mdash; warm in the sun,
        cool in the shade of a taverna &mdash; and the towns have shaken off
        winter without yet filling to the brim.
      </P>
      <P>
        The light in late spring is the thing people remember. It is clear and
        long and forgiving, the kind that makes whitewashed Cycladic villages look
        the way they do in your imagination. If your priority is walking the old
        towns in comfort and having a table to yourself at dinner, this is the
        window I steer toward first.
      </P>

      <H>High summer: July and August</H>
      <P>
        The peak season is peak for a reason, and I will never talk a family with
        school-age children out of the only weeks they can travel. But it is worth
        knowing what you are choosing. Midday heat becomes something to plan
        around rather than ignore; the marquee ports &mdash; Santorini above all
        &mdash; take on cruise crowds that can turn a caldera sunset into a queue.
      </P>
      <P>
        There is also the <em>meltemi</em>: a dry northerly wind that funnels down
        the Aegean through July and August, strongest in the afternoons. It is the
        reason a morning of glassy calm can become a lively afternoon at anchor,
        and occasionally the reason a tender port is swapped at short notice. A
        good itinerary in high summer is built with the meltemi in mind &mdash;
        smaller, more sheltered islands, mornings ashore, and a captain who plans
        for the wind rather than against it.
      </P>

      <H>Early autumn: September into October</H>
      <P>
        If pressed for my own favourite, I would name September. The sea is at its
        warmest, having banked heat all summer; the meltemi eases; and the August
        crowds thin noticeably once the European holidays end. The days are still
        generous, the evenings begin to soften, and the whole region seems to
        exhale. It is the connoisseur&rsquo;s month &mdash; all the warmth of
        summer, little of its congestion.
      </P>
      <P>
        By mid-October the season is turning. The light grows lower and more
        golden, some island tavernas begin to close for the winter, and the first
        weather systems arrive. For a traveller who prefers atmosphere to swimming,
        it can be lovely &mdash; but it asks for a little more flexibility.
      </P>

      <H>The quiet weeks worth asking about</H>
      <P>
        The most rewarding sailings are often the ones on the shoulders of the
        season &mdash; the last week of May, the first two of October &mdash; when
        prices soften, the marquee ports breathe, and the islands feel, briefly,
        like they belong to the people who live there. These are the weeks I watch
        for on behalf of clients who can travel outside the school calendar.
      </P>

      <P>
        None of this is meant to be prescriptive. The right week depends on what
        you want from the voyage &mdash; swimming or walking, quiet or colour,
        marquee islands or the ones no one has told you about yet. That is the
        conversation I would rather have than sell you a date. If the Aegean is on
        your mind, {" "}
        <TextLink href="/journeys">see what I have quoted this season</TextLink>{" "}
        &mdash; and tell me what you are hoping for.
      </P>
    </>
  ),
};
