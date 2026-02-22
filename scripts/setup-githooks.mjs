import { execSync } from 'node:child_process'

try {
  execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' })
  execSync('git config core.hooksPath .githooks', { stdio: 'inherit' })
  console.log('Git hooks enabled: core.hooksPath=.githooks')
} catch {
  console.log('Skipping git hooks setup (not a git repository).')
}
