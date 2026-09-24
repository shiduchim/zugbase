# Engine notes — pointers for building zugbase

Written by the Claude/Opus session that built the ZivugBase engine (`shiduchim/zivugbase`) and
studied PeerMatch's 75 scripts (`shiduchim/match`).

- **What each part must do** comes from PeerMatch (`REBUILD_INVENTORY.md`) and the owner's picks
  (`REBUILD_PLAN.md`).
- **These notes say how to build each part so it stays fast, safe and easy to change.** For each
  part, the ZivugBase file that already solves it is named.
- The owner asked for a clean start, and wants to see the new builder's own design and logic.
  These are **pointers and lessons, not orders**. Better approaches are welcome if they keep the
  data-safety rules. Copying or adapting ZivugBase code is allowed where it fits (same owner).
  Understand it first; don't paste it in blindly.

---

## 1. Stack (all free, all bundled, nothing loaded from other sites at runtime)

| Part | Use | Why |
|---|---|---|
| Language | TypeScript (strict) | Errors are caught when building, not on the phone. |
| UI | Preact + `@preact/signals` | Small and fast on a phone; one component per screen. |
| Build / hosting | Vite → GitHub Pages via GitHub Actions | Static; no server. |
| Database | **Dexie** (IndexedDB) | Real tables, indexes, migrations, and `liveQuery` so screens update themselves. |
| ZIP | `fflate` | Fast, small, works with raw bytes. |
| Search | `minisearch` | Tolerates spelling mistakes. |
| PDF text | `pdfjs-dist`, **bundled**, loaded only when needed | Works offline and under NetSpark. |
| OCR | Tesseract | ZivugBase loads it from jsDelivr. **Self-host it** (worker plus eng/heb/rus data) so NetSpark can't block it. |
| Tests | Vitest (unit) + Playwright (phone-size browser, 412×915, `isMobile`) | Required before every deploy. |

See `package.json`, `vite.config.ts`, `tsconfig*.json`, `playwright.config.ts` and
`.github/workflows/deploy.yml` in zivugbase.

**CI gate.** Deploy only if typecheck, unit tests, **privacy check**
(`scripts/privacy-check.mjs`, already in this repo) and e2e tests all pass. In zivugbase that gate
stopped two bad deploys in one day.

---

## 2. Data model — the most important decisions

See zivugbase `src/db/types.ts` and `src/db/db.ts`.

- **One `Person` record per human, with `roles[]`**: `single`, `shadchan`, `contact`, `me`, and
  others.
  - PeerMatch had separate guys, girls and shadchanim arrays. The same person, for example a
    shadchan who is also someone's contact, existed twice.
  - `gender` decides Guys vs Girls.
- **Tables, not one big row.** PeerMatch saves **the whole database, photos included, as one value
  on every change**. That gets slower as data grows and risks losing everything on a failed write.
  Keep separate tables:
  - `people`
  - `activities` (History)
  - `files` (the photo, PDF and audio blobs, plus a thumbnail)
  - `lists` (folders)
  - `inbox` (Intake folder)
  - `settings`
  - `drafts` (unsaved forms)
- **Indexes that matter:**
  - `people.*phoneKeys`: normalized numbers, for "already here?", matching a contact's phone to a
    shadchan, and finding who sent something
  - `people.*roles`
  - `activities.*linkKeys`
  - `activities.at`
- **History once, shown everywhere.** Each activity has `linkKeys: ['p:<personId>', …]`. A profile
  sent to a shadchan, a match, or a call to a contact person is **one entry** that shows in every
  linked person's History.
  - PeerMatch wrote two copies and then needed `shareLinkId` matching, a reconciliation loop and
    deletion tombstones to keep them in step. None of that is needed with one entry.
- **Ages are stored with their date**: `age: {value, asOf}`. They keep counting after that, and
  "35" saved today reads 36 next year. Never invent `asOf`; a PeerMatch import uses the record's
  creation date.
