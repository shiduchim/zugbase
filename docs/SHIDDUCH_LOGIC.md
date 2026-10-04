# How zugbase should work: the shidduch information model

This is a design only; there is no code. It was written on 2026-10-04, after studying all five
attempts: PeerMatch, zugmatch, ZivugBase, zugbase and testmatch. **Every name in it is made up.**

**Status: decided on 2026-10-04.**

- The owner chose **C · One ledger**, with the two changes from A and B.
- Section 11 records the owner's answers. Sections 9.2, 9.4 and 9.5 add the two refinements the
  owner asked for: a permanent ID for every date and for every open item.
- A clickable prototype with made-up data, `prototype/shidduch-flow.html`, walks through a
  complicated shidduch on the phone (section 12).
- The production app is not being built yet.
- **Later decisions (2026-10-04) are recorded in `docs/ARCHITECTURE.md`, which wins where this
  document differs.** The main changes:
  - "You owe X" / "I owe X" now reads **"Waiting on me"**, and "Waiting on X" reads **"Waiting on
    them"**.
  - **A shidduch exists only for a real pairing.** A profile arriving for me is an **idea**
    first. "Interested" creates the shidduch, and "Not applicable" closes the idea. The Leah
    example in section 7 is updated to match.
  - **Home is replaced by Recent.** The tabs are Recent · Guys · Girls · Shadchanim · Shidduchim,
    in both modes.
  - **The look is the Warm Modern Dashboard.** Presentation settings (theme, density, icon size,
    dashboard layout) stay apart from the data.
  - **The prototype in section 12 is paused,** and out of date with these decisions.
- `docs/PEOPLE_AND_SOURCES.md` extends this design. It covers one record per person, every source
  kept (meetings, referrals, lists), profiles that aren't for me, and the two modes.

**Contents**

1. The answer in one minute
2. The real shidduch process
3. The 12 questions, and what each one needs
4. The five attempts: what each gets right and wrong
5. The building blocks
6. Three competing architectures
7. One complicated shidduch, stored three ways
8. Stress tests
9. The chosen design in full
10. Conflicts I found
11. Decisions (answered)
12. The clickable prototype

---

## 1. The answer in one minute

**The problem.** In every attempt so far:

- the story of one shidduch is spread across several people's History
- "Waiting" is one switch per person, so it can't say *on whom* or *about what*
- nothing records which version of a profile went to whom
- dates, and what each side said after them, have no place except free notes

**Three ways to fix it**

- **A · People first.** Each person holds their own story, as in PeerMatch. A shidduch is a
  small link between two people.
- **B · A file per shidduch.** Each shidduch is a folder that holds everything about it.
  People are a phone book.
- **C · One ledger.** Everything that happens is written once, as one entry, like a line on a
  bank statement.
  - Every page (a person, a shidduch, Home) shows the entries that concern it.
  - The status at the top of a page is worked out from those entries. Nobody types it.

**Chosen: C, with one thing borrowed from A and one from B.**

- C scored best in the stress tests (section 8), and nothing ever has to be written twice.
- **From A:** facts about a person (phone, age, checkboxes) are still edited directly.
- **From B:** each shidduch is a real record: one per pair, with its own page that reads like a
  case file.
- With those two changes it passes all 15 tests and answers all 12 questions.

**What stays as you know it**

- PeerMatch's person page and its History.
- The buttons and flows you use every day.

**What's new**

- One History entry can show on Miriam, on Leah and on their shidduch at the same time.
- Each shidduch gets one page: both sides, the dates, what's pending, and the whole story.
- Home shows who is waiting on whom, and what you owe whom.

**Your answers** are in section 11, and the prototype is described in section 12.

---

## 2. The real shidduch process

### 2.1 Before any shidduch: the network

- **My profile goes out** to many shadchanim:
  - in Hebrew, English and Russian
  - updated over time
  - with a photo and references
- **Shadchanim ask for things:** a photo, parents' names, references, their template filled in.
- **New shadchanim arrive in bursts.** One shadchan sends 14 contacts: "write to each one; call
  after Yom Tov if they don't answer."
- **Friends' profiles arrive** for me to help with. Each comes with "OK to share?" and what the
  friend says about them.

### 2.2 The life of one shidduch

1. **The idea arrives.** It can come from:
   - a shadchan: text, a PDF, a photo or a voice note
   - a friend, family or a site
   - my own idea (Make match)

   Sometimes it arrives before I even know her name.
2. **Checking.**
   - I read the profile and look at the photo.
   - I ask the shadchan questions.
   - I send the profile to a friend or relative for an opinion.
   - I call references, or ask a rav.
3. **My answer.** Usually one side answers first. My answer goes back to the shadchan, often with
   a question.
4. **The other side.** The shadchan asks them, often through a parent.
   - Answers come back in steps: "I haven't asked her yet" → "the mother saw it" → "they're
     checking references" → "she says yes".
   - Meanwhile they call *my* references.
5. **Setting up the date.** Who arranges it, when and where. It may be moved or cancelled.
6. **The date.** It happened or it didn't, plus my own impressions.
7. **Feedback.** Each side tells the shadchan, and the shadchan passes it on. What *I* told the
   shadchan matters as much as what she told me.
8. **More dates.** The same loop again. After a few dates the couple often talks directly.
9. **A pause.** Travel, a family event, "needs time". A pause is not an ending.
10. **The end.** Who ended it, why (private), who told whom, and whether I thanked the shadchan.
11. **Engaged.**
    - Everything else closes.
    - The shadchanim who have my profile must be told.
    - The credit goes to someone.
12. **Later.** The same girl comes back through another shadchan, maybe years later, or she
    could suit a friend.

### 2.3 Why information scatters in real life

- **Relay chains.** Her mother → her shadchan → my shadchan → me. *Who told me* is not the same
  as *whose words* they are.
- **One message, many topics.** One WhatsApp or one call covers three shidduchim and a request.
- **Two shadchanim.** Two can work on one shidduch, or the same girl comes from two of them.
- **Versions.** Profiles change, and shadchanim hold old versions. The same girl's profile can
  arrive twice, different each time.
- **"I'm busy."** While I'm dating, new ideas wait.
- **Calls leave no text.** There is only the note written right after.
- **Unknown dates.** Old data, and pasted messages with no time on them.
- **Reuse.** The same people come back, sometimes years later.

---

## 3. The 12 questions, and what each one needs

| Question | The data must hold |
|---|---|
| Who contacted whom? | every message, call and meeting: from → to, and the channel |
| Who introduced this person? | the entry that first brought them, kept for good |
| What exactly was sent? | the words as sent, and the files themselves |
| Which version? | frozen profile versions, with each send pointing to one |
| When was it sent? | the real time, or "unknown", never a guess |
| What reply came back? | the reply, linked to what it answers |
| Who is waiting on whom? | open items: who owes whom, what, since when |
| What happened on each date? | each date: when, where, whether it happened |
| What did each side say afterward? | each side's feedback per date, and who passed it on |
| What did I tell the shadchan? | my own words, kept exactly |
| What is the next action? | the open items, soonest first |
| The whole story? | every entry about the shidduch in time order, including the ones from before it had a name |

