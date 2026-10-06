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

Frankie opens:

https://www.tchworks.co.uk/mercieca-recruitment/

Served by GitHub Pages from `wilsonryan-hue/wilsonryan-hue.github.io`, file `mercieca-recruitment/index.html` (that repo is also the TCH Works shop; keep it public). Checked 6 October 2026: the live file was byte-identical to `index.html` on this repo's `main` before the v2 desk.

This repository is the source. Its own Pages workflow never worked (Pages was not enabled here) and was replaced by a CI check on 6 October 2026. The old Cloudflare tunnel address is dead; do not send it.

Copy tool link copies the address above, whatever address the page was opened from.

Putting a new version live = copying `index.html` into the github.io repo. Only with Ryan's yes.

## 4. Current architecture

- One static `index.html`. Vanilla JavaScript, no libraries, no server, no network calls. Outbound links only.
- State is the browser: `localStorage` key `mercieca-recruitment-v2`. Work from the older one-screen sheet (`mercieca-recruitment-v1`) is carried over the first time v2 opens, and the old key is left in place.
- Hash routes: #home #find #searches #new #jobs #boards #pay #messages #help.
- Every loaded or imported state goes through `normalize()`: types, enums, lengths, http/https links only, safe ids, no duplicate search ids, no `__proto__` keys.
- No xAI/Grok search, TanStack, database or sign-in in this repo. Earlier notes describing those were about a different build.

## 5. What currently works

- Home, with the current search, recent searches and backup/restore.
- Several searches. Each keeps its own people; the ten checked people sit on the default Account Director search.
- How close, 50% to 100%. LinkedIn and Google search links built from the search.
- One person per employer ("Hope & Glory" = "Hope&Glory", "Ogilvy" = "Ogilvy UK"). Mercieca staff refused. Profile link required.
- Status, score, private notes, CV link. Ready-written messages filled with the person's name and employer.
- Job description bank, job boards list with Frankie's own profile notes, pay check from PR Futures 2026, editable message templates, help page.
- Shortlist CSV export and backup file.
- `npm run verify:browser` drives all of the above in Chromium on every pull request.

## 6. Built but not verified

- Real browsers on Frankie's machine (Edge, Safari, phone). CI uses Chromium only.
- That the ten people are still in the roles listed. Sources were checked 24 September 2026.
- Campaign Jobs could not be opened on 6 October 2026; PRWeek Jobs (same publisher) has closed. The desk tells Frankie to check before paying.

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

No recruitment tables. Browser only (`mercieca-recruitment-v2`):

- Searches: title, level, sector, place, helpful experience, linked job description, How close, open/closed, manual people.
- Person: name, title, employer, location, match, why, evidence, source link.
- Work per person: status, score, notes, CV link, chosen message.
- Job descriptions, job board profile notes, message templates, Frankie's name, pay check inputs.

## 10. Current UI / workflows

Home, Find people, My searches, Job descriptions, Job boards, Pay check, Messages, How to use. The How to use page walks Frankie through a first search step by step.

## 11. Security / GDPR

- No CV file is stored. A CV is a link Frankie pastes, kept in her browser.
- The `?s=` share link from v1 was removed in v2, so names are no longer put in web addresses.
- No candidate email or phone is collected.
- Deleting a person or a search deletes the private notes on them. No other retention job.
- The privacy policy link points at mercieca.co.uk/privacy-policy. Do not draft a fake one.

## 12. External accounts / approvals required

- xAI API key, already expected in the server environment. Do not copy it here.
- LinkedIn: Frankie signs in herself. The app does not take her password.
- Job boards: no accounts connected. See `PROVIDER_MATRIX.md`.

## 13. Known bugs / blockers

- Data lives in one browser. A second computer is a second, empty desk unless a backup file is restored.
- The desk builds searches; it does not run them or read LinkedIn.
- Pay figures are one UK-wide source with no London split; the page says so.

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
| 2026-10-06 | Claude | v2 desk taken from the review branch. Copy tool link and canonical back to the tchworks address (the branch pointed at an unverified Vercel address). PRWeek Jobs removed (closed). One-per-employer check ignores "&"/"and", spacing, "The", "UK". Deleting a search deletes its private notes. Safer backup import. Browser check added; broken Pages workflow replaced with CI. | `index.html`, `scripts/`, `.github/workflows/verify.yml` | `npm run build`, `npm run verify:browser` (12 checks). Not yet live. |
| 2026-09-22 | Grok | Put the call sheet and this handover in a public GitHub repo. GitHub Pages publish was refused (403). Served the sheet on a Cloudflare tunnel instead. | `index.html` and the two markdown files in wilsonryan-hue/mercieca-call-sheet | Public URL fetched. Alex Watherston and Contact candidate were on the page. |

## 16. Last updated

6 October 2026, Claude. Live: https://www.tchworks.co.uk/mercieca-recruitment/

