// Drives the desk in a real browser and checks each workflow Frankie uses.
// Run: npm run verify:browser
import { createServer } from 'node:http'
import { readFile, writeFile, mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const LIVE_URL = 'https://www.tchworks.co.uk/mercieca-recruitment/'
const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const html = await readFile(join(root, 'index.html'))

const server = createServer((req, res) => {
  if (req.url === '/' || req.url.startsWith('/?') || req.url.startsWith('/index.html')) {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(html)
  } else { res.writeHead(404); res.end() }
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const BASE = `http://127.0.0.1:${server.address().port}/`

const launchOpts = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
const browser = await chromium.launch(launchOpts)
const results = []
let failed = 0

async function check(name, fn) {
  try { await fn(); results.push(`PASS ${name}`) } catch (e) { failed++; results.push(`FAIL ${name}\n     ${e.message.split('\n')[0]}`) }
}
function assert(cond, msg) { if (!cond) throw new Error(msg) }

async function freshPage(opts = {}) {
  const context = await browser.newContext({ acceptDownloads: true, ...opts })
  const page = await context.newPage()
  page.errors = []
  page.on('pageerror', (e) => page.errors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') page.errors.push(m.text()) })
  page.on('dialog', (d) => d.accept())
  return { context, page }
}
// The desk renders synchronously on hashchange, so the page is ready one tick later.
async function go(page, hash) {
  await page.evaluate((h) => new Promise((done) => {
    if (location.hash === '#' + h) return done()
    addEventListener('hashchange', () => setTimeout(done, 0), { once: true })
    location.hash = h
  }), hash)
}
const shown = (page) => page.locator('#candList .candidate-name').allTextContents()

await check('every page opens with no errors, on a laptop and on a phone', async () => {
  for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    const { context, page } = await freshPage({ viewport })
    await page.goto(BASE)
    for (const r of ['home', 'find', 'searches', 'new', 'jobs', 'boards', 'pay', 'messages', 'help']) {
      await go(page, r)
      const h1 = await page.locator('#pagetitle').textContent()
      assert(h1 && h1.trim(), `#${r} has no heading`)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      assert(overflow <= 1, `#${r} scrolls sideways by ${overflow}px at ${viewport.width}px wide`)
    }
    assert(page.errors.length === 0, `page errors: ${page.errors.join(' | ')}`)
    await context.close()
  }
})

await check('the default sheet lists the checked people, and How close widens it', async () => {
  const { context, page } = await freshPage()
  await page.goto(BASE + '#find')
  const at100 = await shown(page)
  assert(at100.length === 4 && at100.includes('Alex Watherston'), `at 100% expected 4 people, got ${at100.length}`)
  await page.locator('#matchRange').fill('50')
  const at50 = await shown(page)
  assert(at50.length === 10, `at 50% expected 10 people, got ${at50.length}`)
  const href = await page.locator('#whereList a', { hasText: 'Search LinkedIn' }).getAttribute('href')
  assert(href.startsWith('https://www.linkedin.com/search/results/people/?keywords='), 'Search LinkedIn link is wrong')
  await context.close()
})

await check('adding a person: checks, one per employer, no script injection', async () => {
  const { context, page } = await freshPage()
  await page.goto(BASE + '#find')
  const add = async (name, employer, url) => {
    await page.fill('#addName', name); await page.fill('#addEmployer', employer)
    await page.fill('#addTitle', 'Account Director'); await page.fill('#addSource', url)
    await page.click('form[data-form="add-cand"] button[type=submit]')
    return (await page.locator('#addError').textContent()).trim()
  }
  assert((await add('Sam Real', 'Hope & Glory', 'https://example.com/sam')).includes('already someone from that employer'), 'Hope & Glory was not seen as Hope&Glory')
  assert((await add('Sam Real', 'Ogilvy', 'https://example.com/sam')).includes('already someone from that employer'), 'Ogilvy was not seen as Ogilvy UK')
  assert((await add('Sam Real', 'Mercieca', 'https://example.com/sam')).includes('own staff'), 'Mercieca staff were accepted')
  assert((await add('Sam Real', 'Frank', 'javascript:alert(1)')).includes('full web address'), 'javascript: address was accepted')
  await page.evaluate(() => { window.__xss = 0 })
  assert((await add('<img src=x onerror="window.__xss=1">', 'Frank PR', 'https://example.com/x')) === '', 'valid person was refused')
  const names = await shown(page)
  assert(names.includes('<img src=x onerror="window.__xss=1">'), 'name was not shown as plain text')
  assert(await page.evaluate(() => window.__xss) === 0, 'a script in a name ran')
  assert(page.errors.length === 0, `page errors: ${page.errors.join(' | ')}`)
  await context.close()
})

await check('status, score, notes and CV link survive a reload', async () => {
  const { context, page } = await freshPage()
  await page.goto(BASE + '#find')
  const card = page.locator('article.candidate[data-cid="alex-watherston"]')
  await card.locator('select[data-bind="status"]').selectOption('Contacted')
  await card.locator('button[data-n="4"]').click()
  await page.locator('article.candidate[data-cid="alex-watherston"] textarea.notes').fill('Call back Tuesday')
  const cv = page.locator('#cv-alex-watherston')
  await cv.fill('https://example.com/cv.pdf'); await cv.press('Tab')
  await page.reload()
  const c2 = page.locator('article.candidate[data-cid="alex-watherston"]')
  assert(await c2.locator('select[data-bind="status"]').inputValue() === 'Contacted', 'status lost')
  assert(await c2.locator('button[data-n="4"]').getAttribute('class') === 'on', 'score lost')
  assert(await c2.locator('textarea.notes').inputValue() === 'Call back Tuesday', 'notes lost')
  assert(await page.locator('#cv-alex-watherston').inputValue() === 'https://example.com/cv.pdf', 'CV link lost')
  await context.close()
})

await check('Contact candidate fills the message with their name and employer', async () => {
  const { context, page } = await freshPage()
  await page.goto(BASE + '#find')
  await page.locator('article.candidate[data-cid="alex-watherston"] button[data-act="contact"]').click()
  const msg = await page.locator('#msg-alex-watherston').textContent()
  assert(msg.startsWith('Hi Alex,') && msg.includes('PrettyGreen') && msg.includes('Frankie Mercieca'), `message not filled: ${msg.slice(0, 80)}`)
  await page.locator('#tp-alex-watherston').selectOption('t-email')
  assert((await page.locator('#msg-alex-watherston').textContent()).startsWith('Subject: Account Director role at Mercieca'), 'switching message did not change the text')
  await context.close()
})

await check('Copy tool link copies the stable tchworks address', async () => {
  const { context, page } = await freshPage()
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE })
  await page.goto(BASE)
  await page.click('button[data-act="copy-link"]')
  await page.waitForFunction(() => document.querySelector('button[data-act="copy-link"]').textContent === 'Copied')
  const copied = await page.evaluate(() => navigator.clipboard.readText())
  assert(copied === LIVE_URL, `copied ${copied}`)
  await context.close()
})

await check('a new search starts empty; deleting it also deletes its private notes', async () => {
  const { context, page } = await freshPage()
  await page.goto(BASE + '#jobs')
  await page.locator('button[data-act="jd-use"][data-id="jd-sam"]').click()
  await page.waitForSelector('#nsTitle')
  assert(await page.inputValue('#nsTitle') === 'Senior Account Manager', 'job title was not filled from the job description')
  await page.click('form[data-form="new-search"] button[type=submit]')
  await page.waitForSelector('#candList .empty')
  await page.fill('#addName', 'Pat Person'); await page.fill('#addEmployer', 'Some Agency')
  await page.fill('#addTitle', 'Senior Account Manager'); await page.fill('#addSource', 'https://example.com/pat')
  await page.click('form[data-form="add-cand"] button[type=submit]')
  await page.locator('#candList textarea.notes').fill('Private note about Pat')
  const pid = await page.locator('#candList article.candidate').getAttribute('data-cid')
  await go(page, 'searches')
  const del = page.locator('button[data-act="del-search"]')
  assert(await del.count() === 1, 'expected one deletable search')
  await del.click()
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('mercieca-recruitment-v2')))
  assert(stored.searches.length === 1, 'search not deleted')
  assert(!stored.work[pid], 'private notes for a deleted search were kept')
  await context.close()
})

