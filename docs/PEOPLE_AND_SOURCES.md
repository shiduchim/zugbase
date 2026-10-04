# People at scale: one record per person, every source kept

Design only, no code. Written 2026-10-04. It extends `docs/SHIDDUCH_LOGIC.md` (Architecture C, as
decided) for these cases:

- 100+ shadchanim
- meeting the same person again, and repeated referrals
- lists of many shadchanim given at once
- profiles that aren't for me
- Single Mode and Shadchan Mode

**Every name and number in it is made up.**

**Status: decided in part.** `docs/ARCHITECTURE.md` (2026-10-04) records the owner's decisions.
It wins where this document differs. This one keeps the reasoning and the stress tests. Changed
since the first version:

- **"Waiting" and "You owe"** are now **"Waiting on them"** and **"Waiting on me"**.
- **A profile arriving for me no longer creates a shidduch.** It's an **idea** first. "Not
  applicable" closes the idea, and "Interested" creates the shidduch (sections 13 and 16,
  rewritten).
- **The tabs are now Recent · Guys · Girls · Shadchanim · Shidduchim**, in both modes
  (section 15, rewritten).
- **Shadchanim views** are All · Waiting on them · Waiting on me · Needs contact · Sources. Lists
  of shadchanim live under Sources.
- **Person types** are Guys, Girls, Shadchanim and References. Parents and friends have no list
  of their own.

**Contents**

1. The answer in one minute
2. The whole picture, in one diagram
3. One person, one record
4. Meeting someone again
5. Referrals: every source kept
6. Lists of many shadchanim
7. The same shadchan, again
8. 100+ shadchanim on the phone
9. The shadchan page
10. How sources are stored: six options compared
11. One home for every fact
12. Stress test: Miriam, five sources, two years
13. A profile that isn't for me
14. She declined, and later David ↔ Leah
15. Single Mode and Shadchan Mode
16. Stress test: Leah from "not for me" to David ↔ Leah
17. Does this change the architecture? Conflicts, and decisions for you

---

## 1. The answer in one minute

- **One person = one record, by construction.** Every way a person can enter the app passes
  through **one matching check**: adding someone, filing from Intake, a list, a contact card, a
  chat import, the PeerMatch import.
  - Same phone or email: "Miriam is already here", with her history. One tap confirms.
  - Same name only: the app asks.
  - When a mistake happens anyway, a **merge** joins the two records with nothing lost, and Undo
    works.
- **How I know someone is a list of moments, not a field.**
  - "Met her at an event" and "Rivka recommended her" are each written once, in the entry where
    they happened.
  - The person's page lists all of them, oldest first. Nothing is ever overwritten.
- **Events, groups, sites and lists get a permanent ID**, like dates and open items. A list of 50
  shadchanim is one ID that 50 normal person records point to. It never holds copies of them.
- **"Has my profile", "first met", "last contact", "no reply" and "needs contact" are never
  stored.** They're worked out from the ledger, so they can't drift.
- **"Not applicable for me" is not a field.** It's how I answered the idea of Me ↔ Leah:
  - no shidduch is created
  - Leah's person record stays forever, whole
  - Single Mode hides her from everyday screens; Shadchan Mode shows her
- **Modes change what you see, never the data.**
- **The architecture doesn't change.** Architecture C gains:
  - one new kind of permanent ID, for sources
  - two new kinds of change: met and referred
  - one matching check
  - one privacy rule for sending

  Section 17 explains why this confirms C.

---

## 2. The whole picture, in one diagram

```
 One ledger: every moment, written once
 ┌──────────────────────────────────────┐
 │ met · referred · called · sent       │
 │ replied · suggested · answered       │
 │ date · feedback                      │
 └───┬────────────┬────────────┬────────┘
     ▼            ▼            ▼
  Person       Source       Shidduch
  one per      event,       one per
  human        group,       pair
  (Miriam,     site, list   (Me ↔ Leah,
  Leah,        (Rivka's     David ↔
  David)       list)        Leah)
     │            │            │
     └─────┬──────┴─────┬──────┘
           ▼            ▼
   worked out:      worked out:
   how I know them  has my profile
   last contact     on them, on me
   list totals      not for me
           │
           ▼
   what you see:
   Single Mode or Shadchan Mode
```

