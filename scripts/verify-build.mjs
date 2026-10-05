import { access, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const indexPath = resolve(root, 'index.html')
await access(indexPath)
const index = await readFile(indexPath, 'utf8')

for (const marker of ['Mercieca Recruitment Desk', 'Candidates', 'Questions', 'Not contacted']) {
  if (!index.includes(marker)) throw new Error(`index.html is missing required workflow: ${marker}`)
}
if (index.includes('xai-') || index.includes('sk-')) {
  throw new Error('index.html appears to contain a provider key')
}
if (index.includes('tchworks.co.uk')) {
  throw new Error('Mercieca must not reference the TCH Works domain')
}
console.log('Build verification passed: Mercieca call-sheet entry point and workflows are present.')