---

## 4. The five attempts: what each gets right and wrong

### PeerMatch (live, v131: what you use every day)

**Right**

- It holds a lot about each person: every field you need, on a solid, compact page.
- Every person has a History, with "To: name" lines and outgoing messages indented like a chat.
- The after-call popup. Without it, a call leaves no trace.
- Sending is done right: one message per profile, PDF first, photo Yes/No, and the Make match
  template.
- WhatsApp chat import into a shadchan's History; ZIP and TXT backups.

**Wrong**

- **There is no shidduch record.**
  - Make match writes three copies of one History line: on the guy, the girl and the shadchan.
  - There is no status, no answers, no dates and no ending.
- **History is copied** onto two people and then kept in step by repair code. Copies drift.
- **"Waiting" has two meanings:**
  - the yellow button on the page
  - "Waiting" in the Shadchanim list, which comes from the last message

  Either way, it's one per person.
- **No versions.** "Which profile does Miriam have?" can't be answered.
- **Who sent a profile** lives in three generations of fields (`source…`, `contact1…`,
  `linkedShadchan…`).
- Times are saved as display text, so sorting and "how many days" are unreliable.
- Guys, girls and shadchanim are separate lists, so one human can exist twice.

### zugmatch (PeerMatch rebuilt with clean code)

**Right**

- It keeps PeerMatch's behavior, with:
  - one owner per feature
  - one WhatsApp queue
  - tests
  - backups that move both ways

  You've already tried it on the phone.
- Both copies of a shared profile are written at send time, not repaired later.

**Wrong**

- It keeps PeerMatch's data model on purpose, so every gap listed above is still there.

### ZivugBase (a TypeScript engine plus a long design plan)

**Right**

- One person per human, with roles. Phone numbers are matched to find repeats.
- **One History entry is linked to everyone involved**, so there are no copies.
- An **Idea** record holds each side's answer, who suggested it (several people) and why it ended.
- The Intake folder keeps the original exactly, and nothing is filed without a tap.
- Lessons from real chats:
  - one conversation holds many facts for different places
  - profiles come in language versions
  - "how to reach them"
  - referral bursts, with one follow-up for the whole batch

**Wrong**

- Its Ideas, "Profile shared" and "Where they came from" sections, and its "Where things stand"
  sheet, were all rejected (extra sections, big buttons). So the Idea record was never really used
  on screen.
- No dates, and no feedback per side.
- Status, waiting and next step are typed into fields *next to* the History. That makes two
  sources, and they can disagree.
- Only one next step per person or idea, and waiting doesn't say on whom or about what.
- Shares were listed, but profile versions were planned and never built, so "which version?"
  still had no answer.
- Too many new concepts at once (categories, lists, helpers, sites).

### zugbase (this repo, so far)

**Right**

- The Intake folder: paste now, file later, with "What is it?" and "Who sent it?".
- Folders as labels, with zoom.
- One Explorer tree, with reverse links ("Sent by Rivka (2)").
- Calls due on anyone, memos, Recently deleted.

**Wrong**

- History went back inside each person's record. A share or a match is written separately on
  each person, as in PeerMatch.
- Make match only writes a line. There is no shidduch record.
- Folders carry all the organizing, but a folder can't say who contacted whom or what is pending.
  You said it "felt like folders + paste and nothing else".
- The person page is split into tabs, which costs taps.
- "Came from" is a single field, and waiting is one switch.

### testmatch (the newest: a design lab)

**Right**

- It names the core problem: one shidduch's story is spread across people.
- It has mostly the right building blocks:
  - a person
  - a match case that tracks his side and her side separately
  - one event linked to many places, read as from → to · channel · what · result · next
  - profile versions
  - dates, with each side's feedback
  - follow-ups tied to the event that made them
- It keeps track of who said what:
  - "I asked David" is not the same as "Miriam said David said".
  - A pause is not an ending.
  - Closed cases are kept, so an old idea isn't suggested again blindly.
- Its ledger line reads very well.

**Wrong**

- It's a mockup of one hard-coded shidduch.
  - It has no rules for how an event gets its links and its status.
  - It has no real data and no import.
- It has no answer for:
  - one message about several shidduchim
  - work that isn't a shidduch (my profile to 100 shadchanim)
- It proposes combining four views (Today + Case + Ledger + People). That risks too many screens
  and mixed stuff.
- Follow-ups as their own object risk a second reminder system.
- The "profile package" is an extra object, and there are 34 technical event types.
- The look uses big cards, counters and uppercase labels, which you rejected.

---

## 5. The building blocks

Every design needs these things. The three architectures differ in **which ones are stored,
which are worked out, and where the story lives**.

| Thing | In plain words |
|---|---|
| **Person** | one human (or a group or a site): a single, a shadchan, a mother, a reference, a friend, me |
| **Link** | how two people are connected: mother of, contact for, reference for, shadchan for, referred by, friend |
| **Shidduch** | one pairing: a guy and a girl (one of them may be me) |
| **Entry** | one thing that happened: a message, a call, a meeting, a note, a decision. One line in History. |
| **Date** | one meeting of the couple: when, where, what each side said |
| **Open item** | something someone owes someone: an answer, a call, a photo |
| **Profile version** | a frozen copy of a profile, as it was at that moment |
| **File** | a photo, PDF or recording, stored once |
| Intake, folder, memo | already decided: raw captures, labels on people, notes to myself |

Two words used below:

- A **go-between** is whoever passes messages for one side: a shadchan, a parent, a sibling, or me.
- **Worked out** means the app calculates it from what's stored. Nobody types it.

---

## 6. Three competing architectures

### A · People first: "the address book that remembers"

**The idea.** The person is the center, as in PeerMatch.

- Each History entry is stored once and shows on every person it involves.
- A shidduch is a small record that ties two people together.

**Stored**

- **Person:** all the facts, plus process fields you set by hand:
  - Waiting on/off, and since when
  - Call due
  - available / dating / engaged
- **Link** between two people.
- **Entry:** linked to people, and optionally tagged with a shidduch.
- **Shidduch:** guy, girl, who suggested it, his answer, her answer, how it ended.
- Files.

**Worked out:** a shidduch's story is the set of entries tagged with it.

**Where you write:** on a person's page (the note bar, the after-call popup, buttons).

**Screens:** Home, the lists, the person page, and a thin shidduch page.

**Closest to:** ZivugBase's engine, or PeerMatch with a shared History.

**Strengths**

- Closest to what you use every day, with the fewest new ideas.
- The easiest PeerMatch import, and the quickest to build.

**Weaknesses**

- **The status and the story live apart.** The answer is a field; the message is an entry.
  Delete the message that said "yes" and the "yes" stays.
- **There is one Waiting switch per person.** On Aug 10, Miriam owed me Leah's answer *and* I
  owed her my newest profile. A can show only one yellow button.
- **Dates and each side's feedback are notes**, so the app can't list them.
- An entry written on Miriam's page reaches Leah's shidduch only if I remember to tag it.
- There's no place for "who told me" versus "whose words".

### B · A file per shidduch: "case files"

