const DEFAULT_PAGE_SIZE = 5;
const MAX_PAGE_SIZE = 100;

function getPagination(query, defaultPageSize = DEFAULT_PAGE_SIZE) {
    const page = query.page === undefined ? 1 : Number(query.page);
    const limit = query.limit === undefined ? defaultPageSize : Number(query.limit);

    if (!Number.isInteger(page) || page < 1) {
        throw Object.assign(new Error('Page must be a positive integer.'), { statusCode: 400 });
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PAGE_SIZE) {
        throw Object.assign(new Error(`Limit must be an integer between 1 and ${MAX_PAGE_SIZE}.`), { statusCode: 400 });
    }

    return { page, limit, skip: (page - 1) * limit };
}

function paginationMetadata(totalCount, page, limit) {
    return {
        page,
        resPerPage: limit,
        totalCount,
        hasMore: page * limit < totalCount
    };
}

module.exports = { getPagination, paginationMetadata };
