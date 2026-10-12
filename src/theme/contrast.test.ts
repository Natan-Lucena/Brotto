import { describe, expect, it } from 'vitest';
import { auditContrast, contrastRatio } from './contrast';

// Pares que falham hoje (D-05). Não alteram tokens.ts: viram proposta em
// docs/contracts/auditoria-contraste-primeira-onda.md e aguardam decisão.
const knownFailures = new Set([
  'light:texto secundário sobre fundo',
  'light:texto secundário sobre card',
  'light:borda de plano não selecionado',
  'dark:primary como cor de ícone sobre fundo (evitado nas telas)',
]);

describe('contrast audit (AC-12)', () => {
  it('computes WCAG ratios', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 0);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
  });

  it('only the recorded pairs fail', () => {
    const failures = auditContrast()
      .filter((row) => !row.passes)
      .map((row) => `${row.theme}:${row.use}`);
    expect(new Set(failures)).toEqual(knownFailures);
  });
});
