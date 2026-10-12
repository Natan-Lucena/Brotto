import { useQuery } from '@tanstack/react-query';
import { paymentProvider } from '@/services/payments';

export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: () => paymentProvider.getPlans(),
  });
}
