class APIFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
        this.filters = {};
    }

    search() {
        const keyword = this.queryStr.keyword?.trim();
        if (keyword) {
            const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            this.filters.name = { $regex: escapedKeyword, $options: 'i' };
        }

        return this;
    }

    filter() {
        const minPrice = this.queryStr['price[gte]'];
        const maxPrice = this.queryStr['price[lte]'];
        const minRating = this.queryStr['rating[gte]'];
        const category = this.queryStr.category?.trim();
        const hasReviews = this.queryStr.hasReviews;

        const price = {};
        if (minPrice !== undefined && minPrice !== '') {
            price.$gte = this.parseNonNegativeNumber(minPrice, 'Minimum price');
        }
        if (maxPrice !== undefined && maxPrice !== '') {
            price.$lte = this.parseNonNegativeNumber(maxPrice, 'Maximum price');
        }
        if (price.$gte !== undefined && price.$lte !== undefined && price.$gte > price.$lte) {
            throw Object.assign(new Error('Minimum price cannot exceed maximum price.'), { statusCode: 400 });
        }
        if (Object.keys(price).length) {
            this.filters.price = price;
        }

        if (minRating !== undefined && minRating !== '') {
            const rating = this.parseNonNegativeNumber(minRating, 'Minimum rating');
            if (rating > 5) {
                throw Object.assign(new Error('Minimum rating must be between 0 and 5.'), { statusCode: 400 });
            }
            this.filters.ratings = { $gte: rating };
        }

        if (category) {
            this.filters.category = category;
        }

        if (hasReviews === 'true') {
            this.filters.numOfReviews = { $gt: 0 };
        } else if (hasReviews === 'false') {
            this.filters.numOfReviews = 0;
        } else if (hasReviews !== undefined && hasReviews !== '') {
            throw Object.assign(new Error('Review filter must be true or false.'), { statusCode: 400 });
        }

        this.query = this.query.find(this.filters);
        return this;
    }

    pagination(resPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        if (!Number.isInteger(currentPage) || currentPage < 1) {
            throw Object.assign(new Error('Page must be a positive integer.'), { statusCode: 400 });
        }

        this.query = this.query.limit(resPerPage).skip(resPerPage * (currentPage - 1));
        return this;
    }

    parseNonNegativeNumber(value, label) {
        const number = Number(value);
        if (!Number.isFinite(number) || number < 0) {
            throw Object.assign(new Error(`${label} must be a non-negative number.`), { statusCode: 400 });
        }
        return number;
    }
}

module.exports = APIFeatures;
