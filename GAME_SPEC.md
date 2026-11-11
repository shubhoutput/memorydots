# memorydots: Game Canon (v1)

Nov 11, 2026 · @Shubh

This is the single source of truth for what memorydots is and how it behaves. It was built from the framework, brain dump, two grilling rounds, clarifications and the accepted improvements of 2026-11-09 to 2026-11-11. The code in the repo today is a deployment test scaffold, not the spec: where code and this canon differ, this canon wins.

**Status:** draft for the owner's validation. After validation, paste it whole into Copilot or any other LLM as context.

**Notation**

- **\[D\]** decided by the owner.
- **\[O\]** open: settle while building, and record the answer in the decision log.
- Requirement words (MUST, SHOULD, MAY) are used loosely as in RFC 2119: MUST is a rule of the game, SHOULD is a strong default, MAY is optional.

## 1. Purpose and audience

**One-sentence pitch \[D\].** memorydots is a two-player, turn-based memory game on a shared 5×5 grid of 25 dots, where players take turns replaying a growing sequence from memory and adding one new dot, and the first to forget loses.

**Why it exists \[D\].**

- A memory and focus training game, aimed at building focus in younger players and keeping ageing players mentally active. It grew out of a park-bench game in which two people take turns naming objects from a growing list.
- Players should feel "I almost knew it" after a loss and want to play again.
- For the builder: a free-to-host, production-ready portfolio project with clean abstractions and good documentation, built as a functional MVP for a limited set of users, with zero budget and a timeline of a few weeks.

**Claims policy \[added by this canon, to confirm\].** The game MUST NOT claim to prevent or treat dementia or any condition. See Appendix A for the evidence. Copy should say "memory and focus game".

**Audience \[D\].**

- Seniors and academic people who want to sharpen memory, in casual-competitive play (friends, strangers, no rankings).
- Not for children who cannot grasp the rules.
- Played on the web, mobile-first with a good desktop experience, in short sessions.

## 2. Glossary

- **Dot:** one of the 25 tappable positions on the 5×5 grid.
- **Sequence array:** the ordered list of dots added so far in a match. It grows by exactly one per turn and is the single source of truth for a match.
- **Turn:** one player's go. It has a **replay phase** (tap the whole sequence from memory) followed by an **add phase** (pick one new dot).
- **Playground:** the rounded-corner square that holds the 25 dots.
- **Creator / joiner:** the player who owns a hall / the player who joins it. The creator is always shown on the left, the joiner on the right.
- **Hall:** the container created when a player generates a Remote link or starts a Random search.
- **Room:** the pairing of exactly two players inside a hall. Room ID is creator ID plus joiner ID.
- **Round:** one match from start to a decided result. A room can hold many rounds (rematches).
- **Level:** a stage inside a round. The MVP has only level 1 (5×5).
- **Stall:** a player taking too long to tap in their turn.
- **Shared ending:** all 25 dots replayed correctly, so both players win. Named **"Perfect Recall – both players win"**.

## 3. Core rules

**Players and board \[D\].** Exactly 2 players, always: no spectators, no third player. One may be a bot. The board is a 5×5 grid of 25 dots. The grid size MUST be a parameter in code even though the MVP ships only 5×5.

**The sequence array \[D\].**

1. It starts empty and grows by exactly one dot per turn.
2. A dot MUST NOT appear twice: the new dot is always chosen from dots not already in the array.
3. The maximum length is 25. Player 1 adds dot 1, 3, 5 and so on, so Player 1 adds the 25th. Player 2 then only replays all 25.
4. For remote and random play, the server holds the array. Local and bot play hold it on the client, using the same shared rules code.

**A turn \[D\].**

1. **Replay phase.** The active player taps the array from the first dot, in order, from memory. Each correct tap shows a tick on that dot, which then dims and is not tappable again for the rest of the turn. Turn 1 has an empty array, so it has no replay phase.
2. **Add phase.** Once the number of correct taps equals the array length, every remaining untapped dot shows a plus sign, meaning "pick any of these". The game does not announce this in any other way, apart from a short guide message (see section 8).
3. The player taps one dot. It flashes green and keeps a plus mark, and the plus signs on all other dots disappear. The green flash persists for about 3 seconds.
4. The turn transfers. The board starts fresh for the next player: all ticks are cleared and every dot is tappable.

