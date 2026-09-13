// Deploys Storybook to its own Vercel project from the same repository.
//
// The prototype's vercel.json is what Vercel's remote build reads, whatever local config
// the CLI is given, so Storybook cannot be built remotely from this repository without
// shipping the prototype instead. Storybook is therefore built here and shipped as a
// prebuilt deployment (Vercel's Build Output API): no remote build runs, and what renders
// locally is exactly what ships.
//
// The Storybook project is resolved by name through a throwaway link in a temp directory,
// so nothing is written by hand; a logged-in Vercel CLI is the only requirement.
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PROJECT = 'clickguard-threat-monitoring-storybook';
const OUTPUT = 'storybook-static';

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, { stdio: opts.quiet ? 'pipe' : 'inherit', env: { ...process.env, ...opts.env }, cwd: opts.cwd });
  if (result.status !== 0) {
    if (opts.quiet) process.stderr.write(String(result.stdout) + String(result.stderr));
    process.exit(result.status ?? 1);
  }
}

run('npm', ['run', 'build-storybook']);
if (!existsSync(join(OUTPUT, 'index.html'))) {
  console.error(`${OUTPUT}/index.html is missing after the build.`);
  process.exit(1);
}

// Scope to the same team as the linked prototype project when that link exists.
const rootLink = '.vercel/project.json';
const team = existsSync(rootLink) ? JSON.parse(readFileSync(rootLink, 'utf8')).orgId : undefined;

const scratch = mkdtempSync(join(tmpdir(), 'clickguard-storybook-'));
try {
  run('vercel', ['link', '--yes', '--project', PROJECT, ...(team ? ['--team', team] : []), '--cwd', scratch], { quiet: true });
  const { orgId, projectId } = JSON.parse(readFileSync(join(scratch, '.vercel', 'project.json'), 'utf8'));
  /* Package the static output in the Build Output API layout and deploy it prebuilt. */
  const stage = join(scratch, 'stage');
  const out = join(stage, '.vercel', 'output');
  mkdirSync(join(out, 'static'), { recursive: true });
  cpSync(OUTPUT, join(out, 'static'), { recursive: true });
  writeFileSync(join(out, 'config.json'), JSON.stringify({ version: 3 }));
  console.log(`Deploying ${OUTPUT}/ to ${PROJECT} (${projectId}) as a prebuilt static deployment`);
  run('vercel', ['deploy', '--prebuilt', '--prod', '--yes', ...process.argv.slice(2)], {
    cwd: stage,
    env: { VERCEL_ORG_ID: orgId, VERCEL_PROJECT_ID: projectId },
  });
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
