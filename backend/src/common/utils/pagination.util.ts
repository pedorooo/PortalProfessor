/**
 * Pagination parameters - used by all paginated endpoints
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Generic paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Parse and validate pagination query parameters
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10, max: 100)
 * @throws BadRequestException if parameters are invalid
 */
export function parsePaginationParams(
  page: string = '1',
  limit: string = '10',
): PaginationParams {
  const pageNum = Number.parseInt(page, 10);
  const limitNum = Number.parseInt(limit, 10);

  if (Number.isNaN(pageNum) || pageNum < 1) {
    throw new Error('Page must be a positive number');
  }

  if (Number.isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    throw new Error('Limit must be between 1 and 100');
  }

  return { page: pageNum, limit: limitNum };
}

/**
 * Create a paginated response with metadata
 * @param data - Array of items
 * @param total - Total number of items
 * @param page - Current page
 * @param limit - Items per page
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  const pages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages,
      hasNextPage: page < pages,
      hasPreviousPage: page > 1,
    },
  };
}
