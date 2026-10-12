import type { SelectedApp } from '@/services/blocking';

// Catálogo provisório (D-06/D-07): sem ícones reais até existir o serviço nativo.
export const distractionCatalog = [
  { id: 'tiktok', label: 'TikTok' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'x', label: 'X (Twitter)' },
  { id: 'kwai', label: 'Kwai' },
] as const;

export const defaultDistractionIds: string[] = ['tiktok', 'instagram'];

export function toSelectedApps(ids: readonly string[]): SelectedApp[] {
  return distractionCatalog
    .filter(({ id }) => ids.includes(id))
    .map(({ id, label }) => ({
      id,
      platformRef: `provisional:${id}`,
      label,
      enabled: true,
    }));
}
