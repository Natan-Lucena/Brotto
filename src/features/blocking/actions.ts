import { blockingService } from '@/services/blocking';
import type { SelectedApp } from '@/services/blocking';
import { appStateRepository, blockedAppsRepository } from '@/services/db';

// Ordem: serviço, depois persistência; falha na persistência desfaz o serviço.
export async function activateInitialBlock(apps: SelectedApp[]) {
  // Estado anterior lido antes de qualquer efeito, para o rollback ser fiel.
  const previousActive = await appStateRepository.get('block.active');
  const previousApps = await blockedAppsRepository.list();
  await blockingService.blockNow({ apps });
  try {
    await blockedAppsRepository.replace(apps);
    await appStateRepository.set('block.active', 'true');
    await appStateRepository.set('onboarding.completed', 'true');
  } catch (error) {
    // Cada passo do desfazer é independente: um que falhe não impede os outros.
    await blockedAppsRepository.replace(previousApps).catch(() => undefined);
    await appStateRepository
      .set('block.active', previousActive ?? 'false')
      .catch(() => undefined);
    const restore =
      previousActive === 'true' && previousApps.length > 0
        ? blockingService.blockNow({ apps: previousApps })
        : blockingService.unblock();
    await restore.catch(() => undefined);
    throw error;
  }
}

export async function setBlockActive(active: boolean, apps: SelectedApp[]) {
  if (active) await blockingService.blockNow({ apps });
  else await blockingService.unblock();
  await appStateRepository.set('block.active', String(active));
}
