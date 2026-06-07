import type { PaginatedResponse, PaginationMeta } from "../types";

export const getPaginatedItems = <T>(value: T[] | PaginatedResponse<T>) =>
  Array.isArray(value) ? value : value.items;

export const getPaginationMeta = <T>(value: T[] | PaginatedResponse<T>): PaginationMeta | null =>
  Array.isArray(value) ? null : value.pagination;