- **Soft delete.** `deletedAt` + an Undo toast + Recently deleted (purged after 30 days). Deleting
  for good also removes files no one else uses.
- **Keep the original.**
  - Imported PeerMatch records are kept whole in `legacy`, with a `legacyKey`
    (`peermatch:girls:<id>`) so the import can run again safely.
  - Pasted or shared text is kept exactly as it came, in the Intake folder.
- **Folders are labels.** `lists` rows with `kind: 'folder'`, `parentId` (another folder, or
  `root:guys`, `root:girls`, `root:shadchanim`, `root:ideas`, `root:others`), and `memberIds[]`.
  - A person can be in several folders.
  - Deleting a folder moves its sub-folders up and deletes no one.
  - See zivugbase `src/db/folders.ts`: `applyFolderChanges`, which works on many people and
    folders at once, returns an Undo, and has unit tests.

---

## 3. Patterns that avoided whole classes of bugs

- **Save through one helper that re-reads the stored record.** `patch(id, fn)` in zivugbase
  `src/ui/screens/Person.tsx` loads the current record, applies the change and saves it. A screen
  never saves an old copy over newer data, even when the owner taps quickly or edits in two
  places.
- **`useLive(query)`** (zivugbase `src/hooks.ts`) wraps Dexie `liveQuery`. Every screen
  re-renders when the data it read changes, with no manual refresh calls.
- **Record before handing off.** `src/ui/contact.ts` writes "Call / WhatsApp opened …" to History
  *before* opening the dialer or WhatsApp. It also:
  - uses `whatsapp://send?…` on Android, so leaving WhatsApp returns to the app
  - checks `canWhatsApp` (kosher phones → no WhatsApp) and `canSms` (landline → no SMS)
- **Back button closes sheets.** The router (`src/state.ts`) keeps a history depth.
  - Every sheet or viewer adds its own history entry (`pushLayer`), so the phone's Back button
    closes it and not the screen.
  - Call it in `useLayoutEffect`. With `useEffect` it ran after the screen was drawn, and Back
    closed both.
- **Shares never overwrite each other.** The service worker (`src/sw/sw.ts`) saves each incoming
  share into its own queue database (`zivugbase-incoming`), and the app drains it on start.
  PeerMatch kept one `'pending'` slot, and a second share replaced the first.
- **Precache build list.** `vite.config.ts` injects the list of built files into the service
  worker. The placeholder match must accept any quote style; a minifier once changed the quotes
  and the list silently wasn't injected. Fail the build if the placeholder is missing.
- **Service worker updates.** Network-first with an offline fallback. Precache files one at a
  time and best-effort: PeerMatch's `cache.addAll` failed as a whole under NetSpark and kept the
  old version stuck. Show the running version somewhere, as PeerMatch v131's badge does.
- **Drafts.** Forms autosave to `drafts` and offer "Your unsaved changes were brought back".
- **Duplicate check before saving** (same phone key, or same name when adding), with "Save as a
  separate person". Never merge automatically.

---

## 4. Parts with ready solutions in zivugbase

