const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parsePagination = (query, fallbackLimit = DEFAULT_LIMIT) => {
  const page = parsePositiveInteger(query.page, DEFAULT_PAGE);
  const limit = Math.min(parsePositiveInteger(query.limit, fallbackLimit), MAX_LIMIT);
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
};

const buildPaginationMeta = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
  hasNextPage: page * limit < total,
  hasPreviousPage: page > 1,
});

module.exports = {
  DEFAULT_LIMIT,
  MAX_LIMIT,
  buildPaginationMeta,
  parsePagination,
};
