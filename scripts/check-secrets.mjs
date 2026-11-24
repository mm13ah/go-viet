import { spawnSync } from 'node:child_process';

const IMAGE =
  'ghcr.io/gitleaks/gitleaks:v8.30.1@sha256:c00b6bd0aeb3071cbcb79009cb16a60dd9e0a7c60e2be9ab65d25e6bc8abbb7f';

const [mode, value] = process.argv.slice(2);
const scan =
  mode === '--staged'
    ? ['git', '--pre-commit', '--staged']
    : mode === '--range' && value
      ? /^0+\.\./u.test(value)
        ? ['git']
        : ['git', `--log-opts=${value}`]
      : mode === undefined
        ? ['git']
        : null;

if (!scan) {
  console.error(
    'Usage: node scripts/check-secrets.mjs [--staged | --range <git-range>]',
  );
  process.exit(2);
}

const flags = [
  '--no-banner',
  '--redact',
  '--no-color',
  '--config=.gitleaks.toml',
];
const has = (command) =>
  spawnSync(command, ['--version'], { stdio: 'ignore' }).status === 0;

let command;
if (has('gitleaks')) {
  command = ['gitleaks', [...scan, ...flags, '.']];
} else if (has('docker')) {
  command = [
    'docker',
    [
      'run',
      '--rm',
      '--network=none',
      '-v',
      `${process.cwd()}:/repo`,
      '-w',
      '/repo',
      '--env',
      'GIT_CONFIG_COUNT=1',
      '--env',
      'GIT_CONFIG_KEY_0=safe.directory',
      '--env',
      'GIT_CONFIG_VALUE_0=/repo',
      IMAGE,
      ...scan,
      ...flags,
      '/repo',
    ],
  ];
} else {
  console.error('Secret scan could not run: install gitleaks or Docker.');
  process.exit(2);
}

const result = spawnSync(command[0], command[1], { stdio: 'inherit' });
if (result.status !== 0) {
  console.error(
    'Secret scan failed. Remove the value and load it from the environment; rotate any pushed credential.',
  );
}
process.exit(result.status ?? 2);
