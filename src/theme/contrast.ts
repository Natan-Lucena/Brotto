import { tokens } from './tokens';

type Palette = (typeof tokens.colors)['light'];
type Key = keyof Palette;

function channel(value: number) {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => channel(parseInt(hex.slice(i, i + 2), 16)));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

export function contrastRatio(foreground: string, background: string) {
  const [high, low] = [luminance(foreground), luminance(background)].sort(
    (a, b) => b - a,
  );
  return (high! + 0.05) / (low! + 0.05);
}

export type ContrastPair = {
  use: string;
  fg: Key;
  bg: Key;
  min: 4.5 | 3;
  // O Toast usa o texto escuro (`dark.bg`) em ambos os temas.
  fgTheme?: 'dark';
};

// Pares efetivamente usados pelas telas da primeira onda (por tema).
export const contrastPairs: Record<'light' | 'dark', ContrastPair[]> = {
  light: [
    { use: 'texto sobre fundo', fg: 'text', bg: 'bg', min: 4.5 },
    { use: 'texto sobre card', fg: 'text', bg: 'surface', min: 4.5 },
    { use: 'texto secundário sobre fundo', fg: 'textMuted', bg: 'bg', min: 4.5 },
    { use: 'texto secundário sobre card', fg: 'textMuted', bg: 'surface', min: 4.5 },
    { use: 'botão primário', fg: 'surface', bg: 'primary', min: 4.5 },
    { use: 'botão CTA', fg: 'text', bg: 'cta', min: 4.5 },
    { use: 'botão secundário', fg: 'primary', bg: 'primarySoft', min: 4.5 },
    { use: 'tag do StatCard', fg: 'primary', bg: 'surface', min: 4.5 },
    { use: 'texto sobre card suave', fg: 'text', bg: 'primarySoft', min: 4.5 },
    { use: 'borda do plano selecionado', fg: 'primary', bg: 'surface', min: 3 },
    { use: 'borda de plano não selecionado', fg: 'border', bg: 'surface', min: 3 },
    { use: 'toast de erro', fg: 'bg', bg: 'error', min: 4.5, fgTheme: 'dark' },
    { use: 'toast de sucesso', fg: 'bg', bg: 'success', min: 4.5, fgTheme: 'dark' },
  ],
  dark: [
    { use: 'texto sobre fundo', fg: 'text', bg: 'bg', min: 4.5 },
    { use: 'texto sobre card', fg: 'text', bg: 'surface', min: 4.5 },
    { use: 'texto secundário sobre fundo', fg: 'textMuted', bg: 'bg', min: 4.5 },
    { use: 'texto secundário sobre card', fg: 'textMuted', bg: 'surface', min: 4.5 },
    { use: 'botão primário', fg: 'text', bg: 'primary', min: 4.5 },
    { use: 'botão CTA', fg: 'bg', bg: 'cta', min: 4.5 },
    { use: 'chip selecionado', fg: 'text', bg: 'primary', min: 4.5 },
    {
      use: 'tag do StatCard e borda selecionada',
      fg: 'secondary',
      bg: 'surface',
      min: 4.5,
    },
    {
      use: 'indicador de carregamento (secondary) sobre fundo',
      fg: 'secondary',
      bg: 'bg',
      min: 3,
    },
    {
      use: 'primary como cor de ícone sobre fundo (evitado nas telas)',
      fg: 'primary',
      bg: 'bg',
      min: 3,
    },
    { use: 'borda do plano não selecionado', fg: 'border', bg: 'surface', min: 3 },
    { use: 'toast de erro', fg: 'bg', bg: 'error', min: 4.5 },
    { use: 'toast de sucesso', fg: 'bg', bg: 'success', min: 4.5 },
  ],
};

export function auditContrast() {
  return (['light', 'dark'] as const).flatMap((theme) =>
    contrastPairs[theme].map((pair) => {
      const ratio = contrastRatio(
        tokens.colors[pair.fgTheme ?? theme][pair.fg],
        tokens.colors[theme][pair.bg],
      );
      return {
        theme,
        ...pair,
        ratio: Math.round(ratio * 100) / 100,
        passes: ratio >= pair.min,
      };
    }),
  );
}