await check('work saved by the old one-screen sheet carries over', async () => {
  const { context, page } = await freshPage()
  await page.addInitScript(() => {
    if (sessionStorage.getItem('seeded')) return
    sessionStorage.setItem('seeded', '1')
    localStorage.setItem('mercieca-recruitment-v1', JSON.stringify({
      threshold: 90,
      work: { 'alex-watherston': { status: 'Interview', rating: 5, notes: 'Strong', cvUrl: '', open: '' } },
      custom: [{ id: 'manual-old1', name: 'Old Person', title: 'Account Director', employer: 'Frank', match: 90, sourceUrl: 'https://example.com/old', sourceLabel: 'source' }],
    }))
  })
  await page.goto(BASE + '#find')
  const names = await shown(page)
  assert(names.includes('Old Person'), 'old custom person missing')
  assert(await page.locator('#matchValue').textContent() === '90', 'old How close setting lost')
  assert(await page.locator('article.candidate[data-cid="alex-watherston"] select[data-bind="status"]').inputValue() === 'Interview', 'old status lost')
  await context.close()
})

await check('a damaged or hostile backup file cannot break the desk', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'mercieca-'))
  const file = join(dir, 'backup.json')
  await writeFile(file, `{
    "v": 2,
    "searches": [
      {"id": "p", "title": "Proto", "custom": [
        {"id": "__proto__", "name": "Proto Id", "employer": "B", "sourceUrl": "https://example.com/p"},
        {"id": "nosrc", "name": "No Source", "employer": "C"}
      ]},
      {"id": "dup", "title": "One", "custom": [{"id": "x\\" onmouseover=\\"alert(1)", "name": "Quote Id", "employer": "A", "sourceUrl": "javascript:alert(1)"}]},
      {"id": "dup", "title": "Two", "threshold": 5000},
      {"id": "a b'c", "title": "<script>alert(1)</script>"}
    ],
    "currentId": "nowhere",
    "work": {"__proto__": {"polluted": true}, "x y": {"status": "Hacked", "tpl": "constructor"}},
    "templates": {"t-call": 42, "constructor": "x"},
    "pay": {"sector": "__proto__", "level": "Boss"}
  }`)
  const { context, page } = await freshPage()
  await page.goto(BASE)
  await page.setInputFiles('#importFile', file)
  await page.waitForFunction(() => document.querySelector('#toast').textContent === 'Backup restored')
  const st = await page.evaluate(() => JSON.parse(localStorage.getItem('mercieca-recruitment-v2')))
  const ids = st.searches.map((s) => s.id)
  assert(new Set(ids).size === ids.length, 'duplicate search ids kept')
  assert(ids.every((i) => /^[A-Za-z0-9_-]+$/.test(i)), `unsafe search id kept: ${ids}`)
  assert(st.searches.every((s) => [50, 60, 70, 80, 90, 100].includes(s.threshold)), 'bad How close value kept')
  assert(st.pay.sector === 'consumer', 'bad pay sector kept')
  const people = st.searches.flatMap((s) => s.custom)
  assert(people.every((c) => c.id !== '__proto__' && /^https?:/.test(c.sourceUrl)), 'person with a prototype id or no source kept')
  assert(({}).polluted === undefined && await page.evaluate(() => ({}).polluted) === undefined, 'prototype polluted')
  for (const r of ['home', 'searches', 'pay', 'messages', 'find']) await go(page, r)
  for (const i of [0, 1, 2]) await page.selectOption('#curSearch', { index: i })
  assert(page.errors.length === 0, `page errors: ${page.errors.join(' | ')}`)
  await context.close()
})

