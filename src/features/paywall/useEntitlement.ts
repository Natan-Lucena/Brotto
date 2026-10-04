import { useQuery } from '@tanstack/react-query';
import { paymentProvider } from '@/services/payments';
export function useEntitlement() {
  return useQuery({
    queryKey: ['entitlement'],
    queryFn: () => paymentProvider.getEntitlement(),
  });
}
