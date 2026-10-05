# REVIEW_FOR_AI â€” Mercieca Recruitment Desk v2
Audience: third-party AI reviewer. Shorthand intentional. No secrets in this file.
Date: 2026-10-05. Author: GitHub Copilot (Claude). Status: on branch review/v2-desk-for-third-party (main untouched). NOT deployed. NOT live for Frankie.

## 0. ASK
Review `index.html` (single file, ~1000 lines, vanilla JS, no deps, no backend) for: correctness, XSS/storage safety, a11y, UX for non-technical user, factual accuracy of embedded data. Report only material findings, ranked. Do not rewrite wholesale.

## 1. CONTEXT
- Client: Mercieca = PR + creative agency (FMCG focus, consumer/trade/corporate), Camden. NOT a recruiter. Low volume, quality > quantity.
- User: Frankie Mercieca (director). Non-technical. Language must be plain.
- Repo: `mercieca-call-sheet` (public GitHub `wilsonryan-hue/mercieca-call-sheet`). Prior product = one-screen call sheet (Account Director, consumer PR, London). Handoff rule: never invent people/phones/emails/CVs; 1 person per employer; job ad != candidate; Mercieca staff not candidates.
- Request implemented: landing page + sectioned desk; multiple searches; JD bank (add/edit); job boards tab w/ per-user profile memory used in searches; pay benchmark tool; editable intro templates (PR/FMCG tone); "How to use" tab.

## 2. ARCH
- Static `index.html`. State in `localStorage` key `mercieca-recruitment-v2`. Hash router: #home #find #searches #new #jobs #boards #pay #messages #help.
- No network calls from the app. External = outbound links only.
- Render = string templates -> `innerHTML`, with `esc()` on every dynamic value; delegated event handlers (`data-act`, `data-bind`, `data-form`).
- `normalize()` sanitises ALL loaded/imported state (types, enums, lengths, `safeUrl` http/https only, `badKey` blocks `__proto__|constructor|prototype`, `ownKey` for lookups).
- Migration: reads old `mercieca-recruitment-v1` (work, custom candidates, threshold) into default search `sch-default`.
- Backup/restore: JSON export; import via file input, size cap 2MB, confirm dialog, normalised.
- CSV export: cells starting `= + - @ TAB CR` get `'` prefix (formula-injection guard).
- Verified candidates (10) only attached to search id `sch-default`; new searches start empty by design (no fabrication).
- Build gate `scripts/verify-build.mjs`: requires markers `Mercieca Recruitment Desk|Candidates|Questions|Not contacted`; FAILS if file contains substring `sk-` or `xai-` (case-sensitive) or `tchworks.co.uk`. NOTE: this tripped once on the text `desk-backup` (contains `sk-`) -> renamed. Fragile check; flag if you think it should be fixed.

## 3. FEATURES -> WHERE
| Feature | Location | Notes |
|---|---|---|
| Landing/home | `viewHome` | current search stats, 8 tiles, recent 3, backup buttons |
| Multi-search | `viewNew/viewSearches/viewFind` | create from JD or free text; copy (empty sheet), close/reopen, delete (default undeletable) |
| Search words | `searchWords()` | per threshold 50-100; LinkedIn + Google links; app does not scrape |
| JD bank | `JD_SEEDS` (6 roles AE..AD + Social/Influencer), `viewJobs` | add w/ template, edit title/body/questions, copy, delete, restore seeds, "start search for this role"; `[blanks]` counted |
| Job boards | `BOARDS` (9) + custom, `viewBoards` | checkbox "I have my own profile", profile link/user name, note; ticked boards appear in Find people "Your job boards" w/ "Copy search words" |
| Pay check | `PAY`, `viewPay`, `payResultHtml` | 3 sectors x 9 levels; offer input (`55k`, `Â£55,000`); position in range; bar chart |
| Templates | `TPL_SEEDS` (5), `viewMessages`, `fill()` | editable, autosave, field chips `{first_name}{employer}{role}{place}{my_name}`, reset to original |
| Contact candidate | `candidateHtml` | picks template, fills fields, copy |
| Help | `viewHelp` | 8 numbered steps + page map + 8 FAQs; Ctrl+C/V instructions |
| a11y | skip link, labels, `aria-current`, focus moves to h1 on route change, 44px targets, focus ring |

