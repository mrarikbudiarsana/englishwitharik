import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

interface Finding {
  file: string
  level: 'warn' | 'info'
  message: string
}

const root = path.join(process.cwd(), 'app', '(public)')
const findings: Finding[] = []

function walk(dir: string): string[] {
  const entries = readdirSync(dir)
  const files: string[] = []
  for (const entry of entries) {
    const abs = path.join(dir, entry)
    const st = statSync(abs)
    if (st.isDirectory()) files.push(...walk(abs))
    else if (entry === 'page.tsx') files.push(abs)
  }
  return files
}

function rel(file: string) {
  return path.relative(process.cwd(), file).replace(/\\/g, '/')
}

function add(file: string, message: string, level: 'warn' | 'info' = 'warn') {
  findings.push({ file: rel(file), level, message })
}

for (const file of walk(root)) {
  const src = readFileSync(file, 'utf8')
  const hasMetadata = /export\s+(const\s+metadata|async\s+function\s+generateMetadata)/.test(src)
  const hasCanonical = /alternates\s*:\s*\{[\s\S]*canonical/.test(src) || /buildPageMetadata\(/.test(src)
  const isDebug = file.includes('debug-content')
  const hasNoindex = /noindex\s*:\s*true/.test(src) || /robots\s*:\s*\{[\s\S]*index\s*:\s*false/.test(src)

  if (!hasMetadata) add(file, 'Missing metadata export.')
  if (hasMetadata && !hasCanonical && !isDebug) add(file, 'Missing canonical metadata.')
  if (isDebug && !hasNoindex) add(file, 'Debug page should be noindex.')
}

if (!findings.length) {
  console.log('SEO audit passed: no issues found.')
  process.exit(0)
}

const warnCount = findings.filter(f => f.level === 'warn').length
console.log(`SEO audit found ${findings.length} issue(s):`)
for (const f of findings) {
  const marker = f.level === 'warn' ? 'WARN' : 'INFO'
  console.log(`[${marker}] ${f.file} - ${f.message}`)
}

process.exit(warnCount > 0 ? 1 : 0)
