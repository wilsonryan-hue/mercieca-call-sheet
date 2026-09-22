# Provider matrix

Job boards for the later Mercieca recruitment workspace. Nothing here is connected to the call sheet. No accounts, passwords, or keys.

Checked as research on 22 September 2026. Status means "not built", not "ready to post".

| Destination | Route | Status | Account needed | Automation | Blocker | Next action |
| --- | --- | --- | --- | --- | --- | --- |
| LinkedIn Jobs | Official jobs integration, or a manual post | Not connected | Yes. A company jobs seat. | Low until approved | Partner approval and a company page | Confirm Mercieca's LinkedIn page and who may post |
| LinkedIn people search | Frankie searches while signed in. The call sheet only opens the search | Manual only | Frankie's own login. The app must not store it | None | Login wall | Leave it manual |
| Indeed | Employer account or a multiposter | Not connected | Yes | Medium via a multiposter | No account | Decide direct or multiposter before any build |
| Reed | Employer account or a multiposter | Not connected | Yes | Medium via a multiposter | No account | Same decision as Indeed |
| Totaljobs | Employer account or a multiposter | Not connected | Yes | Medium via a multiposter | No account | Same decision as Indeed |
| PRWeek Jobs | Direct employer post, or a multiposter if they offer one | Not connected | Yes | Unknown | No account. Do not assume an API | Ask PRWeek what an employer post costs |
| Campaign Jobs | Direct employer post | Not connected | Yes | Unknown | No account. Do not assume an API | Ask Campaign what an employer post costs |
| Marketing Week | Direct employer post | Not connected | Yes | Unknown | No account | Ask before building a connector |
| CIM | Their jobs board. A multiposter may carry it. idibu is a possible route, not a signed account | Not connected | Yes | Unknown | No CIM account. No idibu account | Confirm whether CIM is in the multiposter Frankie would actually buy |
| The Dots | Manual talent search. Not a job feed from this app | Not connected | A Dots login for the person searching | None | No API in use | Keep as a manual search |
| Creativepool | Manual, or their own jobs product | Not connected | Yes for posting | Unknown | No account | Confirm if Mercieca will post there |
| Google for Jobs | Public careers pages with job schema on a site Mercieca controls | Not built | No job-board account. Needs a real careers URL | High once pages exist | No Mercieca careers pages in this repo | Do not fake a careers site |
| PR Moment / trade press | Editorial, not a job feed | Not a destination | No | None | Not a board | Do not build a connector |

Rule: a row stays "Not connected" until a person at Mercieca has the account and has said to use it. Do not store credentials in this file.
