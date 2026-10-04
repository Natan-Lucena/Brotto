export type PlanId = 'weekly' | 'monthly' | 'annual';
export interface Plan {
  id: PlanId;
  label: string;
  price: number;
  currency: 'BRL';
  trialDays: number;
}
export interface CheckoutSession {
  id: string;
  qrCode: string;
  copyPaste: string;
  expiresAt: string;
}
export interface Entitlement {
  active: boolean;
  planId: PlanId | null;
  expiresAt: string | null;
}
export interface PaymentProvider {
  getPlans(): Promise<Plan[]>;
  startCheckout(planId: PlanId): Promise<CheckoutSession>;
  getEntitlement(): Promise<Entitlement>;
  restore(): Promise<Entitlement>;
}
export const plans: Plan[] = [
  { id: 'weekly', label: 'Semanal', price: 9.9, currency: 'BRL', trialDays: 0 },
  { id: 'monthly', label: 'Mensal', price: 19.9, currency: 'BRL', trialDays: 0 },
  { id: 'annual', label: 'Anual', price: 99.9, currency: 'BRL', trialDays: 3 },
];
const activeByDevFlag = process.env.EXPO_PUBLIC_DEV_ACTIVE_ENTITLEMENT === 'true';
export class MockPaymentProvider implements PaymentProvider {
  async getPlans() {
    return plans;
  }
  async startCheckout(planId: PlanId) {
    return {
      id: `mock-${planId}`,
      qrCode: 'mock-pix-qr',
      copyPaste: '00020101021226850014br.gov.bcb.pix',
      expiresAt: new Date(Date.now() + 1800000).toISOString(),
    };
  }
  async getEntitlement(): Promise<Entitlement> {
    return {
      active: activeByDevFlag,
      planId: activeByDevFlag ? 'annual' : null,
      expiresAt: null,
    };
  }
  async restore() {
    return this.getEntitlement();
  }
}
export const paymentProvider: PaymentProvider = new MockPaymentProvider();
