// @vitest-environment node
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { findStructureViolations } from './check-structure.mjs';

const roots = [];
const fixture = (files) => {
  const root = join(
    process.env.TMPDIR ?? '/tmp',
    `go-viet-structure-${crypto.randomUUID()}`,
  );
  roots.push(root);
  for (const [path, content] of Object.entries(files)) {
    const target = join(root, path);
    mkdirSync(join(target, '..'), { recursive: true });
    writeFileSync(target, content);
  }
  return root;
};

afterEach(async () => {
  const { rm } = await import('node:fs/promises');
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

describe('folder structure policy', () => {
  it('accepts a component with complete barrels', () => {
    const root = fixture({
      'src/components/atoms/index.ts': "export * from './Button';\n",
      'src/components/atoms/Button/index.ts': "export * from './Button';\n",
      'src/components/atoms/Button/Button.tsx':
        'export const Button = () => null;\n',
      'src/components/atoms/Button/Button.test.tsx': '',
      'src/components/atoms/Button/Button.stories.tsx': '',
    });
    expect(findStructureViolations(root)).toEqual([]);
  });

  it('rejects unknown layers and loose component files', () => {
    const root = fixture({
      'src/components/widgets/Card/Card.tsx': '',
      'src/components/atoms/Loose.tsx': '',
    });
    expect(findStructureViolations(root).join('\n')).toMatch(
      /unknown layer|own folder/u,
    );
  });

  it('requires PascalCase folders, source, test, story, and exact barrels', () => {
    const root = fixture({
      'src/components/atoms/index.ts': "export * from './Gone';\n",
      'src/components/atoms/button/index.ts': "export * from './Other';\n",
    });
    const result = findStructureViolations(root).join('\n');
    expect(result).toMatch(/PascalCase/u);
    expect(result).toMatch(/add button[.]tsx/u);
    expect(result).toMatch(/button[.]test[.]tsx/u);
    expect(result).toMatch(/button[.]stories[.]tsx/u);
    expect(result).toMatch(/export every component folder exactly once/u);
    expect(result).toMatch(/component barrel/u);
  });

  it('requires stories only for atoms and molecules', () => {
    const root = fixture({
      'src/components/organisms/index.ts': "export * from './Trainer';\n",
      'src/components/organisms/Trainer/index.ts':
        "export * from './Trainer';\n",
      'src/components/organisms/Trainer/Trainer.tsx': '',
      'src/components/organisms/Trainer/Trainer.test.tsx': '',
    });
    expect(findStructureViolations(root)).toEqual([]);
  });
});