**The idea.** Like a lawyer's case file or a patient's chart. Each shidduch is a file, and
everything about it goes inside. People are a phone book.

**Stored**

- **Person:** facts only.
- **Shidduch file:**
  - the two people
  - who's who in it: who suggested it, her shadchan, her mother, references, friends asked
  - the stage, his answer and her answer
  - the dates, each with its time, place and both sides' feedback
  - the next step, and who we're waiting on
- **Conversation file:** for whatever isn't about one shidduch (my profile to Miriam, Rivka's
  requests).
- **Entry:** belongs to exactly **one** file.
- Files and profile versions.

**Worked out:** a person's page lists their files.

**Where you write:** inside a file. Capture asks "which file?".

**Screens:** Home, the lists, the person page, the shidduch file, the conversation file, and a
list of files.

**Closest to:** testmatch's Case File, and shadchan software such as ZivugTech or Shadchan Pro.

**Strengths**

- The clearest picture of one shidduch.
- Dates and both sides are proper records, with one next step per file.

**Weaknesses**

- **Each entry has one home.** Rivka's message about three things must be cut up or copied.
- **Work that isn't a shidduch** (my profile to 100 shadchanim) needs a second kind of file,
  which means more screens.
- **Miriam's conversation ends up in pieces,** split across many files.
- **PeerMatch's History has no files.** Most of it lands in conversation files, and the old
  shidduchim look empty.
- Merging two files (the same girl filed twice) is messy.

### C · One ledger: "the bank statement"

**The idea.** A bank statement has one line per thing that happened. The balance is worked out
from the lines, never typed.

- Here, each **entry** is one line, written once.
- The statuses are the balances.
- Every page is a view of the same lines.

**Stored**

- **Entry**, and only entries. Each entry holds:
  - when it happened
  - from → to, and who passed it on
  - the channel
  - the exact words, files and profile version
  - **about:** any number of people and shidduchim
  - **what it changes:** "her side: yes", "date 2 happened", "I owe Miriam my profile", "her age:
    34", "new phone number"
- A person or a shidduch is only a name that entries point to. All their facts (age, phone,
  profile) are entries too.
- Files.

**Worked out:** everything else.

- Each shidduch's stage, both sides' answers, its dates and feedback, and who suggested it.
- Who's waiting on whom, and who has which version.
- Where each person came from, their last contact, and even their current facts.

**Where you write:** anywhere: the note bar, the after-call popup, sending, filing from Intake.
The page you're on fills in "about".

**Screens:** Home, the lists, the person page, and the shidduch page.

**Closest to:** testmatch's Ledger, taken all the way.

**Strengths**

- **Written once, shown everywhere.** There are never copies.
- **Every status shows its source.** Tap "her side: yes" and you see Miriam's message.
- **One message can update three shidduchim.**
- **Waiting says on whom and about what.**
- **Versions answer themselves:** each send points to one.

**Weaknesses**

- **If you only type free notes, statuses don't move.** The app must offer each change as one
  tap at the right moment.
- Working out statuses needs a small, well-tested engine, plus a saved summary for speed.
- **Even a checkbox becomes an entry.** The person page must work out every fact from many lines.
- **A shidduch is only a tag**, and nothing stops two tags for the same pair.

---

## 7. One complicated shidduch, stored three ways

**Leah**, my own shidduch (all made up). It has:

- two shadchanim
- a relay through her mother
- a friend's opinion, and references
- three dates, one of them moved
- a pause and an ending
- the same girl suggested again later

### What happened

1. **Aug 3:** Miriam sends me Leah's profile on WhatsApp, as a PDF and a photo. Her mother Rachel
   is the contact; Rabbi Yosef is a reference.
2. **Aug 4:** I send the PDF to my friend Moshe: "What do you think?"
3. **Aug 5:** Moshe calls: "Sounds good. Ask if she'd move."
4. **Aug 6:** I call Rabbi Yosef. He's very positive.
5. **Aug 9:** I tell Miriam: "Yes, interested. Would she consider Tzfat?"
6. **Aug 10:** Miriam: "I sent your profile to her mother. Send me your newest one." (She had my
   Hebrew v2 from June.)
7. **Aug 10:** I send Miriam my English v3 and photo 2.
8. **Aug 12:** My reference Avi: "Someone from her side called me about you."
9. **Aug 16:** Miriam: "She says yes. Her mother asks if you'd live in Jerusalem."
10. **Aug 16:** Me: "Open to Jerusalem for the right person."
11. **Aug 17:** Miriam: "Date 1: Wednesday Aug 19, 7:30, hotel lobby."
12. **Aug 18:** Miriam: "She asks to move it to Thursday Aug 20, 8:00."
13. **Aug 20:** Date 1. My note: "Easy to talk to; quiet at first."
14. **Aug 21:** I call Miriam: "It went well, I'd like to continue."
15. **Aug 23:** Miriam: "She's thinking."
16. **Aug 24:** Miriam: "She'd like a second date. Here's her number."
17. **Aug 27:** Date 2, which we set up directly. **Sep 2:** Date 3.
18. **Sep 3:** Rivka sends: "I have an idea for you: Leah, 35, Jerusalem…" It's the same Leah, but
    her text says 35. I reply: "Thanks, we're already in touch."
19. **Sep 8:** Miriam: "She asks for a break until after Yom Kippur."
20. **Sep 23:** Miriam calls: "She decided not to continue; the hashkafa gap." I thank her.
21. **A year later:** Chana suggests Leah again.

### In C: the same story, as entries

