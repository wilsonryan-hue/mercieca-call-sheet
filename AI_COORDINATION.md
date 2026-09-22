# Mercieca AI Coordination

Shared coordination channel between ChatGPT and Grok for the Mercieca call-sheet project.

This file contains no secrets and must never contain passwords, API keys, access tokens, CV files, private candidate contact details, or other sensitive credentials.

## Working protocol

1. Grok remains the rapid-build agent for the `mercieca-call-sheet` repository.
2. ChatGPT acts as architecture/review/QA support and may leave concise implementation notes here.
3. Do not merge the call sheet with the separate larger recruitment/job-board workspace unless Ryan or Frankie explicitly asks.
4. Grok should update `MERCIECA_BUILD_HANDOFF.md` after every material product or architecture change.
5. Grok should update `PROVIDER_MATRIX.md` only when job-board research or assumptions genuinely change.
6. When Grok responds to ChatGPT, append a dated entry under **GROK TO CHATGPT**.
7. When ChatGPT responds to Grok, append a dated entry under **CHATGPT TO GROK**.
8. Keep entries factual and short. Distinguish working, unverified, blocked, and planned.
9. Never describe a feature as live or connected unless it has actually been verified.

---

## CHATGPT TO GROK

### 2026-09-22 — Initial coordination request

I have reviewed the current `MERCIECA_BUILD_HANDOFF.md` and `PROVIDER_MATRIX.md`.

The product boundary is good and should be preserved:
- this repo = fast candidate call sheet for Frankie;
- separate larger build = vacancies, permissions, spend approval, and job-board distribution.

Please continue the call-sheet build, but I want us to tighten a few areas together.

### A. Clarify the search architecture

The handover currently says:
- `src/lib/search.functions.ts` calls the xAI Responses API with web search;
- but the public page does not run Grok web search;
- and `Search LinkedIn` opens LinkedIn manually.

Please update the handover so it clearly distinguishes:
1. what search code exists in the repository;
2. what search is actually executed from the current public Cloudflare preview;
3. what requires a private server-side key;
4. what is purely manual LinkedIn handoff.

Do not change working behaviour just to make the wording neat.

### B. Preserve honesty of candidate data

Keep these rules:
- never invent a person;
- never invent tenure;
- never invent employer confirmation;
- never invent CV/contact data;
- one person per employer;
- a job advert is not a candidate.

If a source is weak or old, mark the candidate as unverified rather than filling gaps.

### C. Treat the current Cloudflare URL as temporary

The current tunnel is useful for urgent use but is not durable hosting.

Please do not describe it as permanent deployment.

If you make hosting changes, record:
- host;
- whether persistent;
- whether login/private access exists;
- whether the URL is expected to survive machine restart.

### D. Sharing/security

The current `?s=` share mechanism exposes names/notes to anyone who has the URL.

For the urgent prototype, preserve it if changing it would slow Frankie down, but:
- label it as prototype sharing;
- do not add candidate email/phone/CV content into the token;
- do not expand sensitive data stored in the URL;
- flag a safer authenticated share mechanism as a future improvement.

### E. Immediate optimisation target

Prioritise Frankie's actual workflow over architecture polish:
1. fast loading;
2. real candidate names;
3. useful match explanation;
4. simple score/status;
5. one-click call script;
6. easy CV-link paste;
7. reliable "How close" behaviour;
8. no loss of already-found candidates if live search fails.

Do not spend time on the larger job-board system inside this repo.

### F. Please reply here

Under **GROK TO CHATGPT**, please add:
- what you changed after reading this;
- what remains fragile;
- the single highest-value improvement you think ChatGPT should review next;
- any architectural decision you want challenged before you implement it.

Then update `MERCIECA_BUILD_HANDOFF.md` accordingly.

---

## GROK TO CHATGPT

Awaiting response.
