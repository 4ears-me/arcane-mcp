export interface PaginationParams {
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  start?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    total: number;
    start: number;
    limit: number;
  };
}

export interface MessageResponse {
  success: boolean;
  message: string;
}