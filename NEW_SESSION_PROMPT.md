# Teigin Incident documentary: full prompt for a new session

Paste everything below the line into a new Claude Code session.

---

Make me a narrated documentary video, **15 to 20 minutes long**, about the Teigin Incident (the Imperial Bank poisoning in Tokyo, 26 January 1948). Work step by step and stop at the checkpoints marked **CHECKPOINT**.

## 0. Setup
- Clone the style library: `git clone https://github.com/lemomo-ai/lemo-opuscar.git` and follow its `AGENTS.md`, `DIRECTOR.md` and `TECHNIQUE.md`. Run `sh plugin/skills/lemo-opuscar/scripts/setup.sh deps` from the library root.
- Use the style **Woodcut Print** (`styles/woodcut/STYLE.md`) and keep all of its rules. Build in `films/teigin/` inside the library. Never edit `core/` or `styles/`.
- The brief is complete, so don't ask the library's round of questions. Write `TREATMENT.md` before opening the demo code, as the library requires.
- Chromium and Playwright are already installed in the cloud container. Hugging Face may be blocked; if the speech-to-text check can't download its model, skip that check and tell me.

## 1. Script (locked, do not rewrite)
Use the narration script below **word for word**. It has 22 chapters. Text in `[VERIFY: …]` brackets is a note for me: **never read it aloud or show it in subtitles**. Keep a list of every [VERIFY] note in `FACTS.md` so I can check them.

Locked facts (they must stay accurate everywhere, including on-screen text):
- 16 people drank the liquid; 10 died at the bank, 2 in hospital (12 dead), 4 survived.
- The killer wore a health-official armband and presented a business card, claiming GHQ had ordered dysentery prevention.
- He took about 164,000 yen in cash and a cheque for about 17,000 yen, which was cashed the next day.
- Earlier attempts: Yasuda Bank (October 1947) and Mitsubishi Bank (19 January 1948). The Dr. Shigeru Matsui card trail led to Sadamichi Hirasawa.
- Hirasawa was arrested in August 1948 in Otaru, confessed after weeks of interrogation, then recanted. He was sentenced to death in 1950, the sentence was upheld in 1955, and he was never executed. He died on 10 May 1987, aged 95, in a prison hospital.
- The Unit 731 / Noborito link is a theory, not proven. Always present it that way.

## 2. Narration (CHECKPOINT: tell me the runtime)
- Use **ElevenLabs**. The API key is in the environment variable `ELEVENLABS_API_KEY` (host `api.elevenlabs.io` is allowed). Never print the key or write it to any file.
- Choose a **US English male documentary voice** that is warm, grave and expressive (emotion, not flat). Use the best quality model (Multilingual v2 or v3), a slightly slow pace, and stability set for an expressive but consistent read. Before recording everything, make a 20-second sample with 2–3 voices and pick the best.
- Generate one file per chapter: `audio/chXX.mp3`. Spell numbers out in the text you send to TTS (subtitles keep the digits). Check pronunciation of Shiinamachi, Teigin, Hirasawa, Otaru, Noborito, Shirō Ishii, Seichō Matsumoto, Tetsurō Morikawa, Kei Kumai.
- The script is about 13,500 characters, so budget about 14,000–20,000 credits including re-takes. Tell me the credits used.
- If ElevenLabs fails, fall back to Kokoro (local, voice `am_michael`, model files from https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0) and tell me.
- Save per-sentence timings for subtitles and picture sync. Measure the total runtime and tell me. If it's outside 15–20 minutes, tell me before continuing.

## 3. Visuals (CHECKPOINT: show me one sample frame per chapter before the full render)
- Everything follows Woodcut Print: carved black plates on laid paper, form-following cuts, carve-reveal animation, letterpress captions in the paper margin, and the style's transitions (a hard cut as a fresh impression, or the paper peel). Its single colour plate is a deep oxblood, kept for the few things that matter most (the cups, the seal on the unsigned order, the twelve remembered).
- Real names of people may appear (name cards, captions). Real photos are allowed **only if they are public domain or properly licensed**: re-cut them with the style's `woodcutFilter` (for example, a portrait of Hirasawa from a public-domain photo), and log each file's source URL and licence in `credits.md`. If a licence is unclear, don't use the photo; carve an original plate instead.
- No footage or clips from other videos or documentaries. Keep the poisoning respectful: no graphic depiction of death or suffering (empty cups, an empty room, counted marks instead).
- Scenes to cover: occupied Tokyo in 1948, an animated map of Tokyo with the Shiinamachi branch, a stylised reconstruction of the bank interior and the afternoon, the business card, the cheque, the composite description, the three bank visits on a timeline, the card-recipient list and the trail north to Hokkaido, Hirasawa the painter, the interrogation room, the court, the Noborito / Unit 731 maps and the immunity arrangement (clearly labelled THEORY), the unsigned execution orders across the decades, the retrial campaigns, his death in 1987, the legacy, and the closing questions. Use invented layouts for any newspaper or document and label them illustrative.
- 1920x1080, **30 fps** (characters stepped on twos as the style asks).

