// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { inspectSuppressions } from './check-suppressions.mjs';

describe('suppression policy', () => {
  it('rejects ts-ignore and unexplained ts-expect-error', () => {
    expect(inspectSuppressions('x.ts', '// @ts-ignore\nvalue;')).toHaveLength(
      1,
    );
    expect(
      inspectSuppressions('x.ts', '// @ts-expect-error\nvalue;'),
    ).toHaveLength(1);
  });

  it('accepts an explained ts-expect-error', () => {
    expect(
      inspectSuppressions(
        'x.ts',
        '// @ts-expect-error -- third-party type is wrong\nvalue;',
      ),
    ).toEqual([]);
  });

  it('requires line-scoped lint suppressions with a rule and reason', () => {
    expect(
      inspectSuppressions('x.ts', '// eslint-disable-next-line\nvalue;'),
    ).toHaveLength(1);
    expect(
      inspectSuppressions('x.ts', '/* eslint-disable */\nvalue;'),
    ).toHaveLength(1);
    expect(
      inspectSuppressions(
        'x.ts',
        '// eslint-disable-next-line no-console -- command output is intentional\nconsole.log();',
      ),
    ).toEqual([]);
  });
});