## 4. DATA SOURCES (accuracy review wanted)
### Pay â€” PR Futures "PR and Communications Salary Survey 2026" (Jan 2026), agency tables. Â£k [low,high]
`https://prfutures.co.uk/blog/article-120-pr-and-communications-salary-survey-2026`
- Consumer: AE 27-30, SAE 30-35, AM 36-42, SAM 42-48, AD 50-58, SAD 60-70, AssocDir 75-85, Dir 85-110, MD 100-150
- Corporate/tech: 28-32, 32-36, 37-45, 45-50, 55-65, 65-75, 75-85, 80-115, 100-180
- Fin/health/public affairs: 28-32, 33-37, 38-46, 46-55, 60-65, 70-80, 80-90, 85-140, 135-200
- Caveats: single recruiter source; UK-wide, NO London split; "AD to Associate" uptick noted by source. Not cross-checked vs PRWeek (paywalled), Hays/Michael Page (gated), Robert Walters (PDF not read). A typo risk: source row "Account Director Â£55â€“Â£65k" lacks a "k" on low end; read as 55-65k.
- UI discloses all of the above.
### Job boards (checked 2026-10-05 by HTTP + search results)
- Verified 200: the-dots.com (jobs/search, jobs/create), linkedin.com/jobs, linkedin.com/talent/post-a-job, reed.co.uk/jobs/pr-jobs, reed.co.uk/recruiter/post-a-job, totaljobs.com/jobs/public-relations, totaljobs.com/recruiters, uk.indeed.com/hire/advertise-a-job, jobs.theguardian.com/jobs/marketing-and-pr, guardianjobsrecruiter.co.uk (via page links).
- NOT verified (HTTP 403 to scripts, i.e. bot-block; existence inferred from search results): `www.prweek.co.uk/jobs`, `jobs.campaignlive.co.uk`, `www.creativepool.com`. Reviewer: confirm these are the right employer-facing URLs.
- Price shown ONLY for The Dots (from its pricing page 2026-10-05): job post Â£195; 3-pack Â£525; 5-pack Â£775; Recruiter Pro Â£75/mo. Others say "check on the site". PRWeek: source says contact Haymarket to post.
- Marketing Week deliberately omitted: a Betterteam page states its job listings page is gone. Prior `PROVIDER_MATRIX.md` still lists it as a destination and has `jobs.prweek.com`-style assumptions -> STALE (see Â§6).
### Candidates (10, carried from prior build, `verified 24 Sep 2026`)
- NOT re-verified by me. Sources = LBB / LinkedIn public / Grayling. Treat as unverified claims; stale-risk for employer/title.