There is no separate replay animation at the switch. The waiting player has watched the active player's taps live, and replaying the sequence would hand over the answer.

**Wrong tap \[D\].** Any wrong tap ends the round immediately, in the MVP (3 hearts is a later idea). Tapping a non-array dot during the replay phase counts as wrong, so players must remember the length of the sequence. The wrong dot shows a red cross and the correct dot shows green for about 2 seconds. Then the result is declared for about 2 seconds, and the rematch request becomes available.

**Result \[D\].** The first player to make a mistake or stall out loses and the other wins. The winner gets a crown and the loser a red ring on their avatar. If all 25 dots are replayed correctly, the ending is **"Perfect Recall – both players win"**.

**Opponent visibility \[D\].** Each tap by the active player MUST appear on the waiting player's screen in real time: green while pressed, then tick and dim.

## 4. Timing and feedback constants

All values below are configuration constants, not hard-coded numbers, so they can be tuned after playtests. Times are approximate where marked.

| Constant | Value | Applies to | Status |
| --- | --- | --- | --- |
| Idle limit before countdown | 10 s with no tap in your own turn | All modes | \[D\] |
| Visible countdown | 10 s, shown on the avatar, ends the round and the opponent wins | All modes | \[D\] |
| Total stall limit | 20 s (10 s idle + 10 s countdown) | All modes | \[D\] |
| Timer reset | Any tap resets the idle limit | All modes | \[D\] |
| Green flash on new dot | about 3 s before the turn switches | All modes | \[D\] |
| Wrong-tap reveal | about 2 s with the correct dot shown green | All modes | \[D\] |
| Result display | about 2 s, then rematch becomes available | All modes | \[D\] |
| Bot tap delay | 1 s plus a random 0–2 s (range 1–3 s) | Bot | \[D\] |
| Random search | up to 30 s, then offer bot or search again for another 30 s | Random | \[D\] |
| Unjoined Remote link | expires after 30 s | Remote | \[D\] |
| Hall cap | 10 halls | Remote, Random | \[D\], scope \[O\] |
| Disconnect grace period | none: a disconnect is treated as a stall | Remote, Random | \[D\] |

## 5. The four modes \[D\]

All four modes ship in the MVP. They share one mode-agnostic abstraction and one rules implementation. A mode differs only in where the other player's input comes from. Build order: Local, then Remote, then Random, then Bot.

**Local.** Two people share one device. The creator ("You", logo Y) is on the left and goes first; the other player is labelled "Local" (logo L) on the right. No link is needed: the game starts with the dots ready. It runs fully on the client, outside the hall cap, and the waiting player watches the live taps, like sitting beside a chess board.

**Remote.** The creator generates a link and sends it to a friend. The first person to open it joins; a third person sees "room is full". The creator goes first. The opponent is labelled "Remote" (logo R). The server is authoritative.

**Random.** A matchmaking mode in the spirit of chess.com. Starting a search creates a hall, or joins the longest-waiting hall if one exists. The owner of the waiting hall is the creator and goes first; the joiner enters a room in that hall. The opponent is labelled "Random" with logo R, and the name written under the avatar tells Remote and Random apart. Random and Remote use separate pools and can never match each other. After 30 seconds with no match, the player is offered a bot or another 30-second search. The server is authoritative.

**Bot.** One human against a bot that never forgets, so the human can at best reach the shared ending and can lose. The bot picks each new dot at random from the remaining dots and taps with a delay of 1 s plus a random 0–2 s. The bot is labelled "Bot" (logo B). It runs on the client, outside the hall cap. A smarter dot-choice heuristic is a post-MVP idea.

## 6. Halls, rooms, rounds and levels \[D\]

**Hierarchy.** A hall holds one room. A room holds many rounds. A round holds many levels (the MVP has one). Local and Bot modes do not create server halls.

**Remote lifecycle.**

1. The creator generates a link. This creates a hall whose ID derives from the creator's anonymous browser ID. The creator waits on a waiting screen that shows the link.
2. The link expires after 30 seconds if nobody joins, and also if the creator leaves before anyone joins.
3. The joiner opens the link, gets their own ID, and a room is formed with ID = creator ID plus joiner ID.
4. Round 1 starts. A third visitor sees "room is full".
5. Rematches happen in the same room as new rounds.

