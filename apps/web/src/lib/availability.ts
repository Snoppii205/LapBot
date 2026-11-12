import type { AvailabilityStatus } from '@lapbot/contracts';

export function availabilityLabel(status: AvailabilityStatus): string | null {
  if (status === 'in_stock') return 'Còn hàng';
  if (status === 'out_of_stock') return 'Hết hàng';
  return null;
}

export function availabilityClass(status: AvailabilityStatus): string {
  return status === 'in_stock'
    ? 'available'
    : status === 'out_of_stock'
      ? 'unavailable'
      : 'pending-stock';
}
