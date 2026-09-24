# zugbase — project brief for Claude Code

**zugbase** is the new, separate build of the owner's shidduch organizer: a private personal CRM
for guys, girls and shadchanim. It is the successor of **PeerMatch**, and also of the
**ZivugBase** experiment.

- It runs as a web app (PWA), mainly installed on the owner's Android phone, and keeps all data on
  the device.
- Everything is free: no cloud, no accounts.

## Where this repository stands

The owner chose a **clean start for the code in this repository**. That does **not** mean
starting over on requirements. Everything has already been decided, spread across the two
reference apps and the documents below. Nothing decided should be asked again.

### Reference apps — read them, never change them

| Repo | What it is | Use it for |
|---|---|---|
| `shiduchim/match` | **PeerMatch** v131, live at `shiduchim.github.io/match/`. The owner uses it every day. Plain JS: `sw.js` → `SCRIPTS` lists the 75 live scripts in load order. | **How it must look and behave.** The owner likes PeerMatch's layout, detail and density best. |
| `shiduchim/zivugbase` | **ZivugBase**, live at `shiduchim.github.io/zivugbase/`. A tested TypeScript engine; its UI was partly moved toward PeerMatch's look. | **Engine ideas and code worth reusing** (`docs/ENGINE_NOTES.md`) and the new features the owner chose. |

Attach both read-only if the session doesn't have them. **Never push to either repository, and
never change their live sites.**

### Read, in this order

1. `docs/HANDOFF_OPUS.md` — the Claude/Opus handoff:
   - what PeerMatch has
   - which ZivugBase features the owner chose, and which were rejected
   - the architecture that worked
   - 11 mistakes to avoid
   - PeerMatch's measured sizes
   - where it says "continue in zivugbase", read "build in zugbase, using zivugbase as a reference"
2. `docs/HANDOFF_CHATGPT.md` — the owner's ChatGPT handoff: product philosophy and how to work.
3. `docs/REBUILD_INVENTORY.md` — PeerMatch screen by screen, every field, flow and storage key.
4. `docs/REBUILD_PLAN.md` — the 23 new features the owner picked. Only these; ask before adding
   anything else.
5. `docs/ENGINE_NOTES.md` — engine pointers: what to build and how, with the ZivugBase files that
   already solve each part.

### When the sources disagree

- **Look and behavior:** PeerMatch wins.
- **Features added or removed on purpose:** `REBUILD_PLAN.md` wins.
- **How the code is built:** `ENGINE_NOTES.md` wins.

If something truly can't be decided from these, ask the owner about **that one thing**.

## First task

Before writing code, report to the owner, briefly and in plain words:

1. what the app must do
2. the main screens and flows
3. the architecture you'll use
4. what the reference apps already do well
5. what they don't do yet
6. conflicts you found
7. your build order

Also ask what "it doesn't work good" meant for the last ZivugBase build (`HANDOFF_OPUS.md` §9),
and ask for a phone screenshot of it.

## Non-negotiable

- **This repository is public.** Real names, phone numbers, emails and chats never go into code,
  tests, docs or commit messages. Use made-up data only: phone numbers containing `000`, emails at
  `example.com`.
  - Run `node scripts/privacy-check.mjs` before every commit, and add it to CI.
  - It can't catch names — check those yourself.
  - It reads things like `rgb(...)` with three numbers as a phone number, so use hex colors.
- **Data safety:**
  - Keep every field of imported PeerMatch data.
  - Never invent a date or history.
  - Undo instead of "Are you sure?".
  - Deleted people stay recoverable for 30 days.
- **Backups must keep working:**
  - a real ZIP with photos, PDFs and audio
  - the email fallback: a TXT holding the ZIP as Base64
  - PeerMatch backups, ZIP or TXT, must import completely
- **The owner's fixed rules:**
  - **Yes / No** buttons, never ✕
  - Call → Email → WhatsApp → SMS order
  - waiting yellow when on, gray when off
  - ב״ה above Edit; the girl's Photo button left of Edit
  - Israeli numbers shown local, sent to WhatsApp as international
  - basic (kosher) phones get only Call and SMS
- **One owner per behavior.** One share or send flow, one History, one search, one Intake folder.
  Change the owner; never patch over it. No global function overrides, no MutationObservers
  "fixing" another component, no capture-phase listeners. That is what made PeerMatch
  unmaintainable.

## How to work with the owner

- The owner uses this on an **Android phone behind a NetSpark filter**. Anything loaded from other
  sites may be blocked, so the core app must work offline.
- **Small steps.** Build one screen or flow, deploy it, ask the owner to check it on the phone,
  then continue.
- **Match PeerMatch by measuring, not guessing.** Screenshot the same screen in both apps at
  412 px wide and compare them (`tools/peermatch-shots.spec.ts`, and `HANDOFF_OPUS.md` §7). Do
  this before styling any screen.
- The owner is the only user and owns the repo.
  - For ordinary changes, finish, push, deploy, and tell the owner to fully close and reopen the
    app.
  - Ask before anything destructive or any data migration.
- Keep messages short and plain; the owner reads on a phone.
- Nothing is "device-verified" until the owner has tested it on the phone.