**Random lifecycle.** A hall is created when a search starts. If a waiting hall already exists, the searcher joins the longest-waiting one and a room forms inside it. Otherwise a new hall is created and waits up to 30 seconds. A device MUST NOT match with its own hall.

**First turn \[D\].** The creator always starts the first round. In Random, the creator is the owner of the waiting hall, so whoever waited longest plays first. After a rematch, **the starter alternates** each round.

**Rematch \[D\].** After a round ends, either player can send a rematch request. The other player sees a chess.com-style pop-up where the mode selection normally appears. The requester sees a pop-up with an animation reading "waiting for approval". If accepted, a new round starts in the same room. If declined, the game ends and both players return to the landing page.

**Session scoreboard \[D\].** The room keeps a running score across rounds (for example 2–1), held in server memory only, and cleared when the hall closes.

**Leaving \[D\].** The Leave button opens a blurred confirmation dialog. Leaving on purpose counts as a loss, so the other player wins. In Remote and Random, the hall stays open until the remaining player also leaves, so they can see a win message instead of the game silently closing. After both have left, the hall closes, and players must create a new link or search again. In Local and Bot, leaving returns to the landing page.

**Cap \[D\].** At most 10 server halls at once, to protect the free-tier host. Whether the 10 applies to Remote and Random together or to each separately is \[O\].

## 7. Stalls, disconnects and latency

**Stall \[D\].** If the active player makes no tap for 10 seconds, a visible 10-second countdown starts on their avatar. Any tap resets it. If it reaches zero, the round ends and the opponent wins. Total allowance: 20 seconds. This applies in all modes, and the clock MUST be kept by the server in Remote and Random.

**Disconnect \[D\].** A disconnect, whether from a network problem or a closed tab, is treated exactly like a stall. The disconnected player's avatar shows a low-network icon. If they rejoin and tap, the timer resets. There is no separate grace period.

**Rejoin \[D\].** Without accounts, a returning player is recognised by the anonymous browser ID stored on their device. If the ID is lost (storage cleared, another device), rejoining is simply not possible, and the owner accepts that.

**Latency \[O\].** A real concern. The owner's direction: a player whose lag is too large should not be allowed to move, as on chess.com, and the low-network icon plus the stall timer are the first tools. Two cases need design: one player on a poor network, and both players on poor networks. Candidate techniques, all undecided: instant local feedback for a player's own taps, a short buffer to replay the opponent's taps at their original rhythm, and a stall clock that allows for measured round-trip time. Develop this while building, using a real two-device test.

## 8. UX, design and accessibility \[D\]

The design file is in Figma and is still incomplete. This section records the behaviour that is decided.

**Layout.** The creator is always on the left and the joiner on the right. Your own avatar is "You" with logo Y. The opponent's avatar is labelled Local (L), Remote (R), Random (R, with the name written under it) or Bot (B). The avatars section sits below the playground, with the Learn Rules button below it.

**Whose turn.**

- The active player's avatar has a blue ring, and their playground has a blue border.
- The waiting player's playground has a blue overlay on the dots. The overlay sits on the dots, not on the avatar.
- The countdown and the low-network icon appear on the avatar.
- A short guide message sits below the playground and above the avatars, saying what to do next (for example "Your turn" or "Pick any dot"). It SHOULD also be exposed as a screen-reader live announcement.

**Dot states.** Dim means not tappable. Full white means tappable. Green is a dot being pressed. Tick means a correct replay tap. Plus is the add-phase cue and the mark on a newly added dot. Cross is a wrong tap.

**Colours.** Blue is the brand colour: the "memorydots" title, the avatar ring, the active border, the waiting overlay and clickable text such as Leave and Restart. Green means pressed or correct. Red means the wrongly tapped dot and the loser's ring. Black is the default dark-mode background. White and its shades are the dots. Dark mode is the default; a light-mode toggle is later. Colour is never the only cue: ticks, crosses, plus signs and the crown carry meaning too.

**Result display.** A crown on the winner's avatar and a red ring on the loser's, plus a result message, then the rematch pop-up flow.

**Screens.** A single-page app with seamless components, not separate page loads: Landing (mode selection), Learn Rules, Waiting (Remote link or Random search), Game, Result overlay, Leave dialog, and the messages Room full, Expired link and Offline. The Learn Rules page is separate, written with images, in English.

**Language \[D\].** English only. The rules page may get more languages later.