## 5. TESTED (Playwright via browser, Chromium-like, 1280px + 390px)
PASS: all 9 routes render, 0 console/page errors; new search from JD (prefill title+level); empty-sheet state; add candidate; XSS payload in name rendered as text, no execution; duplicate employer refused; `javascript:` URL refused; status/score/notes/CV persist across reload; contact message fills fields; template switch; template edit+field insert+persist+reset; user name persist; search copy/close/delete; JD add/edit/save/delete/restore; boards tick/profile/note persist + appear in Find people; custom board validation; pay calc (below/in/above range, `55k`, `Â£70,000`, junk input, MD row); backup import (valid), invalid file rejected, hostile backup sanitised (bad enums, 5000 match, `javascript:` urls, `__proto__` keys -> no prototype pollution, `pay.sector` forced to valid); corrupt storage -> clean default; v1->v2 migration (status/rating/notes/CV/custom/threshold); no horizontal overflow at 390px on all 9 routes.
BUGS FOUND+FIXED during test: (1) `pay.sector="__proto__"` crashed Pay page (fixed w/ `ownKey`); (2) `"1 people"` wording; (3) help text said logo is "black" (it is red); (4) pay sentence grammar/case; (5) unused helper + unused `people` field removed; (6) test-harness note: `goto` with hash-only change does not reload â€” a stale-code false negative cost one cycle.
NOT TESTED / UNKNOWN:
- Real browsers on Frankie's machine (Edge/Chrome/Safari/mobile). Only one automated Chromium-like browser.
- Clipboard copy (Copy message/link/search words) â€” `navigator.clipboard` path not asserted; `prompt()` fallback exists.
- CSV download + backup JSON download: click executed, download event NOT observed in harness (timeout). Treat as unverified.
- Screen reader pass; colour-contrast audit; keyboard-only full run.
- localStorage quota / private-mode failure (has `try/catch` + toast, not exercised).
- Multi-tab concurrent edits (last write wins; no sync).
- Print.
- Any server/host: has only ever run from a throwaway loopback server serving the one file.

## 6. KNOWN ISSUES / DEBT (be harsh)
1. UNCOMMITTED. Pre-existing uncommitted edits also present: `canonical` + `CANONICAL_URL` -> `https://mercieca-recruitment.vercel.app/` (replaced tchworks domain; verifier now forbids tchworks). That Vercel URL is NOT verified to exist. "Copy tool link" copies it.
2. `MERCIECA_BUILD_HANDOFF.md`, `PROVIDER_MATRIX.md`, `AI_COORDINATION.md`, `README.md` NOT updated. Handoff still describes v1 + a dead tunnel URL + TanStack Start architecture that does not match this repo's actual single-file state. AI_COORDINATION mandates handoff update after material change -> violated until fixed.
3. `scripts/verify-build.mjs` only checks 4 markers + 3 forbidden strings. No test of new features. No unit tests anywhere. All verification above was ad hoc, not committed.
4. Single 1000-line file, string-template rendering; every dynamic value must be hand-escaped. One missed `esc()` = XSS. Reviewer: audit each `+ ... +` interpolation (attrs especially: `data-id`, `value=`, `href=`).
5. `safeUrl` only checks scheme; no length cap on URLs beyond field `str()` caps in normalize; `rel=noopener noreferrer` set on external links.
6. Confirm dialogs (`window.confirm`) for destructive actions: fine for this user, poor a11y/UX polish.
7. Data is per-browser. Frankie on 2 machines = 2 desks. Backup file is the only portability. Existing "share link"/`?s=` feature from v1 REMOVED (it leaked names in URL; AI_COORDINATION flagged it). Decision not confirmed with owner.
8. Default threshold semantics: manual adds lower the visible threshold to the new person's match so they're not hidden. Intentional; may surprise.
9. Seed JD/question content is generic agency-PR copy written by the AI, not by Mercieca. No legal review (equality/salary-disclosure language, "confidential" claims). Salary left as `[add salary range]`.
10. Message templates assert Mercieca facts ("lives and breathes FMCG", Camden, "consumer, trade and corporate") copied from the company site per prior handoff. Not re-checked today.
11. GDPR: tool stores candidate names/notes/CV links in browser only. Mercieca privacy policy link is to `mercieca.co.uk/privacy-policy` (HTTP 200 today). No retention control. Prior handoff says policy text not verified.
12. LinkedIn: user searches manually while signed in; app stores no credentials. "Never type a password here" notice on Boards tab; profile field accepts free text so a user could still paste a password â€” no technical guard.

## 7. DECISIONS TO CHALLENGE
- Boards "memory" = checkbox + profile link + note + appears as quick-link in searches. Does NOT automate searching boards (no APIs/accounts; boards bot-block). Is this enough for "the desk remembers it and uses it when it runs searches"? Honest answer: it uses them as manual links + copyable search words only.
- "Run searches": app never runs a search itself (no key, no server, by prior design). Only builds queries.
- Pay: UK-wide agency table only; no in-house, no London uplift, no benefits, no freelance. Is a single-source table adequate for "where are we in the market"?
- Sidebar IA: 8 items. Too many for target user? Alternative = 5 + help.
- Removing v1 call-script panel in favour of 5 editable templates.

