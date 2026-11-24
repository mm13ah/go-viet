import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

export function inspectSuppressions(file, source) {
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const comments = new Map();
  const jsxText = [];
  const remember = (start, end) => comments.set(start, end);
  function visit(node) {
    if (ts.isJsxText(node)) {
      jsxText.push([node.pos, node.end]);
      return;
    }
    ts.forEachLeadingCommentRange(source, node.pos, remember);
    ts.forEachTrailingCommentRange(source, node.pos, remember);
    for (const child of node.getChildren(tree)) visit(child);
  }
  visit(tree);

  const findings = [];
  const report = (position, remedy) => {
    const { line, character } = tree.getLineAndCharacterOfPosition(position);
    findings.push(`${file}:${line + 1}:${character + 1}: ${remedy}`);
  };

  for (const { range } of tree.commentDirectives ?? []) {
    const start = source.indexOf('@ts-', range.pos);
    const directive = source
      .slice(start, range.end)
      .replace(/\*\/$/u, '')
      .trimEnd();
    if (directive.startsWith('@ts-ignore')) {
      report(range.pos, 'fix the error or use @ts-expect-error with a reason');
    } else if (
      !/^[\s:;.-]+[^\s:;.-]/u.test(directive.slice('@ts-expect-error'.length))
    ) {
      report(range.pos, 'describe why this @ts-expect-error is needed');
    }
  }

  for (const [start, end] of comments) {
    if (jsxText.some(([from, to]) => start >= from && start < to)) continue;
    const directive = source
      .slice(start + 2, end)
      .replace(/\*\/$/u, '')
      .trim();
    const eslint = /^eslint-disable(-line|-next-line)?\b(?!-)([\s\S]*)$/u.exec(
      directive,
    );
    if (!eslint) continue;
    const [rules, reason] = eslint[2].trim().split(/(?:^|\s+)--(?:\s+|$)/u, 2);
    if (!eslint[1]) {
      report(
        start,
        'use a line-scoped lint disable naming the rule with a reason after --',
      );
    } else if (!rules.trim() || !reason?.trim()) {
      report(start, 'name the disabled lint rule and add a reason after --');
    }
  }
  return findings;
}

function run() {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const baseline = JSON.parse(
    readFileSync(
      new URL('./suppression-baseline.json', import.meta.url),
      'utf8',
    ),
  );
  const tracked = execFileSync(
    'git',
    ['ls-files', '-z', '--cached', '--others', '--exclude-standard'],
    { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 },
  ).split('\0');
  const findings = [];

  for (const file of new Set(tracked)) {
    if (
      !/\.[cm]?[jt]sx?$/u.test(file) ||
      /^(coverage|dist)\//u.test(file) ||
      !existsSync(root + file)
    )
      continue;
    const current = inspectSuppressions(
      file,
      readFileSync(root + file, 'utf8'),
    );
    const expected = new Set(baseline[file] ?? []);
    for (const finding of current) {
      if (!expected.delete(finding)) findings.push(finding);
    }
    for (const stale of expected)
      findings.push(`${file}: remove stale suppression baseline: ${stale}`);
  }

  if (findings.length) {
    console.error(findings.join('\n'));
    process.exitCode = 1;
  } else {
    console.log('Suppression policy passed.');
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) run();