**Accessibility \[D\].** Large tap targets and text, strong contrast, colour-blind-safe cues, short screen-reader announcements for turn changes and the add phase, and reduced-motion support.

## 9. Architecture and stack

**Stack \[D\].**

- **Client:** Next.js, deployed on Vercel, styled with Tailwind. React Native is a possible later step.
- **Real-time server:** Colyseus, deployed on Render, kept behind a thin transport interface so the real-time provider can be swapped. Socket.io and Firebase were considered. Firebase Cloud Functions need the pay-as-you-go Blaze plan, which conflicts with a zero-cost goal.
- **Persistence:** none in the MVP. Halls, rooms and scoreboards live in server memory. A database comes later, with auth and telemetry.
- **Tools:** the repo on GitHub is the source of truth. Development uses VS Code with Copilot Agent and other LLMs. Design lives in Figma.

**Transport interface \[D\].** At minimum: create hall, join hall, send tap, on event, reconnect. The rest of the app MUST depend only on this interface, never on Colyseus types directly.

**Shared rules engine \[D\].** One implementation of the rules, written as pure functions or a state machine with no network or UI code. It is used by the client for Local and Bot, and by the server for Remote and Random.

- Inputs: a tap or an add-dot event and the current state.
- Outputs: the new state, or a loss with its reason.
- It owns the sequence array, the phase (replay or add), the tap position, the turn, and the result.

**Authority \[D\].** In Remote and Random the server decides everything: it holds the array, validates taps, keeps the stall clock and declares the result. Clients send intents and render the state they receive.

**Hosting limits (verified 2026-11-10).**

- A free Render web service spins down after 15 minutes without inbound traffic (WebSocket messages count), takes about a minute to spin back up, and may be restarted at any time. So all server state is disposable, and a restart can end a live match. The owner accepts this for the MVP.
- The landing page SHOULD ping the server on load to wake it early, and show "Waking the server, about a minute" if it is still starting.

**Known scaffold issue.** Two players ended up in one Colyseus room from a single browser tab because the connect effect ran twice. This is most likely React Strict Mode running effects twice in development. The client MUST clean up its connection in the effect cleanup, and treat the connection as a single owned resource. The web package currently lists both `@colyseus/sdk` and the older `colyseus.js`; only one should remain.

**Out of scope for the MVP \[D\].** Accounts, high scores, chat, spectators, leaderboards, telemetry, and any persistent database.

## 10. Identity, abuse protection and limits \[D\]

**Anonymous player ID.** On first visit the browser generates a random ID and stores it locally. The server uses it as the player's identity. It replaces any idea of identifying people by IP or Wi-Fi, so two people on the same network are two players. It also prevents a device matching with its own hall, and serves as the rejoin token. Weakness: clearing storage or using incognito creates a new ID.

**Protection against abuse.**

- Limit hall creation per IP as a rate limit, not as identity.
- Keep the 30-second expiry on unmatched halls, and give waiting halls their own small cap so they cannot crowd out real games.
- Keep the overall cap of 10 halls, which protects scalability on the free tier.
- Add a free CAPTCHA-style check before creating a hall (Cloudflare Turnstile is one option, as far as the author knows).
- Residual risk accepted: a determined person with several browsers can still hold slots. This is acceptable for a demo.

**Cheating \[D\].** Noting the sequence down on paper cannot be prevented. It is accepted for the MVP. The Learn Rules page carries an honour-system line. Revisit if rankings or accounts are introduced.

**Telemetry \[D\].** None in the MVP. If gameplay is later logged (for example to train the bot), it MUST come after authentication and with consent, since the audience includes seniors.

## 11. MVP scope and build order

**In the MVP \[D\].**

- Web app, mobile-first and good on desktop, no sign-in.
- Level 1 only, a 5×5 grid, with the grid size kept flexible in code.
- All four modes: Local, Remote, Random, Bot.
- Stall timers, rematch, session scoreboard, the Learn Rules page, dark mode, and the accessibility basics listed in section 8.
- Server pre-warm and wake-up message.

**Later ideas \[D, not scheduled\].**

- More levels with a new playground, possibly other dot shapes such as a star.
- Three hearts instead of instant loss.
- A sound for each dot.
- A bot with a smarter dot-choice heuristic: avoid dots adjacent to the last dot or aligned with the last two, prefer jumps, and keep some randomness. It is a hypothesis to test with real players.
- A light-mode toggle.
- A personal-best display and a warm-up grid were considered and declined for now.
- Accounts, a persistent database and telemetry.
- A VR idea, and React Native.