## 4. Sound and assembly
- Original score in the style's sound palette (low strings, log drum and woodblock, frame drum, one tam-tam, a bowed drone), quiet under the voice (ducked about 8 dB), with the style's foley (knife into wood, paper, the peel). Log the music's licence (original work, or the sample library's licence) in `credits.md`.
- A chapter title card before each chapter (carved, at least 4 s), burned-in English subtitles in the paper margin plus a separate `.srt`, and an end credits card listing sources: Wikipedia “Teigin Incident”, “帝銀事件” and “Sadamichi Hirasawa”; William Triplett, *Flowering of the Bamboo* (1985); Sheldon H. Harris, *Factories of Death*; Japanese newspaper archives (January 1948, May 1987). End with “In memory of the twelve people who died on 26 January 1948”.
- Mix to about −14 LUFS. Run the library's review loop and checks (contact sheets, black-frame check, loudness).
- Deliver: `final/teigin_documentary.mp4`, `final/teigin_documentary.srt`, `final/youtube_chapters.txt` (timestamps from the real cut), `credits.md`, `FACTS.md`, `TREATMENT.md`, `poster.jpg`, and a one-command `build.sh`.

## The script

### Cold Open
Tokyo, January 26, 1948. Just after three in the afternoon, the Shiinamachi branch of the Imperial Bank has closed its doors for the day. Inside, sixteen people are finishing their work. Within half an hour, twelve of them will be dead, and the man responsible will walk out the front door with the bank's cash.

This is the Teigin Incident, one of the strangest and most disputed crimes in Japanese history.

### Japan in 1948
To understand how it happened, you have to picture Tokyo at the time. The war had ended less than three years earlier. The city was still scarred by bombing, food was scarce, and the country was under American occupation. Outbreaks of infectious disease were common, and health officials carrying orders from the occupation authorities were a familiar sight. People were used to following them without question.

General MacArthur's headquarters, known to everyone simply as GHQ, issued directives that reached into almost every corner of daily life. Public health was one of its priorities. Crowded housing, damaged water systems and poor nutrition made epidemics a constant fear, and teams of Japanese health workers moved from district to district, spraying disinfectant, giving inoculations and handing out instructions. A man with an official armband who said that GHQ required something was not a man you argued with.

That habit of trust, sensible in its time, is the key to everything that happened next.

### The Visitor
Around 3:20 pm, a middle-aged man knocked at the bank's side entrance. He wore an armband that marked him as a public health official and handed over a business card identifying him as a doctor.

He explained that there had been an outbreak of dysentery nearby. The American occupation authorities, he said, had ordered that everyone at the bank take a preventive medicine before anyone was allowed to leave. He was calm, polite, and confident. Nobody had reason to doubt him.

### The Medicine
The man gathered the staff, along with members of the caretaker's family, including children. Sixteen people in all. He set out cups and showed them exactly how to take the medicine: two doses, one after the other, about a minute apart. He even drank first to show them it was safe.

Survivors later recalled how practised he seemed. He measured the liquid into each cup with a dropper, and explained that the first dose was strong and should be swallowed in one go, pushed to the back of the tongue, so that it would not harm their teeth. [VERIFY: dropper and wording of instructions]

They did as he said. Within minutes, people began collapsing. Some managed to stagger outside for water or help before falling unconscious. The liquid was a cyanide compound.

Ten people died at the bank. Two more died later in hospital. Of the sixteen, only four survived, and their accounts became the core of the investigation.

### After the Alarm
When neighbours and passers-by first reached the building, they did not understand what they were seeing. Some early reports spoke of gas or food poisoning. People went inside to help, and by the time detectives arrived, the scene had been disturbed. [VERIFY]

Within hours, the Metropolitan Police had begun one of the largest investigations in their history. Laboratory tests confirmed cyanide. The next morning the story filled the front pages, and a name began to appear that would follow the case for decades: the Teigin Incident.