await check('a file that is not a desk backup is refused and changes nothing', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'mercieca-'))
  const { context, page } = await freshPage()
  await page.goto(BASE + '#find')
  await page.locator('article.candidate[data-cid="alex-watherston"] textarea.notes').fill('Keep me')
  for (const [name, body] of [['empty.json', '{}'], ['list.json', '[1,2]'], ['other.json', '{"searches":[],"name":"x"}']]) {
    await writeFile(join(dir, name), body)
    await page.setInputFiles('#importFile', join(dir, name))
    await page.waitForFunction(() => document.querySelector('#toast').textContent.includes('does not look like a backup'))
    await page.evaluate(() => { document.querySelector('#toast').textContent = '' })
  }
  const st = await page.evaluate(() => JSON.parse(localStorage.getItem('mercieca-recruitment-v2')))
  assert(st.work['alex-watherston'].notes === 'Keep me', 'notes were overwritten')
  await context.close()
})

await check('skip link moves to the page content without leaving the page', async () => {
  const { context, page } = await freshPage()
  await page.goto(BASE + '#pay')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  assert(await page.evaluate(() => location.hash) === '#pay', 'skip link changed the page')
  assert(await page.evaluate(() => document.activeElement.id) === 'main', 'focus did not move to the content')
  await context.close()
})