**Build order \[D\].** Local, then Remote, then Random, then Bot, all on one mode-agnostic abstraction. First, get a minimal working abstraction running end to end and shape it later.

## 12. Working agreements for the repo and Copilot \[D\]

- This canon lives in the repo as `GAME_SPEC.md`. A short `.github/copilot-instructions.md` points to it and repeats only the non-negotiables: the sequence array is the source of truth, the server is authoritative in Remote and Random, no repeated dots, the transport interface, and the claims policy.
- A dated `docs/decisions.md` log records every change to this canon, especially the resolution of \[O\] items.
- An LLM MUST NOT invent a rule. If a behaviour is marked \[O\] or is not covered here, it asks the owner and records the answer in the decision log.
- Work in thin vertical slices, one mode or one behaviour at a time, in the build order of section 11.
- The shared rules engine is tested first. Its unit tests act as the executable version of section 3. The scaffold already includes the Colyseus testing package for the server side.
- Each task states which section numbers of this canon it implements, and the change references them.
- The Next.js version in this repo is recent and may differ from an LLM's training data. The web package's `AGENTS.md` tells agents to read the docs bundled in `node_modules/next/dist/docs` before writing code, and that instruction should be followed.
- Keep the repo documented as it goes: README, an architecture note for the transport interface and rules engine, and a short runbook for the Vercel and Render deployments.

## 13. Open items

These are not blockers. Settle each while building, and record the answer in `docs/decisions.md`.

1. **Latency policy \[O\].** See section 7.
2. **Hall cap scope \[O\].** Is the cap of 10 total, or 10 each for Remote and Random? What does a player see when the cap is reached? Suggested: a "servers are busy, try again soon" message, which is not yet in the screen list.
3. **Link expiry length \[O\].** 30 seconds for an unjoined Remote link is tight when the link is sent through a messaging app. Tune it after the first real test.
4. **Random's logo \[O\].** The decision is that Random keeps R with its name written under the avatar, because M for "Match" is ambiguous. Confirm.
5. **Rematch in Local and Bot \[O\].** The pop-up flow is specified for Remote and Random. Assumed for Local and Bot: an immediate restart with alternating starter and no approval pop-up. Confirm.
6. **Shared ending presentation \[O\].** Do both players get a crown, and how does the session scoreboard count it?
7. **Exact message texts \[O\].** Result messages, the guide message wording and the "waiting for approval" text.
8. **Claims policy \[O\].** Confirm the rule in section 1 that the game never claims to prevent or treat dementia.
9. **Plus-cue refinement \[O\].** The owner wants to develop the add-phase cue further during building.

## 14. Decision log (improvements, 2026-11-11)

| # | Improvement | Decision | Where in this canon |
| --- | --- | --- | --- |
| 1 | Anonymous browser ID instead of IP | Accepted | Section 10 |
| 2 | Cap abuse protection (per-IP rate limit, overall cap, CAPTCHA-style check) | Accepted, both limits stay | Section 10 |
| 3 | Cheating (noting the sequence down) | Accepted for the MVP, with an honour-system line | Section 10 |
| 4 | Bot dot-choice heuristic | MVP stays purely random in bot mode | Sections 5, 11 |
| 5 | Slow-connection handling | Undecided, develop while building | Sections 7, 13 |
| 6 | Real-time stack | Keep Colyseus behind a thin transport interface | Section 9 |
| 7 | Name for the 25-dot ending | "Perfect Recall – both players win"; "M" for Random rejected | Sections 2, 5 |
| 8 | Rematch starter | Alternate each round | Section 6 |
| 9 | Screen-reader announcements | Accepted, plus a guide message below the playground | Section 8 |
| 10 | Server pre-warm | Accepted | Section 9 |
| 11 | Session scoreboard per room | Accepted | Section 6 |
| 12 | Personal best in the browser | Declined for the MVP, maybe later | Section 11 |
| 13 | Warm-up grid | Declined: people warm up in a real game | Section 11 |
| 14 | Repo alignment docs | Accepted | Section 12 |

## Appendix A: answers to the five open questions

### A1. How long will it take with free LLM assistants?