```
Aug 3   Miriam → Me · WhatsApp
        Leah's profile: PDF + photo
        New people: Leah; Rachel (her
        mother); Rabbi Yosef (reference)
        Idea for me: Me ↔ Leah
        (not a shidduch yet)
        Opens: waiting on me, answer
        Miriam

Aug 4   Me → Moshe · WhatsApp
        Leah's PDF (version 1)
        "What do you think?"
        Opens: waiting on Moshe

Aug 5   Moshe → Me · call
        "Sounds good. Ask if she'd move."
        Closes: waiting on Moshe

Aug 6   Me → Rabbi Yosef · call
        "Kind, serious, good family."

Aug 9   Me → Miriam · WhatsApp
        "Yes, interested. Would she
        consider Tzfat?"
        Interested: Shidduch Me ↔ Leah
        starts; the Aug 3 and Aug 4
        entries are linked to it
        My side: Yes
        Closes: my answer
        Opens: waiting on Miriam
               for her side

Aug 10  Miriam → Me · WhatsApp
        "I sent your profile to her
        mother. Send me your newest."
        Her side: thinking
        Passed on: my profile → Rachel
        Opens: I owe Miriam my newest

Aug 10  Me → Miriam · WhatsApp
        My profile, English v3
        + photo 2
        Closes: my newest profile

Aug 12  Avi → Me · call
        "Her side called me about you."

Aug 16  Miriam → Me · WhatsApp
        "She says yes. Her mother asks:
        would you live in Jerusalem?"
        Her side: Yes
          (her mother's words)
        Closes: waiting for her side
        Opens: I owe Miriam an answer

Aug 16  Me → Miriam · WhatsApp
        "Open to Jerusalem for the
        right person."
        Closes: that answer

Aug 17  Miriam → Me · WhatsApp
        Date 1 set: Wed Aug 19, 7:30,
        hotel lobby

Aug 18  Miriam → Me · WhatsApp
        Date 1 moved: Thu Aug 20, 8:00
        (her side asked)

Aug 20  Date 1 happened. My note:
        "Easy to talk to; quiet at
        first."
        Opens: I owe Miriam my feedback
               waiting on Miriam for hers

Aug 21  Me → Miriam · call
        "It went well. I'd like to
        continue."
        Date 1, my side: continue
        Closes: my feedback

Aug 23  Miriam → Me · WhatsApp
        "She's thinking."
        Date 1, her side: unsure
        (the wait stays open)

Aug 24  Miriam → Me · WhatsApp
        "She'd like a second date.
        Here's her number."
        Date 1, her side: continue
        Closes: waiting for hers
        Adds: Leah's own phone

Aug 27  Date 2 · Sep 2  Date 3
        (set up directly)

Sep 3   Rivka → Me · WhatsApp
        "An idea for you: Leah, 35,
        Jerusalem…"
        Same Leah → joins this shidduch
        Also suggested by: Rivka
        Profile version 2 (says 35)
Sep 3   Me → Rivka · WhatsApp
        "Thanks, we're already in
        touch."

Sep 8   Miriam → Me · WhatsApp
        "She asks for a break until
        after Yom Kippur."
        Paused until Sep 22 (her side)

Sep 23  Miriam → Me · call
        "She won't continue: the
        hashkafa gap."
        Ended · by her · why: hashkafa
        Closes: everything open
Sep 23  Me → Miriam · WhatsApp
        "Thank you for everything."
```

A year later, when Chana suggests Leah, the app says at once:

```
Leah is already here:
  Suggested by Miriam, Aug 3
  3 dates; she ended it
  (hashkafa) on Sep 23
```

### In A: where the same story lands

- All the entries land on people: Miriam, Leah, me, Moshe, Rabbi Yosef, Avi and Rivka. Tagging
  each one with the shidduch is up to me.
- The shidduch record holds: suggested by Miriam · me: yes · her: yes · ended by her (hashkafa).
- On Aug 23, "who is waiting on whom?" Miriam's Waiting button is yellow, but the app can't say
  for what.
- "What happened on date 1?" I have to find the note. That date 1 was moved shows only inside
  Miriam's messages.
- Rivka's message lands on Rivka. It joins Leah's story only if I tag it.

### In B: where the same story lands

- Most entries go into the "Me ↔ Leah" file.
- Entry 7 (my v3 to Miriam) belongs both in Leah's file and in my "Me ↔ Miriam" file. I have to
  pick one.
- Entry 18 (Rivka's message) goes into Leah's file or into Rivka's conversation file. Again, only
  one.
- Dates 1 to 3 are proper records, with feedback. That's good.
- On Miriam's page, her messages are split across several files.

### The 12 questions, asked on Aug 23

| Question | A | B | C |
|---|---|---|---|
| Who contacted whom? | yes | split across files | yes |
| Who introduced Leah? | Miriam | Miriam | Miriam on Aug 3, by WhatsApp, with the PDF |
| What did I send Moshe? | yes | yes | the PDF, version 1, with my words |
| Which version does Miriam have? | only if tagged | in her conversation file | English v3 + photo 2, Aug 10 |
| When was it sent? | yes | yes | yes |
| What reply came back? | find it | in the file | linked: Moshe's call answers my Aug 4 message |
| Who's waiting on whom? | "Miriam", but for what? | Leah file: Miriam | waiting on Miriam for Leah's feedback, 3 days |
| What happened on date 1? | a note | a record | Aug 20 (moved from Aug 19 by her side), hotel lobby |
| What did each side say? | notes | yes | me: continue (told Miriam Aug 21) · her: unsure (Miriam, Aug 23) |
| What did I tell Miriam? | mixed into her History | split | Aug 9, Aug 16, Aug 21, in my exact words |
| Next action? | unclear | Leah file: wait | wait for Miriam; I owe nothing |
| The whole story? | only if every entry was tagged | only if every entry was filed | entries 1 to 15, in order |

---

## 8. Stress tests

Each test is a real situation. "Good" means the app answers it without extra work from you.

| # | Test | A | B | C |
|---|---|---|---|---|
| 1 | One message, four topics | partly | poor | good |
| 2 | One call, three shidduchim | partly | poor | good |
| 3 | A relay chain: whose words? | poor | partly | good |
| 4 | The same girl from two shadchanim | partly | partly | partly |
| 5 | Which version and which photo went to whom | partly | partly | good |
| 6 | 14 new shadchanim, one follow-up | good | poor | good |
| 7 | Busy: three ideas wait | poor | good | good |
| 8 | A date moved twice; both sides' feedback | poor | good | good |
| 9 | Helping a friend, with two shadchanim | poor | good | good |
| 10 | An ending, and reuse years later | partly | good | good |
| 11 | Engaged: close everything, tell everyone | partly | partly | good |
| 12 | Mistakes: the wrong shidduch, a duplicate | good | partly | good |
| 13 | PeerMatch import: nothing lost | good | poor | good |
| 14 | About her, or about the shidduch? | partly | partly | good |
| 15 | Fixing a phone number or an age | good | good | partly |
| | **Good** | **4** | **5** | **13** |

**The recommendation (C, plus a real shidduch record from B and directly edited facts from A)
is good on all 15.** Tests 4 and 15 are why those two things are borrowed.

### The tests

**1. One message, four topics.** Rivka writes:

> 1) Shira's sister says she isn't ready yet, maybe after the holidays.
> 2) A new girl for you: Tova, 31, Bnei Brak (PDF attached).
> 3) Did you send me your new profile?
> 4) Do you know a guy for my niece Noa, 26?

- **A:** The message goes on Rivka, and I can link it to Shira and Tova. The app can't hold "I owe
  Rivka two things".
- **B:** It must be cut into four entries in four files, so the original message no longer exists
  in one piece.
