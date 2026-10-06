import { access, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const LIVE_URL = 'https://www.tchworks.co.uk/mercieca-recruitment/'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const indexPath = resolve(root, 'index.html')
await access(indexPath)
const index = await readFile(indexPath, 'utf8')
const fail = (msg) => { throw new Error(`index.html: ${msg}`) }

for (const marker of [
  'Mercieca Recruitment Desk', 'Candidates', 'Questions', 'Not contacted',
  'Find people', 'My searches', 'Job descriptions', 'Job boards', 'Pay check', 'Messages', 'How to use',
]) {
  if (!index.includes(marker)) fail(`missing required workflow: ${marker}`)
}

// The page is served at one stable address. Copy tool link and the canonical tag must both point there.
if (!index.includes(`<link rel="canonical" href="${LIVE_URL}">`)) fail(`canonical link is not ${LIVE_URL}`)
if (!index.includes(`var CANONICAL_URL = "${LIVE_URL}";`)) fail(`Copy tool link does not copy ${LIVE_URL}`)
if (/vercel\.app|trycloudflare\.com|localhost|127\.0\.0\.1/.test(index)) fail('points at a temporary or unverified host')

// Provider keys look like xai-/sk- followed by a long token. Plain words such as "desk-" are fine.
if (/\b(xai|sk)-[A-Za-z0-9_-]{20,}/.test(index)) fail('appears to contain a provider key')

// PRWeek Jobs closed (its jobs page says so, checked 6 Oct 2026). Do not send Frankie there to post.
if (index.includes('prweek.co.uk/jobs')) fail('links to the closed PRWeek Jobs board')

const script = index.match(/<script>([\s\S]*)<\/script>/)
if (!script) fail('has no script')
try { new Function(script[1]) } catch (e) { fail(`script does not parse: ${e.message}`) }

console.log('Build verification passed: Mercieca Recruitment Desk entry point and workflows are present.')
