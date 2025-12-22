import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('design tokens', () => {
  it('defines core CSS variables in tokens.css', () => {
    const tokensPath = path.resolve(__dirname, '..', 'tokens.css');
    const css = fs.readFileSync(tokensPath, 'utf8');

    const required = [
      '--bg0',
      '--bg1',
      '--surface',
      '--surface-strong',
      '--border',
      '--shadow',
      '--shadow-soft',
      '--shadow-strong',
      '--text',
      '--muted',
      '--primary0',
      '--primary1',
      '--accent',
      '--accent-strong',
      '--accent-weak',
      '--ring'
    ];

    for (const token of required) {
      expect(css).toContain(token);
    }
  });
});

