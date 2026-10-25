# The Teigin Incident — Treatment

Style: **Woodcut Print** (`styles/woodcut/STYLE.md`), all invariants kept. 1920×1080, 30 fps (figures stepped on twos = 15 fps; camera, light and liquid on ones). English narration (locked script, 22 chapters), burned-in letterpress subtitles in the paper margin plus `.srt`. Target runtime 15–20 min.

Colour plate: **deep oxblood**, printed only out of carved white, reserved for three things: the liquid in the cups (ch. 4), the seal that is never pressed on the execution order (ch. 17–20), and the twelve remembered (ch. 21, end card). Everything else is ink on laid paper.

## 1. Three candidate structures

1. **Chronicle in plates.** A wordless-novel sequence: each chapter is a short run of self-contained plates, printed one after another in order: afternoon → hunt → arrest → trial → four decades of limbo. Clear for a 20-minute documentary with 22 chapters of narration; the risk is monotony, answered by changing the plate grammar per act (locked plates for the bank, maps and track-with-the-knife for the investigation, frames within frames for the prison).
2. **The same block recut.** One block, the bank's side door, carved deeper in every chapter, so that by the end the door has been cut away into the cell, the court and the map. Beautiful as a 60-second idea; at 20 minutes it cannot carry maps, cards and documents without breaking its own rule.
3. **Two blocks printed in turn.** The bank (1948) and the cell (1948–1987) alternate impressions until the last sheet carries both. Strong for the ending, but it would hold back the investigation chapters, which need their own documents.

**Chosen: 1, with the bookend from 3.** The film is a chronicle in plates, in four acts, and it opens and closes on the same block: the side door at 3:20 pm. In the opening the door is carved out of uncut black as the clock reaches 3:20; in the closing the same door is printed again, but its corner is left uncarved: black wood the knife never reached, the question no one answered. Opening image and ending both come from the topic (a knock at a side door after closing time; an unsolved case), not from the style's stock moves.

Acts:
- **I. The Afternoon** (ch. 1–6): locked plates, low camera, the interior of a bank after closing.
- **II. The Hunt** (ch. 7–11): documents, cards, maps; the camera tracks the knife along routes and lists.
- **III. The Confession and the Court** (ch. 12–16): frames within frames; the theory chapters drawn as maps marked THEORY.
- **IV. Thirty-Nine Years** (ch. 17–22): the unsigned order, years printed one over another, the cell, the twelve.

## 2. Logline and arc

A man with an armband walks into a Tokyo bank after closing and persuades sixteen people to drink poison; the painter convicted of the crime waits thirty-nine years for an execution no minister will sign, and the question of who the man at the door really was is never answered.

- **Setup**: trust in post-war Tokyo; the visitor; the cups.
- **Turn**: the card trail ends at a painter who cannot produce a card; a confession, a recantation, a death sentence.
- **Ending**: the sentence is never carried out; he dies in prison at 95; the twelve dead are named as twelve marks in oxblood; the door is printed one last time with a corner uncut.

## 3. Benchmark

- **Lynd Ward, *Gods' Man* (1929) and *Vertigo* (1937)** — learn: sequencing by self-contained plates; the city as massed black with carved windows; how a whole life reads in a handful of compositions. Don't take: any plate, figure, border, title lettering.
- **Errol Morris, *The Thin Blue Line* (1988)** — learn: a documentary about a doubtful conviction told through reconstructions treated as objects (the milkshake, the documents), repeated with variation; restraint at the scene of death. Don't take: shots, score, interview grammar.
- **Käthe Kollwitz, *War* series** — learn: grief carried by direction of the gouge and by empty space, never by depicting the dead. Don't take: figures or compositions.

## 4. Picture rules for this film

