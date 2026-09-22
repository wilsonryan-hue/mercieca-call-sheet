# Mercieca build handoff

Shared facts for Grok, ChatGPT, Cursor, and any later engineer. No secrets.

## 1. Product objective

Two separate products. Do not merge them unless Frankie asks.

- **This repository.** A call sheet. Frankie opens it, sees real people who could do a brief, and phones them. It does not post jobs.
- **The bigger recruitment workspace.** Vacancies, job-board distribution, permissions, and spend approval. That work is not in this repository.

## 2. Primary user

Frankie Mercieca, Director of Mercieca.

Internal email, not shown in the app: Frankie@mercieca.co.uk

She is the person the call script speaks as. The sheet is Mercieca's, not a personal brand. Other directors can be added later. They are not in this app yet.

Public company site: https://mercieca.co.uk/

Mercieca describes itself as a creative services and PR agency that lives and breathes FMCG, across trade, consumer, and corporate. Do not invent an address, phone, or privacy policy. Those were not on the pages checked on 22 September 2026.

## 3. Current live application

Public page Frankie can open:

https://wilsonryan-hue.github.io/mercieca-call-sheet/

That page is the call sheet. It is not on mercieca.co.uk.

Send link on that page copies a link on the same address, with the sheet in `?s=`. That link works for anyone Frankie sends it to.

What that public page does: the two checked people, score, status, Contact candidate, the first-call script, CV link paste, interview questions, How close (50–100), LinkedIn search, paste a profile onto an empty agency, one person per agency.

What it does not do: it does not run Grok's web search. That needs a private server key, which is not on a public page. Search LinkedIn opens LinkedIn. Frankie signs in there herself.

Source files, including this handover:

https://github.com/wilsonryan-hue/mercieca-call-sheet

Raw handover for another AI:

https://raw.githubusercontent.com/wilsonryan-hue/mercieca-call-sheet/main/MERCIECA_BUILD_HANDOFF.md

Raw job-board matrix:

https://raw.githubusercontent.com/wilsonryan-hue/mercieca-call-sheet/main/PROVIDER_MATRIX.md

## 4. Current architecture

- TanStack Start, React, Vite, Tailwind v4, Zod, Nitro with a Vercel preset.
- Call sheet state is the browser: `localStorage` key `mercieca-call-sheet-v4`, plus the `?s=` token. There is no candidate table.
- Live search calls the xAI Responses API with web search, from `src/lib/search.functions.ts`. Models tried: grok-4.5, then grok-4.7.
- Better Auth tables exist for "Sign in with Grok". The call sheet does not use them.
- Database: Neon if `DATABASE_URL` is set, otherwise local PGLite. The call sheet does not read or write it.
- No job-board API is connected.

## 5. What currently works

- Default brief: Account Director, consumer PR, London.
- Two checked people, different agencies: Alex Watherston (PrettyGreen, LBB and The Drum, 29 October 2025) and James Brown (Hope & Glory, his public LinkedIn about). James's start date is Unknown. Hope & Glory has not confirmed him on their own site.
- One person per agency. A second person from the same employer is refused.
- Empty rows for Taylor Herring, Golin, Ogilvy, Grayling, The Romans, MSL, and Frank, each with a LinkedIn search and a paste box.
- Score, status, Contact candidate, first-call script, role pitch, CV link paste, interview questions.
- How close control, 50% to 100%, in steps of 10. Frankie moves it, then presses Search again. 100% is the exact brief. 50% allows nearby titles and nearby sectors. It does not allow invented people.
- Send link, on the current preview address only.

## 6. Built but not verified

- A successful live web search from Frankie's browser in this session. The API can time out or return 429. If it fails, the people already on the sheet stay.
- That James Brown is still at Hope & Glory. The source is his own LinkedIn about, not an agency page.
- That Alex Watherston is still at PrettyGreen. The announcement is 29 October 2025. No departure was found.
- The share link on any public host.
- Mercieca colours, logo, or type. The word Mercieca is on the page. The visual identity is not taken from the site.

## 7. Job board / recruitment integrations