| Part | File | Notes |
|---|---|---|
| Phones | `src/lib/phone.ts` | `+972`, `00972` and `972` → local `0…`. Displayed `05X-XXX-XXXX`. Landlines 02/03/04/08/09 have no SMS; 07x counts as mobile. WhatsApp number is international. Other countries' numbers are kept as typed. `phoneKey` is used for matching. |
| Age from text | `src/lib/age.ts` | English, Hebrew and Russian patterns: "age 29", "29 years old", בן/בת 30, גיל, лет. |
| Guess from pasted text | `src/inbox/fileItem.ts` → `guessFromText` | Strips WhatsApp's `[date, time] Sender:` prefixes; guesses name from the first line, plus age, city, phones and sender. Fills **only empty** fields. |
| Search | `src/lib/search.ts` | MiniSearch plus "chips": a number becomes an age, known cities (EN/HE aliases) become a city filter. Hebrew niqqud and quote marks are normalized. |
| PDF / photo text | `src/lib/readText.ts` | PDF.js text first; OCR only when a PDF has almost no text. "Attach only" / "Attach + parse text": a failure never blocks attaching. |
| Translate | `src/ui/translate.ts` | Chrome's `Translator` (availability and download progress), then Google's web endpoint, as PeerMatch did. Shown in the app; never changes the profile. |
| Voice note | `Composer` in `src/ui/screens/Person.tsx`, `pickType` in `src/ui/parts/Recorder.tsx` | Inline MediaRecorder with a stop button; chooses a format the phone supports. |
| Folder picker | `src/ui/parts/FolderPicker.tsx` | Tri-state ticks for several people, Apply + Undo, Move to, New folder inside. |
| PeerMatch import | `src/import/peermatch.ts` (+ `tests/unit/peermatch-import.test.ts`, SYNTHETIC fixture) | Reads the PeerMatch ZIP **and** the `PEERMATCH-BACKUP-TEXT-V1` TXT wrapper. Keeps every field; merges share history pairs; runs again safely; then asks "which girls were suggested to me?". |
| Backup | `src/backup/backup.ts`, `pdfContainer.ts` | ZIP with a manifest and file sizes; checked before restoring (all or nothing, with Undo). See the decision below. |

**Backup decision to carry forward.** The owner's rule is a **ZIP**, plus a **TXT holding the
ZIP as Base64** for email, because Android Chrome won't share a ZIP. PeerMatch has done that since
v127.

- When writing Base64, encode in chunks whose size is a multiple of **3**; when reading it back,
  decode in chunks that are a multiple of **4**. Otherwise padding lands in the middle and large
  backups break. PeerMatch v127 fixed exactly this.
- ZivugBase also made a **PDF with the ZIP embedded** and a summary page, which the owner liked.
  Keep both the TXT and the PDF; restore must accept ZIP, TXT and PDF.
- **Restore any PeerMatch backup completely**, photos, PDFs and audio included.
- Test the whole round trip: make, share, restore.

---

## 5. UI lessons (the design itself is yours)

- **Check your screens against the references.** Serve `shiduchim/match` locally and screenshot
  PeerMatch with made-up data (`tools/peermatch-shots.spec.ts`). Screenshot the same screen in
  zugbase at 412 px, 2×, and compare them for density, clarity and taps. ZivugBase's first
  attempts felt bulky next to PeerMatch; the comparison made that obvious. PeerMatch's sizes are
  in `HANDOFF_OPUS.md` §7 as a baseline.
- Keep sizes in **px**, defined once as tokens.
- **Keep class names unique per component.** A quick-details box used class `quick`, which Home
  already used as a 4-column grid.
- **Scope form styles.** A broad `main input {…}` overrode the compact inputs inside cards.
- **Never put a button inside a `<label>`.** Tapping the label's text pressed the button: the
  Paste button inside the Profile label.
- **Read stored settings as strings.** `Number(localStorage.getItem(x))` is `0` when nothing is
  stored, which silently chose the wrong zoom level.
- The owner liked PeerMatch's pinned round back arrow, the WhatsApp-style note bar with a mic at
  the bottom of a person's page, and its small SVG icons (`history-composer-v36.js`). These are
  ideas, not requirements. If there's a fixed bar at the bottom, keep toasts above it.

---

## 6. Things that failed

- **Android add-on.**
  - The full add-on (a floating bubble using Accessibility) was blocked by Play Protect when
    installing.
  - With Play Protect off, NetSpark blocked turning it on.
  - The light add-on (a "ZivugBase" item in the text-selection menu) didn't appear for the owner.
  - The capture paths that work are **Paste** (one tap, reading the clipboard inside the tap) and
    **share to the app** (manifest `share_target`).
  - ZivugBase's `android/zivugbase-addon.jks` signing key is in a public repo. Don't copy it; keep
    any signing key in GitHub secrets.
- **Building a lot before the owner saw it.** Every screen must be deployed and checked on the
  phone before the next.