- **Respect**: no depiction of death, collapse or suffering. The poisoning is told with the sixteen cups, an empty counting room and counted stab marks. Survivors and staff are anonymous silhouettes, never individual likenesses.
- **Real people**: Sadamichi Hirasawa, Dr. Shigeru Matsui, Shirō Ishii, Tetsurō Morikawa, Seichō Matsumoto, Kei Kumai, William Triplett appear only as names (letterpress name cards). Hirasawa may appear as a portrait re-cut through `woodcutFilter` from a public-domain photograph, if one with a clear licence is found (logged in `credits.md`); otherwise a carved anonymous silhouette with his name card.
- **Documents and newspapers** are invented layouts labelled `ILLUSTRATIVE` in the margin. The business card, the cheque, the composite sketch and the execution order are illustrative reconstructions, never copies.
- **The Unit 731 / Noborito link** is always labelled `THEORY · NOT PROVEN` on screen, carved into the plate edge and set in the margin.
- Locked facts on screen: 16 drank; 10 died at the bank, 2 in hospital (12); 4 survived; ¥164,000 cash and a cheque for about ¥17,000; Yasuda Bank Oct 1947; Mitsubishi Bank 19 Jan 1948; arrest Aug 1948 in Otaru; death sentence 1950, upheld 1955; never executed; died 10 May 1987, aged 95.

## 5. Layout and type

