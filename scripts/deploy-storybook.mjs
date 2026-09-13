// Deploys Storybook to its own Vercel project from the same repository.
// The root directory is linked to the prototype project; this script points the
// CLI at the Storybook project through environment variables and swaps in
// vercel.storybook.json for the build settings. It reads the project ids from
// .vercel/storybook.json (gitignored), written once by `vercel link` for that project.
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const linkFile = '.vercel/storybook.json';
if (!existsSync(linkFile)) {
  console.error(
    `${linkFile} is missing. Create it with the Storybook project's ids:\n` +
      '  { "orgId": "<team id>", "projectId": "<project id>" }\n' +
      'Both appear in .vercel/project.json after `vercel link --project clickguard-threat-monitoring-storybook` in a scratch directory.',
  );
  process.exit(1);
}
const { orgId, projectId } = JSON.parse(readFileSync(linkFile, 'utf8'));
const result = spawnSync('vercel', ['deploy', '--prod', '--yes', '--local-config', 'vercel.storybook.json', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env, VERCEL_ORG_ID: orgId, VERCEL_PROJECT_ID: projectId },
});
process.exit(result.status ?? 1);
