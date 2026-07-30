# Instagram — evergreen content bank

70 carousels and 30 reels, written to be worked through rather than published at
once. Start at [`CALENDAR.md`](./CALENDAR.md).

Nothing here touches the website. It's a content bank that happens to live in the
repo so it's versioned and so the brand system stays a single source of truth —
the slide templates read the same colour tokens as `src/app/globals.css`.

## Layout

```
CALENDAR.md                   the index — generated, don't hand-edit
posts/<date>-<slug>/
  meta.json                   date, pillar, format, CTA, hashtags, status
  caption.md                  paste-ready caption, hook first, 4 tags last
  slides.json                 the 7 slide specs
  photos/                     drop photographs here as 02.jpg to match a photo slide
  slides/01.jpg … 07.jpg      1080×1350, ready to upload
  slides/_preview.html        all seven in one scrollable page
reels/<date>-<slug>/
  meta.json
  transcript.md               your read-aloud script, timed
  frames.json                 the on-screen text beats
  frames/01.jpg … NN.jpg      1080×1920 storyboard frames
  footage.md                  what to shoot or pull, per frame, with rights basis
  slate.webm                  silent timing reference — talk over this
  assemble.sh                 builds the real mp4 mastercut
  footage/                    drop b-roll here as 01.mp4, 02.mp4 …
_system/                      templates, renderer, research
```

## Adding photographs

The carousels are typographic and complete as they stand — you can post any of
them tonight. If you want a photograph in one, `_system/PHOTO-BRIEF.md` names
the single shot that would strengthen each deck, where to source it, and the
JSON snippet to paste. Drop the image in as `photos/02.jpg`, add the snippet to
`slides.json`, re-render. The `photo` template duotones it onto the cream stock
so it reads as part of the set rather than a stock photo dropped in.

Nothing here ships with borrowed photography: I couldn't reach any image host
from the build environment, and more to the point, the rights position matters —
see the footage note below, which applies equally to stills.

## Publishing a carousel

Open the folder, upload `slides/01.jpg` … `07.jpg` in order, paste `caption.md`.
That's it. The captions already carry the hashtags (four — see below) and any
UTM-tagged link.

## Publishing a reel

1. Read `transcript.md`. It's written to be spoken at about 2.6 words a second,
   and the word count is stated so you can check yourself against the clock.
2. Either film/pull the b-roll listed in `footage.md`, dropping clips into
   `footage/` as `01.mp4`, `02.mp4` … to match the frame each replaces —
3. — or skip that and talk straight over `slate.webm`, which holds each
   storyboard frame for its scripted duration.
4. Run `./assemble.sh` to get `<slug>-mastercut.mp4`: 1080×1920, H.264, silent
   audio track, cut timings already matching the transcript. Import that into
   CapCut / Descript / Premiere and record your voice over it.

`assemble.sh` needs a full ffmpeg (`brew install ffmpeg`). It won't run in the
cloud session that generated this — see the note below.

## Why there's a .webm and not a finished mp4

The container this was built in has only Playwright's bundled ffmpeg, compiled
`--disable-everything`: VP8 out, mjpeg in, no H.264, no mp4 muxer, no audio
codecs at all. So the timing slate is a silent VP8 `.webm` — genuinely useful to
talk over, not publishable. The publishable cut is `assemble.sh`, which runs
where a real ffmpeg exists. Instagram won't take the webm; it will take the
mastercut.

## House rules baked into this bank

Derived from `_system/research-*.md`, which cite their sources.

- **7 slides** per carousel. 5–8 is the completion/save sweet spot; past 10 it
  falls away.
- **Slide 2 is a second cover.** Instagram re-serves a non-swiped carousel
  starting from slide 2, so it has to stand alone.
- **4 hashtags.** Not 20. Instagram now enforces roughly a 5-tag cap, and
  Mosseri has said plainly that hashtags aren't a reach mechanism — they index,
  they don't distribute. Keywords in the caption do more work.
- **Judge on saves and sends, not likes.** A send is worth several likes in
  ranking, and forwarding a sailing to the person you'd travel with is native
  behaviour for this audience — which is why so many CTAs ask for exactly that.
- **Reels: the first 1.7 seconds decide it.** Frame 1 carries a ≤6-word claim
  and the spoken hook names the specific thing immediately.
- **Burned-in captions are not optional** — most of the audience watches muted.
  On-screen text changes every 1.5–3s.
- Reel lengths by format: listicle 22–40s, post-mortem 50–75s, reaction 30–50s,
  compilation 12–25s and looping.

## Two things to know before you post

**Reels are the looser lane, deliberately.** The carousels sit inside the Brand
Bible. The reels cover mishaps, blunt critique and things that went wrong,
because that's what travels — and because you're voicing them yourself as a
human first and an advisor second. They still never punch down at a passenger,
and every complaint resolves into the better alternative.

**Footage rights.** Every clip request in `footage.md` names a source and a
rights basis, and they fall into three buckets: shoot it yourself, get it from
your BDM or the line's trade portal, or genuinely licence-free stock.

Worth being straight about one thing: the viral "left at the dock" clips are
filmed and owned by individual passengers. No cruise line can license those to
you, so none of the mishap reels repost them — they reconstruct, with you to
camera and on-screen text carrying the story. And most cruise-line *press
centres* license assets for editorial coverage **of the line**, not for an
advisor's own brand promotion. The press-centre URLs are collected in
`_system/research-topics.md`, but the clean channel is your BDM or the advisor
portal. Anything sourced that way is marked "confirm with BDM" rather than
cleared.

## Regenerating

```bash
node content/instagram/_system/render.mjs              # all slides + frames + slates
node content/instagram/_system/render.mjs 2026-08-04   # just matching folders
node content/instagram/_system/build-calendar.mjs      # rebuild CALENDAR.md + lint
```

`build-calendar.mjs` also checks the bank: slide counts, hashtag counts, frame
durations against stated runtimes, words-per-second, missing files, and lists
that promise "four things" but ship three. Run it after editing anything.

To change how slides look, edit `_system/templates.mjs` and re-render — the
copy lives in JSON, so restyling all 700-odd images is one command.