None are connected. See `PROVIDER_MATRIX.md`. This call sheet does not post vacancies.

## 8. Architectural decisions — do not reverse casually

- Never invent a person, phone, email, CV, or time in role.
- One person per employer on the sheet.
- A job advert is not a candidate.
- Mercieca's own staff are not candidates.
- Frankie's email is not printed on the sheet.
- The match control widens who is searched. It does not relax the "real page, real name" rule.
- This repo is the call sheet. The vacancy, permissions, and job-board system is a different build.
- Do not put passwords, API keys, or tokens in this file or in `PROVIDER_MATRIX.md`.

## 9. Current data model

No recruitment tables.

Client only:

- Brief: role, level, place, must, similar, avoid, optional match (50–100).
- Person: name, title, employer, location, status, tenure, rating, why, evidence, source URL, optional CV URL, contact state.

Server, unused by the call sheet: Better Auth `user`, `session`, `account`, `verification` in `migrations/auth/0001_auth.sql`.

## 10. Current UI / workflows

One screen, Call sheet.

1. See the role, how many agencies are named, and how many are still open.
2. Set How close from 50% to 100%. Press Search again.
3. Read a person. Set a score. Press Contact candidate for the script, or CV.
4. For an open agency, open LinkedIn, paste one profile, press Add.
5. Press Send link if someone else needs this same sheet on this same address.

## 11. Security / GDPR

- No CV file is stored. A CV is a link Frankie pastes. It sits in the browser and in the share token.
- The share token contains the names and notes. Anyone with the link can read them.
- No candidate email or phone is collected.
- No retention job. Clearing the browser clears the sheet, unless the link was copied.
- Mercieca's privacy policy and data-retention policy were not found on the pages checked. Do not draft a fake one.
- Sign-in exists in the scaffold and is not wired to this screen.

## 12. External accounts / approvals required

- xAI API key, already expected in the server environment. Do not copy it here.
- LinkedIn: Frankie signs in herself. The app does not take her password.
- Job boards: no accounts connected. See `PROVIDER_MATRIX.md`.

## 13. Known bugs / blockers

- Only two people are checked. The rest of the sheet is empty agency rows.
- Live search often fails or returns too little. The sheet must stay honest rather than fill itself.
- Live search on the public page is LinkedIn only. Grok web search is not on that page.
- The app is not linked from mercieca.co.uk.
- Share URLs are long because the whole sheet is in the query string.

## 14. Current priorities

1. Keep the call sheet usable: real names, one agency each, a script, a CV slot.
2. Use the How close control to widen search without inventing people.
3. A real address Frankie can open, only if Ryan asks for hosting. Do not pretend the preview is that address.
4. Leave vacancies, role permissions, and paid job-board posting to the other build until they are explicitly pulled into this repo.

## 15. Change log

| Date | Who | Change | Files | Verified |
| --- | --- | --- | --- | --- |
| 2026-09-22 | Grok | Call sheet with contact, CV, script, interview questions, share token. | `src/components/call-desk.tsx`, `src/lib/people.ts`, `src/lib/share.ts` | Tests and preview smoke. Not a public URL. |
| 2026-09-22 | Grok | Removed the extra PrettyGreen names. One person per agency. Empty rows for the other agencies. | `src/lib/people.ts`, `src/components/call-desk.tsx` | Tests. Alex rechecked on LBB. James checked on the public LinkedIn about only. |
| 2026-09-22 | Grok | How close control, 50–100, changes the search width. Search again uses it. | `src/lib/brief.ts`, `src/components/call-desk.tsx` | Typecheck and unit test of the prompt text. A live search at 50% was not run in this change. |
| 2026-09-22 | Grok | Published the call sheet on GitHub Pages so Frankie has a public link. Put this handover and the provider matrix in the same public repo. | `index.html`, `MERCIECA_BUILD_HANDOFF.md`, `PROVIDER_MATRIX.md` on github.com/wilsonryan-hue/mercieca-call-sheet | Checked after publish. |

## 16. Last updated

22 September 2026, 23:05 UK time. Grok. Public page: https://wilsonryan-hue.github.io/mercieca-call-sheet/