## 8. HOW TO RUN
- Open `index.html` in any modern browser (file:// works in normal Chrome/Edge; some embedded browsers block it). Or serve the folder statically.
- `node scripts/verify-build.mjs` -> must print `Build verification passed`.
- Backup of pre-v2 file: `%TEMP%\mercieca-index.before-v2.html` (also recoverable via `git checkout index.html`, noting v1 had the uncommitted canonical edit).

## 9. RISK MAP (where bugs are most likely; audit in this order)
1. `candidateHtml`, `viewFind`, `viewBoards`, `viewJobs`, `viewMessages`, `viewHome`, `viewSearches`: every `'...' + x + '...'` interpolation. Attribute contexts (`value=""`, `data-id=""`, `href=""`, `id=""`) must use `esc()`; `safeUrl()` for hrefs. Any miss = stored XSS (data comes from localStorage + imported JSON).
2. `normalize()` / `normSearch()`: can a crafted backup break invariants (duplicate ids, `currentId` pointing nowhere, empty `searches`, non-string fields, huge arrays, key `__proto__`)? Note `Object.assign({},src,...)` in `dup-search`.
3. Event delegation: `document.addEventListener('click'|'input'|'change'|'submit')` â€” handlers use `e.target.closest('[data-act]')`; check ids from DOM are only used for lookups (not trusted as HTML). Check two `change` listeners (generic + `#nsJd`) don't conflict.
4. `fill()` template substitution: `{token}` regex `\{(\w+)\}`; unknown tokens left as-is; user-edited templates may contain tokens in odd places. Output goes through `textContent`/`esc()` only.
5. `parseMoney()` / `payResultHtml()`: edge inputs (`0`, negative, `1e9`, `55k`, `Â£55,000`, `55,5k`, empty, NaN), division by zero when `hi==lo` (not in data), bar % clamp.
6. `render()`/hash router: unknown hash falls back to home; focus management; `document.title` build.
7. `exportCsv()`: formula-injection guard regex `/^[=+\-@\t\r]/`; filename built from title (sanitised to `[a-z0-9-]`).
8. Persistence: `save()` called on every input (perf on large notes?), quota errors, v1 migration (`migrateOld`) correctness, v2 default seeding (`seedJds`, `seedTpls`) when storage empty.
9. Verified-candidate gating: only `sch-default` gets `VERIFIED`; duplicating a search intentionally does NOT copy people. Check nothing re-attaches them elsewhere.
10. CSS: sticky nav `top:69px` assumes header height; mobile breakpoint 900/560/390; `.lad-row` grid on small screens.

## 10. FILES IN THIS BRANCH
- `index.html` â€” the app (review this).
- `scripts/verify-build.mjs` â€” build gate (adds forbidden `tchworks.co.uk`).
- `REVIEW_FOR_AI.md` â€” this file.
- Branch `review/v2-desk-for-third-party`. `main` is untouched and still holds the previous version, so `git diff main -- index.html` shows the full change.

## 11. SUGGESTED REVIEW CHECKLIST
[ ] grep every `innerHTML`/template for unescaped dynamic data
[ ] try hostile localStorage + hostile backup JSON
[ ] verify PRWeek/Campaign/Creativepool employer URLs
[ ] sanity-check PR Futures figures vs another source
[ ] keyboard-only walk of all routes; contrast of yellow/aqua/red chips
[ ] run on Edge + Chrome + iOS Safari
[ ] confirm CSV + backup downloads actually save
[ ] decide: restore `?s=` share or keep removed
[ ] update handoff/matrix/verifier before any "ready" claim (AI_COORDINATION P0 gate: stable URL + independent device + cold start â€” NOT met)

