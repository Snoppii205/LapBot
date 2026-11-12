export function catalogImageUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/api/v1/catalog/images/') ||
    trimmed.startsWith('/api/v1/catalog/uploads/') ||
    trimmed.startsWith('/assets/')
  ) {
    return trimmed;
  }
  return null;
}