- Paper margin fixed for the whole film: plate (block) area x 96–1824, y 54–846 (1728 × 792), ragged ink edge. Bottom margin y 846–1080 holds captions.
- **Subtitles**: IM Fell English, 40 px, ink, centred in the bottom margin, up to two lines, max ~64 characters per line. Ink comes up in 0.1 s, fades over 0.15 s, hold ≥ max(1.8 s, speech + 0.6 s). Cues split from per-sentence timings into ≤ 2-line chunks.
- **Small margin labels** (top-right of the bottom margin, IM Fell English italic 22 px): `ILLUSTRATIVE`, `THEORY · NOT PROVEN`, place/date stamps such as `Shiinamachi, Toshima · 26 January 1948`.
- **Chapter title cards** (4.0 s each, 4.6 s for the main title): the title carved out of a black panel (IM Fell English SC), mirrored while the block is inked, then the paper is pulled and it reads true (the style's "mirrored block → true print" move, used as the chapter grammar). Roman chapter number above, in small carved capitals.

## 6. Shot list

Plate = one printed composition. Framing W/F/M/C/I = wide/full/medium/close/insert. Durations follow the narration (measured after recording); here in approximate seconds.

### Act I — The Afternoon

| # | Plate | Framing / angle | Move | ≈ s | Why |
|---|---|---|---|---|---|
| 0 | Title I · Cold Open | — | locked, peel | 4 | the chapter grammar |
| 1.1 | Wall clock, hands carve to 3:20; pendulum on ones | C, frontal | snap-zoom out to the side door | 8 | hook in the first seconds: time and a door |
| 1.2 | Bank façade, Shiinamachi, closed shutters, winter light | W, low | slow push | 12 | the place, ordinary |
| 1.3 | Sixteen small chairs/figures behind the counter, carved as one row of silhouettes | M, eye level | locked | 10 | "sixteen people" counted |
| 1.4 | Main title: THE TEIGIN INCIDENT · 帝銀事件 | — | carve + pull | 4.6 | the name, after the hook |
| 2.1 | Tokyo 1948: burnt city, chimneys, a tram; rays of winter light | W | crane up | 20 | occupation-era Tokyo |
| 2.2 | GHQ: Dai-Ichi building silhouette, flag pole, a directive on a noticeboard (ILLUSTRATIVE) | M | track across | 18 | authority |
| 2.3 | Health team spraying disinfectant along an alley; armband white | F | on twos, track | 20 | the familiar figure |
| 2.4 | A doorway, an armband held up — the trust | C | slow push | 14 | "the key to everything" |
| 3.1 | Side entrance, knuckles knock (3 woodblock hits) | I | locked, shake on hits | 8 | the knock |
| 3.2 | The visitor in doorway, armband, card held out | F, low | slow push | 14 | figure, faceless |
| 3.3 | The business card, ILLUSTRATIVE | I | macro push | 10 | the card |
| 3.4 | Animated map of Tokyo: Yamanote loop, Ikebukuro, Shiinamachi branch marked; the word "dysentery" in the margin | W map | track with knife along line to marker | 12 | where |
| 4.1 | Sixteen cups set on a tray in rows | C overhead | slow macro push | 14 | the cups |
| 4.2 | A dropper above one cup; the liquid is the oxblood plate | I | locked | 14 | precision |
| 4.3 | The cups filled: oxblood glows in all sixteen | C overhead | pull back | 14 | the peak of colour |
| 4.4 | The cups empty and overturned on the tray; a chair tipped; no people | W | locked, held near-silence | 16 | respect: the empty room |
| 4.5 | Sixteen stab marks; ten, then two, struck; four left white | I | hard cuts as new impressions | 12 | counted marks |
| 5.1 | The front door open, footprints in snow toward it, onlookers' silhouettes at the threshold | F | slow push | 16 | the disturbed scene |
| 5.2 | Police lamps and a lab flask (CYANIDE in margin) | C | rack via peel | 14 | the lab |
| 5.3 | Front page, ILLUSTRATIVE, headline carved: 帝銀事件 | I | snap zoom + hold | 12 | the name enters the press |
| 5.4 | The empty doorway: WHO WAS THE DOCTOR? | M | locked | 8 | the question |
| 6.1 | Banknotes stacked, ¥164,000 in margin | I | slow push | 10 | the money |
| 6.2 | The cheque, ILLUSTRATIVE, ¥17,000 approx.; stamped "cashed next day" | I | track with knife | 12 | the cheque |
| 6.3 | The vault door, closed; far more money left | M | crane up | 12 | what he didn't take |

### Act II — The Hunt

| # | Plate | Framing | Move | ≈ s | Why |
|---|---|---|---|---|---|
| 7.1 | Four white silhouettes (the survivors) seen from behind, facing an empty frame | M | locked | 18 | four witnesses, anonymous |
| 7.2 | The composite: a face built from carved strokes, slowly, by stages (generic, invented features) | C | carve reveal | 18 | the composite |
| 7.3 | Posters of the composite pasted along a station wall, repeated | W | track | 12 | "across the country" |
| 7.4 | Photographs dealt like cards, faces blank | I | hard cuts | 10 | "photograph after photograph" |
| 8.1 | Timeline carved left→right: Oct 1947 Yasuda Bank · 19 Jan 1948 Mitsubishi Bank · 26 Jan 1948 Teigin | W | track with knife | 22 | three visits |
| 8.2 | Card: Dr. Shigeru Matsui (ILLUSTRATIVE) | I | macro push | 12 | the real name on the card |
| 8.3 | Matsui's card ledger, rows of names (invented, illegible) | C | pan down | 12 | the list |
| 9.1 | Ledger rows crossed off one by one (knife strikes) | C | locked, hard cuts | 20 | patient work |
| 9.2 | Steam train crossing a carved landscape | W | track | 20 | slow crowded trains |
| 9.3 | Map of Japan: route Tokyo → north → Hokkaido, Otaru | W map | track with knife | 20 | the trail north |
| 10.1 | Otaru harbour: masts, warehouses | W | slow pull | 18 | the port city |
| 10.2 | A tempera still life: flowers in a vase, painted-then-carved | C | macro push | 18 | the painter |
| 10.3 | Syringe/vaccine vial, 1925 in margin | I | locked | 14 | the rabies vaccination |
| 10.4 | Ferry on the sea, two cards passing between hands | M | track | 16 | the exchange |
| 10.5 | Empty wallet, open | I | snap zoom | 8 | "his wallet had been stolen" |
| 11.1 | Portrait of Hirasawa (re-cut photo if licensed, else carved silhouette) + name card | C | slow push | 16 | the suspect |
| 11.2 | Scales: card / money / record vs. no identification / no poison | M | locked | 20 | the case on paper |

### Act III — The Confession and the Court

| # | Plate | Framing | Move | ≈ s | Why |
|---|---|---|---|---|---|
| 12.1 | Constitution page (1947) vs. Code of Criminal Procedure (1949): two documents, dates | M | rack via peel | 22 | two systems |
| 12.2 | Police cell bars, a single bulb, a table and two chairs | W, frame in frame | slow push | 24 | the room |
| 13.1 | Calendar leaves tearing, days carved off | I | hard cuts | 14 | weeks |
| 13.2 | Brush/pen signature on a confession sheet, ILLUSTRATIVE; then a line struck through | I | track with knife | 14 | confess / recant |
| 13.3 | A head in profile, lines of hatching dissolving into confusion (stab flecks) | C | slow push | 14 | neurological condition |
| 14.1 | Tokyo District Court: columns, benches, a raised bench | W | crane down | 20 | the court |
| 14.2 | An empty vial on a table, a question mark carved in its shadow | C | snap zoom hold | 20 | the gap: the poison |
| 15.1 | The dropper and two doses, diagrammed as carved arrows (two-stage) | I | locked | 18 | the skill |
| 15.2 | Map: Noborito (Kawasaki) and Harbin across the sea; labelled THEORY | W map | track knife | 22 | the line of inquiry |
| 15.3 | A file folder closed and tied; margin THEORY · NOT PROVEN | M | slow push | 22 | dropped |
| 16.1 | Harbin, Manchuria map, compound block silhouette (no prisoners shown) | W | pull back | 20 | Unit 731 base |
| 16.2 | Two pairs of hands exchange a sealed box of papers across a table (immunity), THEORY label in margin applies to the Teigin link only | M | locked | 22 | the arrangement |
| 16.3 | Detective's notebook, ILLUSTRATIVE, pages turning | I | macro push | 20 | the notes |

### Act IV — Thirty-Nine Years

| # | Plate | Framing | Move | ≈ s | Why |
|---|---|---|---|---|---|
| 17.1 | Gavel-less court: DEATH SENTENCE 1950 / UPHELD 1955 carved | M | hard cut impressions | 12 | verdict |
| 17.2 | Execution order, ILLUSTRATIVE: signature line blank, empty oxblood seal ring | I | slow push | 18 | the unsigned order |
| 18.1 | Stack of orders, one per minister, years printed over one another (1955 … 1987), each seal ring empty | C | crane up as stack rises | 24 | minister after minister |
| 18.2 | The cell door, peephole; a strip of light under it | F, frame in frame | locked, held | 18 | limbo |
| 19.1 | Petitions and books stacked; names in margin: Tetsurō Morikawa, Seichō Matsumoto, Kei Kumai (1964), William Triplett (1985) | M | track | 26 | campaigns |
| 19.2 | Paintings hung in a gallery, viewers' silhouettes | W | pull back | 18 | his work outside |
| 20.1 | The cell, a brush laid down, a small painting on the wall | C | slow push, near-silence | 16 | 10 May 1987, aged 95 |
| 21.1 | Bank front again, empty; an armband on a hook (no figure) | W | locked | 20 | armband, story, trust |
| 21.2 | Retrial / exoneration: four doors opening onto light (no names) | W | crane up | 20 | justice itself |
| 21.3 | Twelve marks, printed in oxblood one by one, then a line: "twelve people" | C | locked, hard cuts | 20 | the twelve |
| 22.1 | The side door, as in 1.1, with its corner left uncarved | W | slow pull back | 24 | the bookend |
| E | End credits card (sources), then "In memory of the twelve people who died on 26 January 1948" | — | locked | 22 | close |

## 7. Beat sheet (top level)

| t (approx.) | Beat |
|---|---|
| 0:00 | Title card I. Clock at 3:18, knife carves the minute hand to 3:20. |
| 0:04 | Narration begins: "Tokyo, January 26, 1948." |
| 0:40 | Main title THE TEIGIN INCIDENT carved and pulled (4.6 s). |
| ~2:00 | The visitor at the side door. |
| ~3:20 | The cups. Near-silence under "They did as he said." Single tam-tam on "Ten people died at the bank." |
| ~5:30 | Act II: the sketch, the earlier attempts, the card trail. |
| ~9:30 | Hirasawa. |
| ~10:40 | Act III: interrogation, confession, court, the theory. |
| ~15:00 | Act IV: the verdict, the unsigned orders. |
| ~17:40 | Thirty-Nine Years. Second near-silence before "On May 10, 1987". |
| ~18:10 | Legacy: twelve oxblood marks. |
| ~19:00 | The door, uncarved corner; end credits; dedication. |

Exact times come from `timeline.json`, generated from the measured narration.

## 8. Cue map

Score mostly unmetered (drones), with a grid where the story counts or travels.

| Section | Tempo / grid | Instruments | Hits |
|---|---|---|---|
| Title cards | free | knife-into-wood foley, one log-drum stroke on the pull | peel on card end |
| I. Afternoon (1–3) | 60 bpm, woodblock as a clock tick (soft) | contrabass + cello drone on D, woodblock tick, frame drum on knocks | 3 knocks on 3.1 |
| Cups (4) | ticks stop; drone thins to bowed drone only | bowed drone, then near-silence | **tam-tam** on "Ten people died at the bank." |
| Alarm / money (5–6) | 72 bpm pizzicato ostinato, low | pizz. contrabass, log drum | snap zoom on headline = gran cassa |
| II. Hunt (7–11) | 84 bpm, 4/4: pizzicato cellos, log drum walking pattern; train rhythm in 9 | pizz. strings, log drum, woodblock, frame drum | each name crossed = woodblock |
| III. Court (12–16) | slower 56 bpm, held cello lines; drone shifts mode (D → E♭) for the theory | cello, contrabass arco, synth struck metal (modal) for THEORY plates | struck metal on each THEORY label |
| IV. Years (17–20) | free; low pedal; each year impression = soft gran cassa + paper | contrabass drone, frame drum, struck metal | near-silence before "On May 10, 1987" |
| Legacy / end (21–22, credits) | 48 bpm, cello line returns to D | cello, contrabass, bowed drone, frame drum | twelve soft log-drum strokes for the twelve marks |

Music sits ~8 dB under voice (sidechain duck), foley ducks too.

## 9. Sound design table

| Section | Ambience | Foley | Music |
|---|---|---|---|
| Title cards | paper room tone | knife into wood, chips, brayer, baren rasp, peel | silent or last chord tail |
| Act I | winter wind, faint distant tram | clock tick, knocks, door, cups (small ceramic modal clinks), dropper (single drip) | drone + tick |
| Cups / empty room | near-silence | one drip, one ceramic rattle | tam-tam once |
| Act II | station hubbub (filtered noise), steam train chuff | paper shuffles, cards, stamp, knife strikes for crossed names, train | pizz. ostinato |
| Act III | room tone with a hum (bulb) | chair scrape, pen scratch, gavel-free court: paper | cello / struck metal |
| Act IV | quiet room tone, distant footsteps | cell door clank (large metal, low), brush on paper, stack of paper | drone |
| Legacy / end | wind | twelve woodblock-soft strokes, final peel | cello resolves |

## 10. Transitions

- Within a chapter: hard cut = a new impression (two frames of misregistration), on a music beat where there is a grid.
- Into every chapter title card: the paper peel (brayer → paper → baren → peel), carrying the last chapter's ambience over (L-cut) and bringing the next chapter's ambience in early (J-cut).
- Never a dissolve.

## 11. Native moves used

- **Mirrored block → true print**: every chapter title, and the final "In memory of" line.
- **The one colour plate spreads and withdraws**: the liquid in sixteen cups → gone → twelve marks at the end.
- **Stab cuts as texture**: counted marks; snow; confusion in 13.3.
- **Filter a sculpt or a frame**: close-ups (cups, card, vial, hands) sculpted as height fields and run through `woodcutFilter`; the Hirasawa portrait if a licensed photo exists.
- **Signature shot**: plate 4.3 → 4.4: the oxblood cups pull back to the empty tray in near-silence.
