import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { parsePaginationParams } from '../utils/pagination.util';
import type { PaginationParams } from '../utils/pagination.util';

/**
 * Decorator to automatically parse and validate pagination parameters
 * Usage: @Pagination() pagination: PaginationParams
 */
export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PaginationParams => {
    const request = ctx.switchToHttp().getRequest();
    const { page, limit } = request.query;

    try {
      return parsePaginationParams(page, limit);
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  },
);