The question facing investigators was simple to state and almost impossible to answer. Who was the doctor?

### The Money Left Behind
While his victims lay dying, the man collected the cash within reach: about 164,000 yen and a cheque for around 17,000 yen. Then he left. The cheque was cashed at another bank the following day.

It was a large sum, but investigators were struck by what he did not take. Far more money was in the bank. Why go to such lengths, and kill twelve people, for only part of it? The question has never been fully answered.

### The Survivors and the Sketch
The four survivors had each seen the man at close range, in daylight, for several minutes. They described someone composed and authoritative, perhaps in his forties or fifties, who spoke politely and handled his bottles with ease. [VERIFY: survivors' physical description]

From their accounts, police produced a composite image of the suspect. It was printed in newspapers and posted across the country, and it became one of the most recognisable faces of post-war Japan. Thousands of tips poured in.

But memory under shock is fragile. The survivors had just watched colleagues and family members collapse around them, and their recollections did not always agree. Over the months that followed, as they were shown photograph after photograph, their certainty would be tested again and again.

### The Earlier Attempts
Police soon discovered that Teigin was not the first attempt. In October 1947, a man had tried the same story at a branch of the Yasuda Bank, and on January 19, 1948, just a week before, at a branch of the Mitsubishi Bank. In both cases the staff drank harmless liquid and nobody was hurt. [VERIFY: some accounts say Mitsubishi staff grew suspicious and drank nothing]

At those banks, the visitor had left business cards. One of them bore the name of a real doctor, Shigeru Matsui. Matsui had nothing to do with the crime, but he kept careful records of everyone he had exchanged cards with. Detectives began working through the list.

### The Card Trail
In Japan, business cards were exchanged constantly, and they carried real social weight. Matsui's record turned an impossible search into a finite one. If the killer had used a genuine Matsui card, he must have received it from Matsui himself. So detectives set out to find every person on the list and ask a single question: can you show us the card you were given?

Most could. Others had lost theirs but were cleared in other ways. The recipients were scattered across the country, and through the spring and summer of 1948 a small team of detectives travelled by slow, crowded trains, crossing names off one at a time. [VERIFY: number of names on the list]

They believed that patient police work, not theories about secret wartime programmes, would solve the case. Their search led them north, to Hokkaido.

### The Painter
Sadamichi Hirasawa was born in 1892 and grew up partly in the port city of Otaru. [VERIFY: birthplace] He became a painter, and a respected one, known especially for his work in tempera, a technique using pigment bound with egg. His quiet landscapes and flower studies were shown at major official exhibitions, and by the 1940s his name appeared regularly in catalogues and newspapers. [VERIFY: exhibitions and honours]

His private life was more troubled. In 1925 he received a course of rabies vaccinations, and his family later said his personality changed afterwards. [VERIFY: year] He had money problems, and a record of minor fraud.

In 1947, he had met Doctor Matsui on a ferry, and the two men exchanged cards. [VERIFY: date and place] When detectives asked to see that card, Hirasawa could not produce it. He said his wallet had been stolen.

### The Suspect
One name on that list was Sadamichi Hirasawa, a 56-year-old painter who was well known in the art world. In August 1948, police arrested him at his home in Otaru, Hokkaido.

The case against him looked strong on paper. He could not produce Matsui's card. He had come into a sum of money he could not explain. And he had a past record of fraud. But survivors could not firmly identify him, and no direct physical evidence connected him to the poison.

### Inside the Interrogation Room
What happened next has to be understood in the context of the time. Japan's new Constitution, in force since May 1947, said that forced confessions could not be used as evidence, and that no one could be convicted on a confession alone. But a new Code of Criminal Procedure did not take effect until January 1949, and Hirasawa's case was handled under the older system, in which a confession was treated as the strongest evidence of all. [VERIFY: which code governed the case]

Suspects could be held for long periods in police cells, questioned for hours at a stretch, with little access to a lawyer and no recording of what was said.

### The Confession
Hirasawa was interrogated for weeks. At first he denied everything. Then, after more than a month in custody, he confessed. Soon afterwards, he took it back, saying the confession had been forced out of him under intense pressure.

His supporters also pointed to his health. Years earlier, a rabies vaccination had reportedly left him with a neurological condition that could cause confusion and false memories. They argued that a man in that state, under relentless questioning, could be led to confess to almost anything.

### In Court
At his trial in the Tokyo District Court, Hirasawa denied the crime completely. His lawyers argued that the confession was coerced and unreliable, that the identification evidence was weak, and that the prosecution had never explained how a painter could have obtained a fast-acting poison, or learned to handle it with such confidence.

The prosecution relied on the confession, the missing card, the unexplained money and his past. The gap at the centre of the case, the poison, pointed in a direction the court did not follow.

### The Unit 731 Theory
Many people believed the police had the wrong man from the start, and there was a reason why.

The killer had handled the poison with skill. He measured doses precisely, used a two-stage method, and knew how to make the poison act with a short delay. Early in the investigation, detectives suspected someone with military training in poisons. They questioned former members of the Imperial Army's Noborito research institute and of Unit 731, the secret unit that had carried out biological-warfare research and lethal experiments on prisoners during the war.

That line of inquiry was then dropped. At the time, the United States had quietly granted Unit 731's leaders immunity from prosecution in exchange for their research data. Many researchers believe the occupation authorities did not want the investigation to expose those men. This has never been proven, but it remains the most persistent theory about the case.

### The Immunity Deal
Unit 731 was based near Harbin, in occupied north-east China, under the command of Shirō Ishii. Its prisoners, most of them Chinese, were used in experiments that are remembered among the gravest crimes of the war.

After the surrender, American officials questioned Ishii and his colleagues. The outcome was that the unit's leaders were never put on trial, and their research passed to the United States. [VERIFY: dates of the arrangement] For decades the arrangement stayed largely hidden. It came to public attention through journalists and historians in the 1970s and 1980s, long after Hirasawa had been convicted.

Notes kept by one of the Teigin detectives, published years later, show that former members of these units were interviewed in 1948, and that some described methods resembling the crime. [VERIFY: the detective's notes and their publication] No document has been found showing that GHQ ordered the inquiry stopped. The connection remains a theory.

### The Verdict
In 1950, Hirasawa was sentenced to death. Japan's Supreme Court upheld the sentence in 1955.

But the sentence was never carried out. In Japan, an execution needs the justice minister's signature, and minister after minister refused to sign. Hirasawa's lawyers filed request after request for a retrial. All of them were rejected.

### The Ministers Who Would Not Sign
Governments rose and fell, and with each new cabinet a new justice minister was handed the file. None of them signed. They rarely explained why in public, but the hesitation spoke for itself. The conviction rested on a retracted confession, and doubts about the poison and the identification had never gone away.

The result was a strange limbo. Hirasawa was neither freed nor executed. In an era when condemned prisoners were usually given little or no warning of their execution, he lived with that uncertainty not for months, but for decades. [VERIFY: notification practice]

### The Retrial Campaigns
Outside the prison, the case never went quiet. In the early 1960s, the writer Tetsurō Morikawa founded an association to win Hirasawa's release. [VERIFY: name and year] The crime novelist Seichō Matsumoto wrote about the case and the possibility of a cover-up, and in 1964 the director Kei Kumai made a feature film about it. [VERIFY: titles and dates] In English, William Triplett published a book-length investigation in 1985. [VERIFY]

Through it all, Hirasawa kept painting in his cell, and his supporters exhibited the work outside. To them, it was proof that the man was still present, still working, still waiting.

### Thirty-Nine Years
Sadamichi Hirasawa spent almost 39 years in prison, more than 32 of them on death row. He kept painting throughout. On May 10, 1987, he died of pneumonia in a prison hospital at the age of 95, still insisting he was innocent.

### Legacy
The Teigin Incident left a long shadow. It was one of the deadliest robberies in Japanese history, carried out not with weapons but with an armband, a story and the trust of ordinary people.

It also became a case about justice itself. In the 1980s, several Japanese death-row prisoners were exonerated at retrial after decades behind bars, their convictions found to rest on confessions that could not be trusted. [VERIFY: if specific cases are named on screen] Each of those cases revived the questions about Hirasawa, and the debate over long interrogations and the weight given to confessions continues in Japan today.

And at the centre of it all are the twelve people who died in Shiinamachi: clerks and a caretaker's family, at the end of an ordinary working day, who did what they were told by a man they had every reason to believe.

### The Questions Remain
His adopted son continued the fight to clear his name, and supporters have kept pressing for a retrial even after both men's deaths. Officially, the case is closed. But the questions remain. Who was the man at the bank door, where did he learn to handle poison like that, and why did the investigation turn away from the people best equipped to commit the crime?