About 4 weeks, with a realistic range of 3 to 6. This is my estimate, not researched. It assumes 2–3 focused hours a day, which you haven't told me. Free-tier message limits on assistants can slow things down, and I can't predict them. Real-time reliability (stalls, disconnects, rejoin, cold starts) is the riskiest part, so it gets its own time.

| Phase | Scope | Rough effort |
| --- | --- | --- |
| 1 | Shared rules engine with unit tests, then Local mode UI | about 1 week |
| 2 | Transport interface, Remote halls and rooms, server stall clock, rejoin | about 1 week |
| 3 | Random matchmaking, Bot, rematch, session scoreboard | about 1 week |
| 4 | Accessibility, pre-warm, abuse protection, docs, real two-device latency tests | about 1 week |
| Buffer | Bugs, tuning, playtest feedback | 1–2 weeks |

If time slips, protect the rules engine and Local mode first, and cut Random last-in, first-out.

### A2. How do I keep Copilot aligned?

See section 12. In short: keep this canon in the repo as `GAME_SPEC.md`, keep `.github/copilot-instructions.md` short and pointing to it, work in thin slices that cite section numbers, test the rules engine first, and log every decision. Never let the assistant invent a rule.

### A3. Where are the likely knowledge gaps?

I don't know your current skills, so these are the places where projects like this usually trip, not a judgement of you:

- Authoritative game state and state machines.
- WebSocket lifecycle: reconnection, timers on the server, ordering of events.
- React effect cleanup and Strict Mode, which is the cause of your current double-connection bug.
- Testing real-time code, including two simulated clients.
- Free-tier hosting behaviour: cold starts and lost in-memory state.
- Accessibility for seniors and colour-blind players.
- Abuse basics: rate limits and bot checks.

### A4. Is this a good full-stack project idea?

Yes for a portfolio, with one warning.

- **Strengths:** it touches the full stack (client, real-time server, deployment, docs). It has real engineering problems worth showing: an authoritative server, timers, reconnection, a shared rules engine and abuse limits. The scope is clear and the rules are small.
- **Risks:** four modes plus matchmaking plus timers plus abuse protection in a few weeks is a lot. The game's novelty is modest, so the engineering quality and documentation are what will impress. You said your biggest uncertainty is how exciting the game is.
- **Recommendation:** playtest Local mode with three to five real people before building the real-time parts. It tests fun cheaply.

### A5. Is it a copy, and who are the competitors?

It is not a copy of any product I found, but the mechanic descends from Simon, and the limits of my search matter: it was a handful of web searches, so check the app stores before you commit to a name.

| Prior art | What it is | Multiplayer | Difference from memorydots |
| --- | --- | --- | --- |
| Simon (Milton Bradley/Hasbro, 1978) | Electronic game with four coloured pads; the machine adds a step each round and you repeat the sequence | Not by default | Two humans co-create the sequence on a 25-dot grid |
| Browser Simon clones, for example Memozor | Free web versions with a training mode, speed settings and high scores | Solo | No opponent |
| "Genius Game" on GitHub (React, TypeScript, Firebase) | Hobby project with 1vs1 and cooperative rooms where players take turns repeating the sequence and the first wrong loses | Yes, rooms | Closest mechanic found. Four coloured pads, Google login for solo mode, and its README doesn't say who adds each step |
| Pair-matching apps, for example Memory Match – Online Battle, Memento Omnis, Memory Geek | Concentration card games with online battles, bots, local two-player and room codes | Yes | A different mechanic (find pairs), but the same market: online memory duels, bot practice and pass-and-play |
|  |  |  |  |

The traditional park-bench game you started from is the older ancestor. Two further notes: avoid "Simon" in branding, since it is Hasbro's game (as far as I know), and keep the name memorydots distinct from the pair-matching apps.

### A6. What does the evidence say about memory games and dementia?

The game MUST NOT claim to prevent dementia. The best evidence is the ACTIVE trial: 2,802 adults aged 65 and over were randomised in 1998–99 to memory, reasoning or speed-of-processing training, or no training. In the 20-year follow-up using Medicare records, 40% of the speed-training group with booster sessions (105 of 264) were diagnosed with dementia, against 49% of the control group (239 of 491), a 25% lower incidence. That was the only statistically significant result, so memory training did not show the same effect. The authors say more studies are needed to understand why. Speed training in ACTIVE was adaptive and computer-based, and it differs from this game. The honest claim is "a memory and focus game".
