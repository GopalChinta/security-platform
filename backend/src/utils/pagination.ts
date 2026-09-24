import { PaginationMeta } from '../types/common';

export interface ParsedPagination {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

export function parsePagination(
  rawPage?: unknown,
  rawLimit?: unknown,
  defaultLimit = 10,
  maxLimit = 100
): ParsedPagination {
  let page = parseInt(String(rawPage), 10);
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  let limit = parseInt(String(rawLimit), 10);
  if (isNaN(limit) || limit < 1) {
    limit = defaultLimit;
  } else if (limit > maxLimit) {
    limit = maxLimit;
  }

  const skip = (page - 1) * limit;
  const take = limit;

  return { page, limit, skip, take };
}

export function createPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    page,
    limit,
    total,
    totalPages,
  };
}