Three kinds of thing are stored:

- **people** (with their facts)
- **sources and shidduchim** (each one a permanent ID)
- **the ledger**

Everything you look at is worked out from them.

---

## 3. One person, one record

### 3.1 What tells us two records are the same human

| Signal | Strength | Why |
|---|---|---|
| WhatsApp number from a contact card (`waid`) | certain | WhatsApp's own exact number |
| Phone number (normalized: no country code, no leading 0) | certain, but confirm | people share a phone (a couple's home line) or pass on a relative's |
| Email | certain, but confirm | a family can share one inbox |
| Name, across scripts (Miriam · Miryam · מרים), without titles (Mrs., Rebbetzin, "Shad.") | likely, never certain | two Miriams in Jerusalem are normal |
| Same city or community, or the same referrer | adds to a name match | never enough alone |
| Your own "Not the same person" answer | final | remembered, never asked again |

### 3.2 The rule: one matching check, used everywhere

Every way a person can come in goes through the same check, with one owner in the code:

- adding by hand
- filing from Intake
- a list of shadchanim
- `.vcf` contact cards
- a WhatsApp chat import
- the PeerMatch import

The check gives one of four answers:

1. **Certain** (same number, email or WhatsApp number): "Miriam is already here", with a summary
   of her history. **Same person: Yes** is already selected, and one tap confirms.
2. **Likely** (same name, plus the same city or referrer): "Is this the Miriam you know?
   Yes / No". Nothing is selected for you.
3. **Possible** (a similar name only): shown as "maybe the same as Miriam (Jerusalem)". The
   default is a new record, but the hint stays visible.
4. **No match:** a new record.

**It never merges silently, and it never creates silently.** "Certain" is still one tap, because
of shared phones.

### 3.3 When information is incomplete

- **A name with no number** ("call Mrs. Katz in Jerusalem"):
  - A light record is made: name, city, who mentioned her, and "no number yet".
  - It shows up under the "Needs a number" filter.
  - When a number is added later, the check runs again. If the number belongs to someone already
    here, it proposes a merge.
- **A line in a list that can't be read** (no name, or only "the lady from the seminary"): it
  stays as an unresolved line of that list, with no person record, until you decide (section 6).
- **A number that is already someone else's:** "050-000-1101 is Miriam's number." The new
  record is linked to her, not created twice. For example, a profile whose contact line is
  Miriam becomes "contact for Leah: Miriam". PeerMatch already did this for shadchanim.

### 3.4 When a duplicate happens anyway: merge

- A merge screen shows both records side by side and lets you pick each field.
- Every entry, link, open item, shidduch and source that pointed to the second record now points
  to the first. The second record stays behind as a **pointer to the first**, so nothing old
  breaks.
- The other names and phone numbers are kept on the remaining record.
- **Undo** works, and the merge itself is an entry in the ledger.
- If you answer "Not the same person", that answer is kept, so the app never asks again.

---

## 4. Meeting someone again

**Each meeting is an entry in the ledger**: in person, on a date, with a "met" change that names
the person and, if there was one, the event.

```
Jan 12 · In person · Shidduch evening
  Met: Miriam (new person)
Mar 10 · In person · Shadchanim day
  Met: Miriam (already here)
```

- **Not a relationship.** A relationship (link) is a lasting fact: "Miriam is Leah's aunt". A
  meeting is a moment.
- **The event is a source with a permanent ID** ("Shidduch evening, Jan 12"), named once. Ten
  people met there all point to the same ID, so "who did I meet at that evening?" is one tap.
- **Meeting Miriam again changes nothing on her record.** It adds one line to "How I know her".
  "First met" and "met again" are worked out: the earliest line, and the later ones.

---

## 5. Referrals: every source kept

A referral is a moment, so it is a **change on the entry where it happened**:

```
Jun 8 · Rivka → Me · WhatsApp
  the list, exactly as it came
  Referred: 48 people, one of them
    Miriam (line 23), on Rivka's list
Sep 20 · Sarah → Me · call
  "Call Miriam, she's great with
   baalei teshuvah"
  Referred: Miriam, by Sarah
```

Each referral change holds:

- **who** is being referred
- **by whom**
- **which list or source**, if any (an ID)
- **which line** of that list
- **the referrer's own words**, kept apart from the person's own text

**There is no "referred by" field.** All of these are worked out from the changes, so a new
referral only adds a line:

- **How I know Miriam:** every met and referred line, oldest first.
- **First source:** the oldest of those lines. PeerMatch's referral tree groups each shadchan
  under it.
- **Whom did Rivka refer?** Every referral where the referrer is Rivka. Later the app can also
  show how useful her referrals were.

A **profile arriving** works the same way: "Referred: Leah, by Miriam, with her profile".

---

## 6. Lists of many shadchanim

### 6.1 What the list is

The list is a **source with a permanent ID**. For example:

- "Rivka's list · Jun 8"
- from: Rivka
- arrived in: entry e4
- her instructions: "write to each one, Hebrew and English; call after Yom Tov if no answer"
- a follow-up date, if you set one
- its lines, in order, exactly as they came, whether text lines or contact cards

**Every line points to a normal, permanent person record**, or stays "not added yet". The list
holds no copies of people.

### 6.2 Filing a list: one review screen

```
Rivka's list · Jun 8 · 50 lines
 New 43 · Already here 5 · Can't add 2
──────────────────────────────────
 Dina · Haifa · 050-000-2001   New
 Miriam · 050-000-1101   Already here
   met Jan 12 · has v2 (old)
 Mrs. Katz · Jerusalem
   no number    [Add without] [Skip]
 …
              [Save all]
```

- One entry holds the list as it came.
- One save writes the new people, one referral change per line, and the list's ID.
- The 5 people already here get a referral line added, and nothing else.

### 6.3 Following up the list: all worked out, nothing copied

```
‹ Rivka's list · Jun 8 · 50
  "Write to each one… call after
   Yom Tov if no answer."
 New 43 · Already here 5 · Not added 2
 Contacted 32 · Replied 14
 No reply 18 · Not contacted 11
 Follow up Oct 5 · 18 left ›
──────────────────────────────────
 (the normal shadchan rows, filtered)
 [Send my profile to the 11 ›]
```

| Count | Worked out as |
|---|---|
| New | the person record was created by this list's entry |
| Already here | the person existed before the list arrived |
| Contacted | anything I sent them, or a call, after the list arrived |
| Replied | anything from them after my first contact |
| No reply | contacted, nothing back |
| Not contacted | on the list, nothing sent yet |
| Follow-up | the list's follow-up date, applied to whoever has no reply by then |

- **The follow-up is one quiet open item** for the whole list ("Rivka's list: 18 haven't
  replied"), not 18 reminders. When its date comes, Home shows one line. The list inside it shrinks
  by itself as people reply.
- **Sending to the list** uses the normal one-at-a-time WhatsApp queue: one message per person,
  one tap each.
- Tapping a row opens **that person's normal page**.
- **A folder can be made from a list** with Add to… (approved), if you want to keep the group
  yourself. The list itself is history; a folder is your own organizing.

---

## 7. The same shadchan, again

When Miriam appears again, in any list, card, paste or form, the matching check shows:

```
Miriam is already here
 052-000-7777 is her number
 Met Jan 12 (Shidduch evening) and
 Mar 10 (Shadchanim day)
 Rivka's list, Jun 8
 Last call Aug 21 · has v2 (old)
 Waiting on them: 1 · Waiting on me: 1
 2 active shidduchim
Same person?             [Yes] [No]
Adds: Sarah recommended her, Sep 20
 "great with baalei teshuvah"
                [Save]
```

- **Yes** adds one referral line to her record.
- **No** makes a new record, and remembers that these two are not the same person.
- The summary is worked out from her "How I know her" lines, her History, and her open items.

---

## 8. 100+ shadchanim on the phone

### 8.1 The list: one or two lines per person, never big cards

It uses the zoom levels you approved. This is the **Details** level:

```
Shadchanim · 112              − +
[ Search name, phone, city…     ]
 Waiting on them 6 · Waiting on me 3
 Needs contact 18 · Sources ›
Sort: last contact ▾ · Group: none ▾
──────────────────────────────────
 Miriam · Jerusalem          3 d
  on them · on me · 2 active
  has v2 (old) · 5 sources
 Batya · Beit Shemesh       2 mo
  no reply since Sep 2 · has v3
 Dina · Haifa                new
  never contacted · Rivka's list
 …
```

The **Names** level is one line each:

```
 Miriam            on them   3 d
 Batya                      2 mo
 Dina              new
```

Rows waiting on someone stay yellow, as today.

### 8.2 Filters: one row of chips with counts

Each chip filters the list. Tap a chip again to clear it.

| Filter | Meaning |
|---|---|
| Waiting on them | an open item: I've done my part, and I'm waiting for them |
| Waiting on me | an open item: they've done their part, and I need to act |
| Calls due | a Call due on them, today or overdue |
| No reply | I sent something, and nothing has come back |
| Needs contact | never contacted, or a list follow-up is due |
| Has my profile · Old profile · No profile | worked out from what I sent and the newest version |
| Active shidduchim | a go-between in an active shidduch |
| Needs a number | a light record with no phone yet |
| From… | pick a source: a person (Rivka), a list, an event, a group |
| Folders | the approved folders (Chabad › Tzfat) |

### 8.3 Sorting and grouping

- **Sort:**
  - last contact (newest first, or oldest first to find the forgotten)
  - A–Z
  - recently added
  - waiting longest
  - most ideas sent to me
- **Group:**
  - none
  - by who referred them: PeerMatch's referral tree, under the first source, with "+2 other
    sources" when there are more
  - by folder
  - by city
  - by first letter, which adds an A–Z strip at 100+

### 8.4 Search: the same one search as everywhere

- **What it finds:** names in any script and their other spellings, phone digits, city, notes,
  folder names and source names. So "rivka list" finds Rivka's list.
- **Results:** people and shidduchim, in one list.
- **Single Mode:** my own people come first.

---

## 9. The shadchan page

Everything you asked for is at the top, one line each. Each line taps through to the detail.

```
‹  Miriam                      ב״ה
   Jerusalem · shadchan     [Edit]
   052-000-7777
 Call · Email · WhatsApp · SMS · Waiting
 Waiting on them Leah's feedback,
                 Date 1 · 3 days
 Waiting on me   your parents' names
 My profile      has v2 (old) · Jun 14
                 [Send v3]
 Shidduchim      Me ↔ Leah · dating
                 Daniel ↔ Shira · new
 Last contact    call · Aug 21
 Call due        Today · Tomorrow · Date
 How I know her  met Jan 12, 2026
                 + 4 more ›
 Notes · tags · religious fields
 History    All · Leah · Shira · mine
   (every message, call and note)
 [ Note…                      (mic) ]
```

**"How I know her ›"** opens the full list:

```
How I know Miriam
 Jan 12, 2026  Met her
   Shidduch evening, Jerusalem
 Mar 10, 2026  Met again
   Shadchanim day
 Jun 8, 2026   On Rivka's list (50)
   line 23 · already here
 Sep 20, 2026  Sarah recommended her
   "great with baalei teshuvah"
 Feb 14, 2027  In Chana's contacts
   new number added
```

The History chips narrow her History to one shidduch, or to my own profile matters ("mine").

---

## 10. How sources are stored: six options compared

| Option | Keeps every source | Written once | Shows the evidence | "Whom did Rivka refer?" | Lists | Verdict |
|---|---|---|---|---|---|---|
| One `referredBy` field | no, it's overwritten | yes | no | only the latest | no | rejected (PeerMatch's problem) |
| Many Referral records | yes | no: it copies who and when from the message | only if linked back | yes | needs more | workable, but a second copy |
| Relationship links | no: one link per referrer, dates lost | yes | no | yes | no | wrong tool: links are for lasting facts |
| Ledger entries only | yes | yes | yes | yes, worked out | weak: a list has no name or ID | almost |
| List objects only | only lists | — | — | — | yes | not enough alone |
| **Entries + source IDs** | yes | yes | yes | yes | yes | **chosen** |

**Chosen:**

- **Referrals and meetings** are changes inside the entry where they happened.
- **Events, groups, sites and lists** each get a permanent ID.
- **Links** are kept for lasting facts only.
- **Everything else is worked out:** first source, the referral tree, list totals.

This is the same pattern as dates and open items in `SHIDDUCH_LOGIC.md`.

---

## 11. One home for every fact

| Fact | Its one home | Never stored again as |
|---|---|---|
| Met at an event | a "met" change in an in-person entry, pointing to the event's ID | a field, a link, a folder |
| Referred by Rivka | a "referred" change in Rivka's entry | a "referred by" field |
| Came from list 17 | the same referral change, with the list's ID | a list member copy |
| Called | a call entry | a "talked by phone" box (PeerMatch's box is kept on imported records, and shown next to the last call) |
| Has my profile, and which version | nothing: worked out from my sent entries | a flag or a section |
| Involved in Daniel ↔ Leah | the shidduch's go-betweens, and the entries she's part of | a field on Miriam |
| First met, last contact | nothing: worked out | fields |
| Waiting on them, waiting on me, calls due | open items, each with its own ID | a Waiting switch |
| Miriam is Leah's aunt | a link | anything else |
| Her phone, city, notes | facts on her record, edited directly | entries |

---

## 12. Stress test: Miriam, five sources, two years

**What happens**

| When | Source | What the app does |
|---|---|---|
| Jan 12, 2026 | I meet Miriam at a shidduch evening and add her | new record (no match) |
| Mar 10, 2026 | I meet her again at a shadchanim day | "Already here" (same phone): adds a meeting line |
| Jun 8, 2026 | Rivka's list of 50; Miriam is line 23 | the list review shows her as "Already here": a referral line |
| Sep 20, 2026 | Sarah recommends her on a call | "Already here": a referral line, with Sarah's words |
| Feb 14, 2027 | Chana sends 14 contact cards; Miriam's card has a **new number** | name, city and shadchan match, so the app asks "Is this the Miriam you know?". Yes: the new number is added, and the old one is kept as old |

In between:

- I sent her my profile v2 (Mar 11, 2026).
- I called her four times.
- She's the go-between in Me ↔ Leah and in Daniel ↔ Shira.
- On one day, I'm waiting on her for Leah's feedback (waiting on them) **and** she's waiting for
  my parents' names (waiting on me).

**What exists underneath**

```
Person  p17 Miriam (the only one)
  phones 050-000-1101 (old)
         052-000-7777
Sources S1 Shidduch evening, Jan 12
        S2 Shadchanim day, Mar 10
        L17 Rivka's list, 50 lines
        L22 Chana's cards, 14
Entries e1  met: p17 at S1 (new)
        e2  met: p17 at S2
        e3  sent: my profile v2 → p17
        e4  Rivka's list → 48 referrals,
            one is p17 (line 23)
        e9  Sarah → me, call:
            referred: p17, her words
        e30 Chana's cards → referral
            p17 (card 6), new phone
        + 4 calls, messages, notes
Items   o41 waiting on them (p17):
            Leah's feedback, Date 1
        o44 waiting on me (p17):
            parents' names
Shid.   s5 Me ↔ Leah (go-between p17)
        s9 Daniel ↔ Shira (p17)
```

**Not stored anywhere:** "referred by", "first met", "has my profile", "list member", "last
contact". Each one is worked out from the lines above.

**What I see on the phone:** her page, exactly as sketched in section 9:

- one record
- one line per item at the top
- "How I know her" with five lines

In the shadchan list she is one row: "Miriam · on them · on me · 2 active · has v2 (old) ·
5 sources".

**The mistake test.** Suppose that in June her list line had no number, and "Mrs. Miriam K." was
made by mistake. In February, Chana's card carries the number that is on Miriam's record.

- The app proposes: "Mrs. Miriam K. may be Miriam: merge?".
- Yes: the June referral now points to p17.
- p88 becomes a pointer to p17.
- Undo works.

---

## 13. A profile that isn't for me

*Rewritten for the decided rule: a shidduch exists only for a real pairing (`ARCHITECTURE.md`
section 5).*

**Case 1.** Miriam sends me Leah's profile, and I decide quickly: not applicable for me.

**How it's stored.** The one arrival entry holds two separate facts:

1. **How Leah came to me:** "Referred: Leah, by Miriam, with her profile". This belongs to
   **Leah's person record**, forever.
2. **An idea for me:** "Idea: Me ↔ Leah, suggested by Miriam", with a permanent ID. **It is not a
   shidduch.**

**My answer closes the idea.**

- I tap **Not applicable** (with an optional private reason).
- **No shidduch is created.**
- Miriam still gets a quiet "waiting on me: answer Miriam", unless I choose "No reply needed".
- Leah's record, her profile versions, her photos and files, who sent her, her sources and her
  History all stay untouched.

**If I had tapped Interested,** the shidduch Me ↔ Leah would have been created at that moment.
The app would then propose linking the earlier entries to it: the arrival, and any opinion I
asked for.

**"Relevance to me" is worked out, not typed:**

| Leah's state | Worked out from |
|---|---|
| idea for me, undecided | an open Me ↔ Leah idea |
| not applicable for me | the idea, closed as not applicable |
| my active shidduch | Me ↔ Leah, current round active |
| ended (I said no, or she declined) | Me ↔ Leah, current round ended |
| never suggested to me | nothing involving me (a profile kept for friends) |

**What I see:**

- **Single Mode:** Leah is gone from everyday browsing (Recent's focus, Girls → For me). Search
  still finds her, marked "not applicable · from Miriam, Aug 3".
- **Shadchan Mode:** she is a normal girl in the Girls tab, with all her details.

## 14. She declined, and later David ↔ Leah

**Case 2.** Miriam suggests Leah. I say Yes, and Leah says No.

**Me ↔ Leah stays as an ended shidduch:**

```
Me ↔ Leah · Round 1 · ended
  My side: Yes (Aug 9)
  Her side: No (via Miriam, Aug 16)
  Ended by her side · declined
```

**Two years later, David ↔ Leah** is a **new pair, so a new record**, with its own ID, rounds,
dates, open items and History.

**Why my private history can't leak:**

1. **Outgoing messages are built only from what you choose to send:** a profile version, chosen
   photos and files, and your own typed words. No History, note, shidduch, answer or reason can
   ever be placed into a message.
2. **A profile version holds only her profile, never the message that brought it.**
   - When filing, the profile part is kept as the version (the whole text by default, and you can
     trim it).
   - Miriam's wrapper ("I have an idea **for you**…") stays only in the arrival entry.
   - So sending Leah's profile to David can't carry "for you" from Miriam's message.
   - *This tightens the prototype, which kept the whole message as the version.*
3. **David ↔ Leah's page shows only David ↔ Leah's entries.** A shidduch page shows the entries
   about that shidduch, by its ID, and nothing else.
4. **On Leah's own page, my shidduch is private and folded.**
   - Her History shows my old Me ↔ Leah under one folded line, "My own shidduch with Leah
     (ended)".
   - In Shadchan Mode it stays folded.
   - Nothing from it is offered when you share.
5. **The new shidduch's go-betweens come from Leah's links** (her mother, her shadchan), not from
   my old shidduch's History.

---

## 15. Single Mode and Shadchan Mode

*Rewritten for the decided navigation (`ARCHITECTURE.md`, sections 8 and 9).*

**One database and one ledger.** A mode is a setting. It changes which view each tab opens on, and
what comes first. It never changes, moves or copies data.

**The tabs are the same in both modes:** Recent · Guys · Girls · Shadchanim · Shidduchim.

| Tab | Single Mode | Shadchan Mode |
|---|---|---|
| Recent | what concerns me and my network; other people's shidduchim as one quiet line | everything |
| Guys | the guys I help, if any | all guys |
| Girls | For me (open ideas and my shidduchim) · Previous | all girls, including "not applicable for me" |
| Shadchanim | All · Waiting on them · Waiting on me · Needs contact · Sources | the same |
| Shidduchim | mine: Active · Ideas · Ended | all, with mine marked private |
| Search | everyone; mine first | everyone |
| Make match | hidden | on the Shidduchim tab and on a single's page |

## 16. Stress test: Leah from "not for me" to David ↔ Leah

| Step | What happens | Underneath | On the phone |
|---|---|---|---|
| 1 | Miriam sends Leah | entry e1: Leah's record and profile v1 · referral by Miriam · **idea** Me ↔ Leah · waiting on me: answer Miriam | Intake → "Idea for me" → saved |
| 2 | Not applicable | entry e2: the idea closes as not applicable · **no shidduch is created** · the answer item closes when I tell Miriam | one tap, then "Tell Miriam" |
| 3 | Gone from Single Mode | nothing changes underneath | Leah isn't in Girls → For me; search finds her |
| 4 | Six months later, Shadchan Mode | nothing changes underneath | the Girls tab shows Leah, with all her details |
| 5 | Looking for a girl for David | — | search or filter the Girls list: Leah appears |
| 6 | She's still there | the same record, p23 | her page: "From Miriam, Aug 3" · profile v1 · my closed idea, folded and private |
| 7 | David ↔ Leah | entry e40: a new shidduch s40 (David ↔ Leah), suggested by me, go-betweens from her links | Make match → its own page, starting empty |
| 8 | Kept apart | s40's entries are only its own; outgoing messages are built from profile v1 only | David ↔ Leah shows nothing about my idea; Leah's page keeps both, with mine folded |

---

## 17. Does this change the architecture? Conflicts, and decisions for you

### Does it change the architecture?

**No. It's an extension of C**, and the cases above are good evidence that C was right:

- **A (people first)** would need a growing "referred by" list on each person.
- **B (case files)** has nowhere to put a meeting or a referral at all.
- **C** already writes each moment once, and can show it on every page it concerns.

**What gets added to C:**

1. **One matching check** ("who is this?") with merge, pointers and "not the same person"
   answers.
2. **Source IDs** for events, groups, sites and lists, the same pattern as round, date and open
   item IDs.
3. **Two new kinds of change:** met, and referred (by whom, which source, which line, their
   words).
4. **One quiet follow-up item per list**, with its list of people worked out.
5. **Relevance to me is worked out** from the Me ↔ X shidduch. There's no new field.
6. **Two rules for sending:**
   - messages are built only from what you choose to send
   - a profile version never holds the message that brought it

### Conflicts with earlier decisions

1. **You rejected ZivugBase's "Where they came from" and "Profile shared" sections.** Now you're
   asking for "how I met them", every referral, and "which version they have".
   - Each one is **one line** on the shadchan page, with a tap-through. Neither is a section.
2. **PeerMatch groups shadchanim under one referrer.** With many sources, the grouping uses the
   first source, and marks "+N other sources".
3. **Filters and sorting go beyond PeerMatch.** PeerMatch had only search, plus the Waiting and
   Calls pills. The filter chips in 8.2 are new, so they need your OK (question 4).

### Decisions for you

*Partly answered on 2026-10-04: the Shadchanim views are decided, and Recent replaced Home. The
questions still open are repeated in `ARCHITECTURE.md` section 14.*

1. **Matching:** same phone or email counts as "certain, one tap to confirm", and same name only
   counts as "ask". Is that right?
2. **"Needs contact":** is it "never contacted, or a list follow-up is due"? Or should it also
   include "no contact in 60+ days", shown only as a filter, never as a reminder?
3. **The shadchan list's default view:** sorted by last contact with no grouping, or grouped
   under who referred them, as in PeerMatch?
4. **Filters:** approve the chips in 8.2 for the Shadchanim list? In Shadchan Mode, also allow
   filtering Guys and Girls by age, city and the quick-details boxes?
5. **Single Mode's Home:** keep other people's shidduchim out of it, with one quiet line "N open
   in Shadchan Mode"?
