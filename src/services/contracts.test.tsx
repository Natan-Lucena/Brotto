import { render, screen } from '@testing-library/react-native';
import { describe, expect, it } from 'vitest';
import { Button } from '@/components/ui/Button';
import { AppSelection, MockBlockingService } from '@/services/blocking/BlockingService';
import { migrations } from '@/services/db/migrations';
import { MockPaymentProvider } from '@/services/payments/PaymentProvider';
import { tokens } from '@/theme/tokens';

describe('foundation contracts', () => {
  it('exposes the design token source and a renderable UI component', async () => {
    await render(<Button label="Continuar" />);
    expect(screen.getByText('Continuar')).toBeTruthy();
    expect(tokens.colors.light.primary).toBe('#2F6B4F');
    expect(tokens.radius.card).toBe('24px');
    expect(tokens.typography.h2).toMatchObject({
      fontFamily: 'Nunito',
      fontWeight: '700',
      fontSize: 22,
      lineHeight: 28,
    });
    expect(tokens.typography.tag).toMatchObject({
      fontFamily: 'Inter',
      fontWeight: '600',
      fontSize: 11,
      lineHeight: 14,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    });
  });

  it('keeps payment and blocking mocks safely inactive by default', async () => {
    const payments = new MockPaymentProvider();
    const blocking = new MockBlockingService();
    const selection: AppSelection = {
      apps: [
        {
          id: 'instagram',
          platformRef: 'com.instagram',
          label: 'Instagram',
          enabled: true,
        },
      ],
    };
    expect((await payments.getEntitlement()).active).toBe(false);
    expect(await blocking.getPermissionStatus()).toBe('unavailable');
    expect(await blocking.selectApps()).toMatchObject({ apps: [] });
    await blocking.blockNow(selection);
    await blocking.startFocusBlock(selection, new Date());
    expect(await blocking.selectApps()).toEqual(selection);
    expect((await payments.startCheckout('annual')).copyPaste).toContain(
      'br.gov.bcb.pix',
    );
  });

  it('declares only the required persistence tables in its first migration', () => {
    expect(migrations).toHaveLength(1);
    for (const table of [
      'focus_sessions',
      'schedules',
      'blocked_apps',
      'releases',
      'day_log',
      'app_state',
    ]) {
      expect(migrations[0]).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
    }
  });
});