await check('search words widen one level up and down for senior roles', async () => {
  const { context, page } = await freshPage()
  await page.goto(BASE + '#jobs')
  await page.locator('button[data-act="jd-use"][data-id="jd-sam"]').click()
  await page.waitForSelector('#nsTitle')
  await page.click('form[data-form="new-search"] button[type=submit]')
  await page.waitForSelector('#matchRange')
  const words = async () => decodeURIComponent((await page.locator('#whereList a', { hasText: 'Search LinkedIn' }).getAttribute('href')).split('keywords=')[1])
  await page.locator('#matchRange').fill('90')
  assert((await words()).startsWith('("Senior Account Manager" OR "Account Director")'), `90%: ${await words()}`)
  await page.locator('#matchRange').fill('50')
  assert((await words()).startsWith('("Senior Account Manager" OR "Account Director" OR "Account Manager")'), `50%: ${await words()}`)
  await context.close()
})

await check('job descriptions: renaming updates the level; an emptied bank stays empty', async () => {
  const { context, page } = await freshPage()
  await page.goto(BASE + '#jobs')
  await page.locator('button[data-act="jd-edit"][data-id="jd-ad"]').click()
  await page.fill('#jdE-t', 'Senior Account Director')
  await page.locator('button[data-act="jd-save"]').click()
  let st = await page.evaluate(() => JSON.parse(localStorage.getItem('mercieca-recruitment-v2')))
  assert(st.jds.find((j) => j.id === 'jd-ad').level === 'Senior Account Director', 'level not updated with the title')
  while (await page.locator('button[data-act="jd-edit"]').count()) {
    await page.locator('button[data-act="jd-edit"]').first().click()
    await page.locator('button[data-act="jd-del"]').click()
  }
  await page.reload()
  st = await page.evaluate(() => JSON.parse(localStorage.getItem('mercieca-recruitment-v2')))
  assert(st.jds.length === 0, `deleted roles came back: ${st.jds.length}`)
  assert(await page.locator('button[data-act="jd-restore"]').count() === 1, 'no way to bring the standard roles back')
  await context.close()
})

await check('pay check places an offer in the market range', async () => {
  const { context, page } = await freshPage()
  await page.goto(BASE + '#pay')
  await page.fill('#payOffer', '55k')
  const text = await page.locator('#payResult').textContent()
  assert(text.includes('£50,000 to £58,000') && text.includes('middle'), `unexpected: ${text.slice(0, 160)}`)
  await page.fill('#payOffer', '£45,000')
  assert((await page.locator('#payResult').textContent()).includes('£5,000 below'), 'below-range text wrong')
  await page.fill('#payOffer', 'lots')
  assert((await page.locator('#payResult').textContent()).includes('Type a salary'), 'junk input not ignored')
  await context.close()
})

await check('job boards: ticking one puts it on Find people; PRWeek Jobs is not offered', async () => {
  const { context, page } = await freshPage()
  await page.goto(BASE + '#boards')
  assert(!(await page.content()).includes('PRWeek Jobs</h3>'), 'closed PRWeek Jobs board still listed')
  await page.locator('input[data-bind="board-use"][data-id="thedots"]').check()
  await go(page, 'find')
  assert((await page.locator('#whereList').textContent()).includes('The Dots'), 'ticked board not shown on Find people')
  await context.close()
})

await check('shortlist and backup files download', async () => {
  const { context, page } = await freshPage()
  await page.goto(BASE + '#find')
  const [csv] = await Promise.all([page.waitForEvent('download'), page.click('button[data-act="export-csv"]')])
  assert(csv.suggestedFilename() === 'mercieca-account-director-shortlist.csv', `csv name ${csv.suggestedFilename()}`)
  const body = await readFile(await csv.path(), 'utf8')
  assert(body.split('\r\n').length === 11 && body.includes('"Alex Watherston"'), 'csv rows wrong')
  await go(page, 'home')
  const [bk] = await Promise.all([page.waitForEvent('download'), page.click('button[data-act="export-backup"]')])
  const backup = JSON.parse(await readFile(await bk.path(), 'utf8'))
  assert(backup.v === 2 && backup.searches.length === 1, 'backup content wrong')
  await context.close()
})

await browser.close()
server.close()
console.log(results.join('\n'))
if (failed) { console.error(`\n${failed} browser check(s) failed.`); process.exit(1) }
console.log(`\nBrowser verification passed: ${results.length} checks.`)
