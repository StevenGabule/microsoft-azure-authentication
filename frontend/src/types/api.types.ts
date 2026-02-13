export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  users: T[];
  total: number;
  page: number;
  totalPages: number;
}
