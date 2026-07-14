-- OPTIONAL SEED — the three SAMPLE sailings from the Phase 3 layout.
-- These are illustrative placeholders, NOT live quotes. Run this only if
-- you want the homepage populated while you prepare real journeys, and
-- replace them before launch. Running it twice will insert duplicates.

insert into public.journeys
  (region, dates, route_title, voyage_title, cruise_line, ship, nights,
   embark, disembark, port_count, stateroom, room_size, their_price,
   your_price, price_note, jordans_take, availability_note,
   is_published, sort_order)
values
  ('Mediterranean', '3–10 Oct 2026', 'Trieste to Athens',
   'Mediterranean Jewels', 'Oceania Cruises', 'Oceania Allura', 7,
   'Trieste, Italy', 'Athens, Greece', 4, 'Veranda Stateroom',
   'approx. 27 m²', '$2,999', '$2,749', 'plus shipboard credit',
   'The Adriatic in October light — after the summer ferries thin out and the harbor towns get their evenings back.',
   'Veranda categories on autumn sailings are often the first to fill.',
   true, 1),
  ('The Danube', '6–13 Sep 2026', 'Budapest to Vilshofen',
   'Gems of the Danube', 'Scenic', 'Scenic Opal', 7,
   'Budapest, Hungary', 'Vilshofen, Germany', 6, 'Royal Balcony Suite',
   'approx. 21 m²', '$9,480', '$8,880', null,
   'September is harvest on the Danube — the Wachau terraces are picking grapes, the summer crowds are gone, and the light on the river is the whole reason painters moved here.',
   'Suites on river ships are always limited.',
   true, 2),
  ('Greece & Turkey', '15–25 Aug 2026', 'Istanbul to Athens',
   'Iconic Greece & Turkey', 'Regent Seven Seas', 'Seven Seas Voyager', 10,
   'Istanbul, Turkey', 'Athens, Greece', 5, 'Veranda Suite',
   'approx. 33 m²', '$7,999', '$7,591', 'all-inclusive fare',
   'Ten nights lets this one breathe — an overnight in Istanbul rather than a drive-by is the whole point.',
   null,
   true, 3);
