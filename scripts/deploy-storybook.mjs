// Deploys Storybook to its own Vercel project from the same repository.
// The root directory is linked to the prototype project. This script resolves the
// Storybook project by name through the Vercel CLI (a throwaway link in a temp
// directory), then points the deploy at it through environment variables and
// swaps in vercel.storybook.json for the build settings. Nothing needs to be
// written by hand; the only requirement is a logged-in Vercel CLI.
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PROJECT = 'clickguard-threat-monitoring-storybook';

function run(args, opts = {}) {
  const result = spawnSync('vercel', args, { stdio: opts.quiet ? 'pipe' : 'inherit', env: { ...process.env, ...opts.env } });
  if (result.status !== 0) {
    if (opts.quiet) process.stderr.write(String(result.stdout) + String(result.stderr));
    process.exit(result.status ?? 1);
  }
}

// Scope to the same team as the linked prototype project when that link exists.
const rootLink = '.vercel/project.json';
const team = existsSync(rootLink) ? JSON.parse(readFileSync(rootLink, 'utf8')).orgId : undefined;

const scratch = mkdtempSync(join(tmpdir(), 'clickguard-storybook-'));
try {
  run(['link', '--yes', '--project', PROJECT, ...(team ? ['--team', team] : []), '--cwd', scratch], { quiet: true });
  const { orgId, projectId } = JSON.parse(readFileSync(join(scratch, '.vercel', 'project.json'), 'utf8'));
  console.log(`Deploying Storybook to ${PROJECT} (${projectId})`);
  run(['deploy', '--prod', '--yes', '--local-config', 'vercel.storybook.json', ...process.argv.slice(2)], {
    env: { VERCEL_ORG_ID: orgId, VERCEL_PROJECT_ID: projectId },
  });
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
