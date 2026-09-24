# ZivugBase / PeerMatch — ChatGPT Handoff

*Written by the owner with ChatGPT and added here unchanged. **Where it disagrees with
`CLAUDE.md` in this repository, `CLAUDE.md` wins.** In particular, `CLAUDE.md` explains how
"do not start over" applies to this repository: new code, but the same requirements and
decisions. And unlike what this text says about not redesigning, the owner now wants to see
**what Sonnet designs on its own**, using the existing apps as benchmarks to check against.*

---

This project is an existing shidduch/contact-management app. It has already been developed substantially with ChatGPT and Claude/Opus. I am now moving development to Claude Sonnet 5.

## IMPORTANT — DO NOT START OVER

This is NOT a request to rebuild the application.
There are already existing implementations and a large amount of functionality. Preserve what is already working.
Before making major changes:

* Inspect the entire codebase.
* Read all existing project documentation, requirements, inventories, TODOs, notes, and comments.
* Look for files such as `REBUILD_INVENTORY.md`, `PROJECT_REQUIREMENTS.md`, or similar documentation.
* Understand the existing architecture and workflows.
* Treat the existing implementation and project documentation as the primary source of truth.
* Do not ask me to repeat requirements that can be determined from the project.

There are multiple versions because ChatGPT and Claude/Opus have both worked on the app. If multiple implementations are available, compare them rather than blindly replacing one with another.

## PROJECT DIRECTION

The project started as PeerMatch and has been moving toward the name/concept ZivugBase.
The basic purpose is a local/personal shidduch CRM/database for managing:

* boys/men
* girls/women
* shadchanim
* profiles
* relationships/connections
* referrals
* notes/memos
* match-making activity
* communication/contact information
* profile sharing
* backups/restores

It should feel like a practical personal CRM/database rather than a dating website.

## IMPORTANT PRODUCT PHILOSOPHY

This is an app for someone managing many people and potential shidduchim.
The UI should therefore be:

* simple
* clean
* compact
* practical
* easy to scan
* consistent
* professional
* not overly decorative
* not cluttered
* efficient for repeated daily use

Do NOT redesign the application simply because you personally prefer a different design.
I have already rejected UI work from some models because it did not feel good enough. For this reason, UI decisions should be based on the existing app, existing requirements, and actual workflow — not generic "modern AI UI" patterns.
Preserve UI that is already good.

## MODEL / DEVELOPMENT APPROACH

You are Claude Sonnet 5 and will now be the primary development model.
I chose Sonnet 5 specifically because I want strong coding/agentic work while also getting better UI results than I was getting from Opus.
Use Sonnet 5 for:

* feature development
* UI work
* normal debugging
* refactoring
* testing
* workflow improvements

Do not make unnecessary architectural rewrites.
For difficult problems, investigate the existing implementation thoroughly before changing architecture.

## EXISTING WORK FROM CHATGPT

The project has already gone through extensive development and decisions with ChatGPT.
Important areas that have been worked on include:

* overall PeerMatch/ZivugBase structure
* profiles for boys/girls
* shadchan management
* profile/contact workflows
* referrals and relationships
* notes/memos
* matching workflow
* folders/organization
* Add to... workflows
* Home workflow
* "I am" / current-user workflow
* Person/profile workflow
* WhatsApp-related workflows
* intake/capture workflows
* backup and restore
* ZIP-based backup containing photos/PDFs/audio/etc.
* fallback TXT/Base64 backup approach when ZIP sharing is blocked
* communication/contact links
* UI/navigation refinements
* many small workflow and usability decisions

These are NOT necessarily the complete current specification. Inspect the actual project and documentation to determine the current state.

## WHATSAPP / CAPTURE WORK

A major newer direction has involved capturing information from WhatsApp and turning it into usable profile/intake information.
There has been work around:

* WhatsApp links/contacting people
* capturing incoming information
* saving an idea/intake
* Intake
* converting intake information into a Person/profile
* using that information in the matching workflow

Do not assume the older PeerMatch workflow is the final design. The newer ZivugBase workflow may contain newer decisions.
Inspect the implementation and documentation carefully.

## BACKUP / RESTORE

One important previous decision:
The normal backup is a real ZIP containing the app's data and associated files such as:

* photos
* PDFs
* audio
* other profile attachments

There was also a workaround where the ZIP's binary bytes are converted to Base64 and stored inside a TXT file so that systems which block ZIP files can still transport the backup.
On restore, the Base64 TXT is decoded back into the original ZIP data and restored.
Do not break this functionality.

## GITHUB / VERSIONING

This version is intended to be a separate development version from the existing implementations.
The plan is to keep:

* the existing/reference version intact
* the new Sonnet development version separate

Do not overwrite or destroy the original/reference implementation.
Commit meaningful changes so that changes can be reviewed and reverted.

## HOW TO WORK

Before making large changes:

1. Inspect the project.
2. Find the existing documentation.
3. Understand the current architecture.
4. Understand the existing workflows.
5. Identify incomplete or broken features.
6. Identify requirements that are already implemented.
7. Identify requirements that still need work.
8. Give me a concise summary of what you found.

Then proceed incrementally.
When fixing something:

* make the smallest appropriate change
* preserve unrelated functionality
* test the affected workflow
* check for regressions
* do not "clean up" unrelated code unless necessary

When changing UI:

* inspect the current UI first
* preserve good existing design
* make changes consistent across the application
* avoid unnecessary large redesigns

## VERY IMPORTANT

Do not repeatedly ask me:
"What are all the requirements?"
The requirements are distributed across:

* the existing code
* project documentation
* inventory/requirements files
* existing workflows
* previous implementation decisions

Your first responsibility is to reconstruct the current intended application from those sources.
If something genuinely cannot be determined from the project, then ask me specifically about that one thing.

## FIRST TASK

Do NOT immediately start changing the application.
First inspect the entire project and report:

1. What the current application does.
2. The main screens/workflows.
3. The current architecture.
4. What appears complete.
5. What appears incomplete.
6. What documentation/requirements files you found.
7. Any conflicts you find between different implementations.
8. What you recommend using as the starting point.

After that, we can continue development from the existing application rather than rebuilding it.
