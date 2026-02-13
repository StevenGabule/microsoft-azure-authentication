import { AxiosError } from 'axios';
import { ApiError } from '@/types';

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError | undefined;
    if (data?.message) {
      return Array.isArray(data.message)
        ? data.message[0]
        : data.message;
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

export function isAuthError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 401;
  }
  return false;
}

export function isForbiddenError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 403;
  }
  return false;
}
