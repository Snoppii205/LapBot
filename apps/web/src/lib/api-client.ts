import type { ApiError } from '@lapbot/contracts';

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fieldErrors?: Record<string, string>
  ) {
    super(message);
  }
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    credentials: 'same-origin',
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers
    }
  });
  const value: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const issue = value as ApiError | null;
    throw new ApiClientError(
      response.status,
      issue?.error?.code ?? 'NETWORK_ERROR',
      issue?.error?.message ?? 'Không thể tải dữ liệu.',
      issue?.error?.field_errors
    );
  }
  return value as T;
}