- **C:** It stays **one entry**, with four changes:
  - Shira: her side "not now"; ask again Oct 5
  - a new shidduch, Me ↔ Tova
  - I owe Rivka my newest profile
  - a new girl, Noa (Rivka's niece), and I owe Rivka a guy for her

  Each page shows the same entry, with its own part marked.

**2. One call, three shidduchim.** After a call, Miriam has given me three things: feedback on
Leah's date, a no from Shira's side, and a request for my parents' names.

- **C** saves one note with three changes.
- **B** needs three notes.
- **A** needs one note and three manual updates.

**3. A relay chain.** "Her mother told Miriam she wants someone who learns more."

- **A** stores the words on Miriam.
- **B** stores them in the file.
- **Only C** records, on the entry that changes her side:
  - **who told me** (Miriam)
  - **whose words** they are (her mother)

**4. The same girl from two shadchanim.** Rivka suggests Leah while I'm already dating her
through Miriam.

- The rule needed is **one shidduch per pair, for good**. Rivka's suggestion then joins the
  existing story, with a warning: "already dating, through Miriam".
- The two profile versions are kept side by side ("Rivka's says 35").
- Pure C has no shidduch record, only tags, so nothing stops a second tag for the same pair.
  That's why the recommendation borrows B's real shidduch record.

**5. Which version, which photo.** "Which photo did I send Chana?"

- **C:** Every send points to the exact version and files. Chana's History shows: "Sep 10 · Me →
  Chana · my profile, Hebrew v3 + photo 2".
- **A:** Only if each entry kept them.
- **B:** Only inside the right file.

**6. 14 new shadchanim.** On Sep 1, Batya sends 14 contacts: "write to each one; call after Yom
Tov if they don't answer." That's 14 sends, one tap each.

- **C:**
  - Each send opens "waiting on X for a reply, follow up Oct 5".
  - Each reply closes its own item.
  - On Oct 5, Home shows "No reply from 9: call them".
- **A:** Does this well with Waiting switches, because each shadchan has only one thing pending.
- **B:** Needs 14 conversation files.

**7. Busy.** While I'm dating Leah, three ideas arrive, and I tell each shadchan "I'm busy right
now".

- **C:** Each one opens "I owe X an answer, when Leah's shidduch ends". When it ends, Home shows "3
  ideas waited for you".
- **B:** Each file holds its own next step.
- **A:** There's one switch per shadchan, and the ideas themselves hold nothing.

**8. A date moved twice.**

- **C:** Each change is an entry. The date shows its final time and its history ("moved twice, by
  her side").
- **B:** It's a date record, but a move overwrites the time unless it's also logged.
- **A:** Only notes.

**9. Helping a friend, with two shadchanim.** I speak for Dovid; Rivka speaks for Noa.

- After date 1, three things are open at once:
  - Dovid owes me his feedback.
  - Rivka owes me Noa's feedback.
  - I owe Rivka Dovid's feedback.

  C shows all three. B shows them in the file. A can't show them.
- When Dovid stops, what I told Rivka ("he thinks highly of her") is kept exactly. His real
  reason stays private.

**10. An ending, and reuse.**

- A year later, Chana suggests Leah. C and B warn: "3 dates in 2026; she ended it (hashkafa)".
- Later, Leah might suit Dovid. That becomes a new shidduch, Dovid ↔ Leah, with its own story.
  Nothing from mine goes into what I send.

**11. Engaged.**

- **C:** One entry, "Engaged to Dina", does three things:
  - My other active shidduchim end ("I got engaged"), with Undo.
  - One to-do appears: "Tell the 38 shadchanim who have my profile".
  - The credit shows on the shidduch: suggested by Chana, through Miriam.
- **B:** Closes file by file.
- **A:** Statuses are set by hand.

**12. Mistakes.**

- **Filed under the wrong shidduch:**
  - C changes "about"; the words stay.
  - B moves the entry, which is fine.
  - A re-tags it.
- **Tova was added twice:** merge the two people.
  - C and A re-point the entries.
  - B must also merge two files.

**13. PeerMatch import.**

- **C:**
  - Every History entry becomes one entry; the two copies of a share become one.
  - Make match's three copies become one shidduch and one entry.
  - Waiting switches become open items "since …", and reminders become Calls due.
  - Nothing is lost, and nothing is invented.
- **A:** The same.
- **B:** The History has no file to go to.

**14. About her, or about the shidduch?** "Rabbi Yosef: she's very kind" is about Leah. "He thinks
it's a good match" is about the shidduch.

- **C:** One entry can be about either one, or both.
- **A and B:** Must choose one place.

**15. Fixing a phone number or an age.**

- **A and B:** Edit the field.
- **Pure C:** Every fix becomes a line in the story, and the page must work out each fact from many
  lines. That's why the recommendation borrows A's directly edited facts.

### Other things that matter

| | A | B | C |
|---|---|---|---|
| Kinds of screens | 5 | 7 | 5 |
| Taps to record a reply | fewest (but no status) | one more (pick a file) | as A, plus one tap for what changed |
| Status can disagree with the story | yes | sometimes | never |
| PeerMatch import | easy | hard | easy |
| Effort to build | low | high | medium |
| Easy to extend later | medium | low | high: a new kind of change is one small rule |

---

## 9. The chosen design in full: C, with a real shidduch and editable facts

### 9.1 What is stored: six things

1. **Person:** one per human, or a group or site. Me too.
   - Every PeerMatch field, plus what you approved from ZivugBase (age with its date, how well I
     know them, folders, and so on).
   - **Edited directly, as today.** *(Borrowed from A.)*
   - When the profile's text, PDF, photo or audio changes, the old one is kept as a profile
     version, automatically.
2. **Link:** between two people.
   - Kinds: family (mother, father, sister…), contact for (and how to reach them), reference for
     (and whether they know they're listed), shadchan for, referred by, friend, helper.
   - It can have a note ("what she says about him") and remembers the entry it came from.
3. **Shidduch:** one per pair (a guy and a girl), for good. One of them may be me. *(Borrowed from
   B.)*
   - Stored: the two people, and for each side, who speaks for it in this shidduch. That is filled
     in from the links, for example her shadchan, then her mother.
   - It is divided into **rounds**. Round 1 starts when the idea first arrives. A new suggestion
     after an ending starts Round 2, on the same record (9.5).
   - Everything else about it is worked out.
4. **Entry:** one thing that happened or was said.
   - **When** it happened: exact, the day only, approximate, or unknown. Also when it was recorded.
   - **From → to** (one or more people), who **passed it on**, and **whose words** they are when
     relayed.
   - **Channel:** WhatsApp · call · SMS · email · in person · note to myself · site.
   - **What:** the exact words (or my summary of a call), a recording, the files themselves, and
     the profile version.
   - **About:** any number of people and shidduchim.
   - **Changes:** optional, one tap each (see 9.4).
   - **Reply to:** the entry it answers (optional).
   - Received words and files are never changed. What the app understood from them (from, about,
     changes) can always be fixed.
5. **Profile version:** a frozen copy. It records whose profile it is, which language, the text,
   the files, when it was made, and where it came from.
6. **File:** a photo, PDF or recording, stored once and never changed. It knows the entry it
   arrived in, and every entry that sent it.

Rounds, dates and open items also get **permanent IDs** (9.2), but their state is worked out from
the entries.

### 9.2 Your list of objects, and where each one ended up

| You listed | In the chosen design |
|---|---|
| Person | Person |
| Shidduch / match case | Shidduch: a real record (the pair); its story is worked out |
| Activity / event | Entry |
| Profile package | not separate: the version and the files inside one send entry |
| Date | a permanent date ID; its state is worked out from the entries that point to that ID |
| Contact / relationship | Link |
| Task / follow-up | open item: a permanent ID, opened by one entry and closed by an entry that names the same ID |

Also not separate:

- An **Intake** item is an entry that isn't filed yet. Filing completes that same entry.
- A **memo** is a note entry shown on Home.
- A **folder** is a label on people, unchanged.

How they relate:

```
 Person ── link ── Person
   │
   ├── has ──> profile versions ──> files
   │
   └── one of the two in ──> Shidduch
                               ▲
 Entry ── about ───────────────┤
   │      (and about people)   │
   ├── from / to / passed on by: people
   ├── carries: words, files, a version
   ├── changes: sides, dates, stage
   └── opens / closes: open items
```

- A shidduch has exactly two people, and for each side, its go-betweens.
- An entry has:
  - one sender (or unknown) and one or more receivers
  - optionally, who passed it on and whose words they are
  - any number of files, versions, "about"s and changes
  - optionally, the entry it replies to
- A profile version belongs to one person. Entries bring it in or send it out.

#### Permanent IDs: rounds, dates and open items (decided)

A round's, a date's and an open item's current state is worked out from entries. Each one still
gets a **permanent ID** the moment it first appears, and every later entry points to it by that ID.

**Dates.** The first entry that sets up a date creates its ID. The record holds only the ID, the
shidduch, the round and the number ("Date 1"). After that, every entry that concerns the date
names that ID:

- set up, moved, moved again, cancelled, happened
- my feedback, her feedback, notes, the place

The app never decides which date an entry belongs to from the time order alone. When an entry
might concern a date, the app shows which one ("Moves: Date 1, Wed Aug 19"). If more than one date
is open, you pick it.

**Open items.** The entry that opens an item creates its ID. The record holds:

- the ID
- who owes whom
- what kind of thing is owed: an answer, an opinion, feedback on a date, a thing to send, a
  question, a call
- which shidduch, and which date, it's about

Some examples, each with its own ID:

- waiting on Miriam for Leah's feedback on Date 1
- waiting on Moshe for his opinion
- I owe Rivka my profile

**A reply closes the specific item it answers,** never "the latest waiting item".

- The app lists the open items that match who the reply is from, what it says, the shidduch and
  the date.
- It names the exact item it would close ("Closes: waiting on Miriam · Leah's feedback on Date 1").
- You confirm with Yes or No.
- The entry stores that item's ID.

Two items with the same person stay separate. On Aug 20, "I owe Miriam my feedback" and "waiting
on Miriam for hers" are both about Date 1, and each one closes only through its own ID.

**Rounds.** The entry that starts a round creates its ID. Every entry about the shidduch stores
which round it belongs to. That is set when the entry is written, not worked out later from dates.

### 9.3 What is worked out, never typed

- **For a shidduch:**
  - its stage
  - his side and her side: the latest answer, who said it, and when
  - who suggested it: all of them, with the first getting the credit
  - its dates: number, when, where, whether it happened, and both sides' feedback
  - its open items and next action
  - its last activity, and how it ended
- **For a person:**
  - where they came from
  - their shidduchim
  - the open items with them
  - their last contact
  - who has their profile: which version, and when
- **For me:** who has my profile, and which version.
- **For Home:** one Today list.

The results are saved as a summary for speed. Whenever an entry changes, the summary is rebuilt
from the entries. Nobody edits it by hand.

### 9.4 What an entry can change, and what opens and closes by itself

**The changes.** Each one is a single tap, offered where it happens.

- **A side's answer:** Not asked · Thinking · Has questions · Yes · Not now · No. After a date:
  Continue · Unsure · Stop.
- **The shidduch:** suggested · paused until … · ended (by whom, why) · reopened · engaged.
- **A date:** set (when, where, arranged by) · moved · happened · cancelled.
- **Open items:** opens one, or closes one.
- **People:**
  - brings in a new person
  - adds a link ("Rachel is Leah's mother")
  - "passed on to …"

**Open items that open by themselves.** They are on, and they stay quiet (decided; see below).

| When this is recorded | This opens | It closes when |
|---|---|---|
| An idea for me arrives from X | I owe X my answer | I send X my answer |
| I suggest a shidduch to X | Waiting on X for their side | X's answer comes in |
| I send X a profile and ask their opinion | Waiting on X | X replies about it |
| X asks me for something (a photo, references, a question) | I owe X that thing | I send it |
| A date happened | I owe the go-between my feedback, and I'm waiting on them for the other side's | each one comes in |
| My side decides (yes, no, continue, stop), but not in a message to the go-between | I owe the go-between: tell them | I tell them |
| Call due (today, tomorrow, a date) | I owe X a call | a call to X |
| The Waiting button | Waiting on X | the button, or X's next message |
| "Not now, try in a month" | Ask again on that date | when I ask |
| A shidduch ends or pauses | nothing | its open items close, with Undo |

**Nothing ever tells you to chase a single.** Open items point at the go-between (a shadchan or a
contact person), or at your own answers.

**Quiet (decided).** Automatic items are on, but they never nag.

- No reminders, no popups, no badges that demand attention.
- Home simply lists what is outstanding: what you're waiting on, and what you owe.
- The only questions are the one-tap choices inside a flow you started yourself. For example,
  after you paste Miriam's message the app asks "Her side: Yes?".
- You never have to keep a task list up to date by hand.

**The Waiting button stays, as a manual override** for unusual cases.

- On a person's page it turns yellow when anything is waiting on that person.
- Tapping it lists those items. "Got it" closes one by hand; that close is recorded as an entry
  that names the item's ID.
- "Add" opens a waiting item by hand: what you're waiting for, and optionally which shidduch.

### 9.5 The stages, in plain words (worked out)

New idea → Checking → Waiting for her side (or his) → Setting up date 1 → Dating, after date N →
Paused until … → Ended (by whom, why), or Engaged

*Decided later: "New idea" is now an **idea**, recorded before any shidduch exists. A shidduch starts at "Interested" (`ARCHITECTURE.md` 5.2).*

- "Thinking" and "unsure" keep the wait open.
- "Yes" and "continue" move it on.
- "No" and "stop" end it.
- "Not now" pauses it.

**Rounds (decided).** There is one permanent record per pair. A suggestion that comes after the
shidduch ended reopens it as a new round:

```
Me ↔ Leah
  Round 2 · 2028 · suggested by Chana
    active
  Round 1 · 2026 · 3 dates
    ended by her (hashkafa)
```

- The current round is on top, and its stage, statuses, dates and open items cover only that round.
- Dates are numbered within their round: Round 2 starts again at Date 1.
- The old rounds stay visible below, clearly separated, and fold away with one tap.
- A suggestion while the shidduch is still active does not start a round. It joins the current
  round as "also suggested by …".

### 9.6 The ten rules that keep information together

1. **Write once, show everywhere.** One entry shows on every page it concerns.
2. **Every status shows its source.** Tap "her side: yes" and you see Miriam's message of Aug 16.
3. **The original is never changed.** Words and files stay as they came. Only the app's reading of
   them can be fixed.
4. **The page you're on decides "about".** Write on Leah's shidduch, and the entry is about it.
   When the app can't tell, the entry stays in Intake.
5. **One shidduch per pair, for good.** A later suggestion reopens it as round 2, with the whole
   past visible.
6. **Waiting always says on whom, and about what.**
7. **A sent version is frozen.** Editing a profile makes a new version. What was sent stays
   exactly what was sent.
8. **No invented dates.** An entry pasted without a time says "pasted Oct 4", until you set the
   real time.
9. **Permanent IDs.** Rounds, dates and open items are always referred to by their ID, never
   guessed from the order things happened in.
10. **The ledger stays out of sight.** You see statuses, dates and History lines. The entries,
    changes and IDs are underneath, and you only need them for checking.

### 9.7 The screens (rough sketches, not the design)

**Home**, on a made-up morning in single mode: My profile (approved), then one Today list. *(Superseded: **Recent** replaces Home; see `ARCHITECTURE.md` section 9.)*

```
My profile · sent to 38 shadchanim
  26 have an older version ›
Today
 Waiting on Miriam · Leah's
   feedback after date 1 · 3 days
 I owe Rivka · my newest profile
 Call Batya · today
 No reply from 9 shadchanim
   to my profile ›
 Dina · date 1 · Thu 8:00
Memos · Recently added · Backup
```

**The shidduch page**, on Aug 23. The first tab shows only what you asked for:

- the pair and the current stage
- my status and her status
- what I'm waiting on
- the next action
- a summary of the dates
- recent History

```
‹  Me ↔ Leah                  ב״ה
   Dating · after Date 1
 Overview · Dates · History · People
 My status   Continue (Date 1)
 Her status  Unsure (Date 1)
             via Miriam, Aug 23
 Waiting on  Miriam · her feedback
             on Date 1 · 3 days
 Next        Nothing to do: wait
             for Miriam
 Dates       1 · Thu Aug 20 · lobby ›
 Recent
   Aug 23  Miriam: "She's thinking."
   Aug 21  Me → Miriam: "It went…"
 Through Miriam → Rachel (mother)
   Call · Email · WhatsApp · SMS
 [ Note…                    (mic) ]
```

Everything deeper is one tap away:

- **Dates:** each date taps through to everything that points to its ID: set up, moved, happened,
  both sides' feedback, notes.
- **History:** the full story, by round.
- **People:** who suggested it, the go-betweens, the friends asked, the references.
- The ledger itself, with its IDs, is never on these pages.

**Leah's person page** is PeerMatch's page as it is, plus one line under the header:

```
 Shidduch with me: dating ›
```

**Miriam's page** is PeerMatch's shadchan page, plus one line:

```
 Waiting on her: 1 · I owe her: 0
   · shidduchim: 2 ›
```

Who has which profile, and which version, is always recorded. It shows in History (each send
names its version) and on Home's My profile line. It is not a section, because you rejected that
section.

**Filing Rivka's message** from Intake (test 1):

```
Rivka → Me · WhatsApp · Aug 31
"1) Shira's sister says… 2) Tova…"

 Shira: her side "not now",
   ask again Oct 5?    [Yes] [No]
 Tova: new idea for me? [Yes] [No]
 I owe Rivka my newest
   profile?            [Yes] [No]
 Noa: new girl, Rivka's niece;
   I owe Rivka a guy?  [Yes] [No]
            [Save]  [Later]
```

**After a call:**

```
Call ended — add a status update?
 Miriam
 About: Leah · Shira · other
 [ Note…                  (mic) ]
 Leah, her side: Yes · No ·
   Thinking · Not now
 Was it answered?  [Yes] [No]
            [Save]  [Skip]
```

### 9.8 Everyday flows

**An idea arrives on WhatsApp.** 4 taps.

- You do: Copy → Paste → "Idea for me" → Who sent it (recognized) → Save.
- The app records:
  - Leah and her links
  - profile version 1
  - the shidduch, with one entry
  - "I owe Miriam my answer"

**Ask a friend.** 4 taps.

- You do: Leah's page → Share → Moshe → "Ask opinion" → send.
- The app records one entry with the exact version, and opens "Waiting on Moshe".

**The answer comes back.** 3 taps.

- You do: Paste → "About Leah? Yes" → "Her side: Yes".
- The app records the entry and her side's Yes, with its source. The wait closes, and the next
  step becomes "set up date 1".

**A date.** 4 to 5 taps.

- You do: Add date → time and place → afterwards, "Did it happen? Yes" → Continue.
- The app records the date, your side's feedback, and "tell Miriam".

**A call.** 2 to 3 taps.

- You do: hang up → the popup opens, with "About" already chosen → note → Save.
- The app records the call, about the right shidduch.

**The end.** 3 taps.

- You do: "Ended" → by her → why.
- The app marks it ended, closes its open items (with Undo), and will warn about it in the future.

### 9.9 How PeerMatch data comes in: nothing lost, nothing invented

| PeerMatch | Becomes |
|---|---|
| guys, girls, shadchanim | one person per human, with the original record kept untouched |
| name, age, text, every field | the same facts; the text and attachment become profile version 1 |
| photo, PDF and audio fields | files |
| contact 1 and 2, `source…`, the sender fields | people, with "contact for" links |
| `linkedShadchan…` | a "shadchan for" link |
| `referredBy` | a "referred by" link |
| activities | entries, with the time read from the old text, or "unknown" if it can't be read |
| the two copies of a share | one entry |
| Make match's three copies | one shidduch and one entry |
| `waitingForReply` (and since when) | an open item "waiting on …", since that time |
| `callReminderDate` | a Call due on that day |
| `createdAt` | the added date, only when it's real |
| anything unknown | kept in the untouched copy |

### 9.10 How your approved features fit

| Approved | In this logic |
|---|---|
| Folders, zoom, Add to… | labels on people, unchanged |
| Intake folder | entries not filed yet; filing completes them |
| Who sent it? · What is it? | the entry's "from", and what filing creates |
| Calls due for anyone | an open item: "I owe X a call" |
| Memos | note entries shown on Home |
| Home: recently added, backup, My profile and who has it | worked out from people and entries |
| Suggested to me (Yes / No) | an **idea** for me: open, not applicable, or interested (which creates the shidduch). See `ARCHITECTURE.md` 5.2 |
| The Ideas for me folder | Girls → For me, and Shidduchim → Ideas |
| Shidduchim in shadchan mode (decided) | shown next to Guys and Girls, but it's a view generated from the shidduch records, not a folder of people |
| Modes, I am | the same data; only which lists show changes |
| Phones, email, age, looking for, how well I know them… | person facts |

### 9.11 Risks, and how they're handled

- **Statuses move only if the changes are recorded.**
  - Each change is one tap, offered where it happens: after a paste, after a call, after a date.
  - The top line shows "last update: Aug 23", so a stale status is easy to see.
- **The app guesses wrong.** Nothing changes without your tap, and every change has Undo.
- **Too many small entries** (a button pressed, a reminder set). They're shown small and gray, or
  only in the full History.
- **A busy shadchan's History gets long.** One tap narrows it to one shidduch.
- **Speed on the phone.** Summaries are saved, not recalculated on every screen.

### 9.12 Notes for the builder

- **One owner for each of these, and nothing else writes entries or statuses:**
  - writing entries
  - working out summaries
  - the share flow
  - the contact buttons
  - the after-call popup
  - filing from Intake
- Entries and summaries are separate tables. Summaries can always be rebuilt from the entries,
  after a restore or an import.
- Deleting an entry is a soft delete, with Undo. Its changes disappear from the summaries, and come
  back with Undo.
- **Tests:**
  - Each kind of change is one small rule, with its own tests.
  - The Leah story in section 7 is an end-to-end test. The 12 questions must give the answers in
    column C of the table there.
- **Backups** hold people, links, shidduchim, entries, versions and files. Summaries are rebuilt
  after a restore. PeerMatch ZIP and TXT backups come in as shown in 9.9.

---

## 10. Conflicts I found

1. **You rejected ZivugBase's Ideas, "Profile shared" and "Where they came from" sections, and its
   "Where things stand" sheet.** Now you're asking for shidduch cases, "which version was sent"
   and "who is waiting on whom".
   - Shidduchim get their own page. A person page gets one line about them, not a section.
   - Sends and versions are recorded, but shown only in History and on Home's My profile line,
     which you approved.
   - "Where they came from" is only the "From Miriam" line that PeerMatch already shows. It's
     filled in by "Who sent it?", which you approved.
   - There are no extra sheets.
2. **PeerMatch says: don't nag me to chase singles; reminders are for shadchanim only.** Later you
   approved Calls due on anyone.
   - Automatic open items point only at go-betweens, and at your own answers.
   - You can turn each kind off (question 2).
3. **testmatch suggests combining four views.** CLAUDE.md warns against mixed and extra screens.
   - There is one ledger, with only Home, the lists, the person page and the shidduch page.
4. **PeerMatch, and zugmatch on purpose, keep two copies of a share.** The rule is one History.
   - The import joins the two copies into one entry.
5. **"Waiting" means two things in PeerMatch:** the button, and the last message.
   - It now has one meaning: an open item.
6. **ENGINE_NOTES puts `nextStep` and `waitingSince` on the person.**
   - Open items replace both fields. The buttons stay.
7. **"Suggested to me" and the "Ideas for me" folder are approved.**
   - Decided later: they are **ideas** for me, which come before any shidduch (`ARCHITECTURE.md`
     5.2).

---

## 11. Decisions (answered by the owner, 2026-10-04)

1. **Architecture C: yes.** One ledger is the source of truth. An event is written once and
   appears everywhere it belongs, with two changes:
   - a person's facts (phone, age, checkboxes and so on) stay directly editable
   - every pair gets one real Shidduch record, with its own page
2. **Automatic waiting and to-dos: yes, and quiet** (9.4).
   - The app knows by itself when:
     - I sent a profile asking for an opinion: I'm waiting on that person
     - a date happened: feedback is outstanding
     - someone asked me for a photo or an answer: I owe them
   - There is no CRM task system to keep up by hand, and no nagging reminders or popups. Home
     simply shows what is outstanding.
   - The manual Waiting button stays, as an override for unusual cases.
3. **Shidduchim in shadchan mode: yes.** It appears next to Guys and Girls, but it is a view
   generated from the Shidduch records, not a normal folder of people.
4. **An ended shidduch suggested again: reopen it as Round 2** (9.5). There is one permanent
   record per pair. The old History stays visible, and the new round is clearly separated.
5. **A clickable prototype: yes**, before any real programming (section 12).
   - It has made-up data and is phone-friendly.
   - It must let the owner walk through a realistic, complicated workflow, not just look at
     static screens.

The owner also set one UI rule and two data rules:

- **The ledger stays mostly invisible.** The shidduch page shows the pair, the stage, my status,
  her status, what I'm waiting on, the next action, a date summary and recent History. Everything
  deeper is behind tabs or tap-through screens (9.7).
- **Every date has a permanent ID** (9.2). Every entry about a date points to that ID: set up,
  moved, moved again, cancelled, happened, both sides' feedback, notes and the place. Nothing is
  matched to a date by time order alone.
- **Every open item has a permanent ID** (9.2). A reply closes the exact item it answers, never
  just "the latest waiting item".

## 12. The clickable prototype

**Replaced.** Version 2, built from `ARCHITECTURE.md` section 13, is now at the same path. The text below describes version 1. The owner found it not good enough yet. It is out of date with `ARCHITECTURE.md`: it has a Home tab, uses "You owe", and creates a shidduch when a profile arrives. `ARCHITECTURE.md` section 13 defines the next prototype.

`prototype/shidduch-flow.html` is one self-contained page with made-up data. It loads nothing
from other sites, so it works offline and behind NetSpark. It is **not** the production app:
nothing is saved beyond the phone's browser, and nothing is ever sent.

**What it proves.** The whole model runs underneath: the ledger, the permanent IDs, the worked-out
statuses, the quiet open items. On screen it should still feel like a few simple pages.

**The story it walks through.** A small guide bar at the top shows the next step. Steps that
happen outside the app have a **Make it happen** button: a message arriving from Miriam, or
Moshe calling back. Steps that you do yourself just say what to do. Every step also has **Do it
for me**, in case you get stuck.

1. Leah's profile arrives (shared from WhatsApp into the Intake folder).
2. File it: an idea for me, and who sent it (Miriam).
3. Ask my friend Moshe for his opinion.
4. Moshe calls back with his opinion.
5. Tell Miriam: yes, I'm interested.
6. Wait for her side. Miriam writes that the mother is looking into it, and asks for my newest
   profile.
7. Send Miriam my newest profile. This closes only that item; the wait for her side stays open.
8. Her side says yes.
9. Miriam sets Date 1.
10. Date 1 is moved.
11. Date 1 happens.
12. Record my feedback, and tell Miriam.
13. Wait for her feedback: "she's thinking" keeps the wait open.
14. Her feedback comes back: she'd like a second date.
15. Set up Date 2.

After that, five optional extra steps continue the story:

- Rivka suggests the same Leah. zugbase sees she is already here, and the suggestion joins the
  current round.
- Date 2 happens.
- A pause: open items close, and one quiet check-in waits for the date.
- Round 1 ends: who ended it, and why.
- A year later, Chana suggests Leah again, and Round 2 opens on the same record. Round 1 stays
  visible below it.

**What is simulated.** A message "arriving" is placed in the Intake folder, as a WhatsApp share
would be. A call "ending" opens the after-call popup. Sending only records the entry; the
prototype never opens WhatsApp. The made-up clock moves forward with each step, so "waiting
3 days" and "did Date 1 happen?" appear at the right moments.

**Checked before publishing.** The whole story was run by an automated test at phone width, with
real taps on real buttons:

- Every step completed, and every open item was closed by the entry that answers it. Sending the
  profile closed only "I owe Miriam my newest profile". "She's thinking" left the wait open, and
  "she'd like a second date" closed it.
- Date 1's page lists every entry that points to its ID: set up, moved, happened, my feedback,
  what I told Miriam, "unsure", "continue".
- Undo, reloading the page halfway, and "Do it for me" on every step all worked, with no errors.

Progress is saved only in that phone's browser. "Start over" in the story sheet resets it, with
Undo.

**Behind the scenes.** A separate screen, reached from the guide, shows the raw ledger:

- every entry, with its changes
- every date, with its ID and the entries that point to it
- every open item, with its ID, the entry that opened it and the entry that closed it

It's there for checking the model, not for daily use.
