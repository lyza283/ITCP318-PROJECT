function parseDateRange(query) {
    const { startDate, endDate } = query;
    const range = {};
    if (startDate) {
        const date = new Date(`${startDate}T00:00:00.000Z`);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)
            || Number.isNaN(date.getTime())
            || date.toISOString().slice(0, 10) !== startDate) {
            throw new Error('Start date must use YYYY-MM-DD format.');
        }
        range.$gte = date;
    }
    if (endDate) {
        const date = new Date(`${endDate}T23:59:59.999Z`);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)
            || Number.isNaN(date.getTime())
            || date.toISOString().slice(0, 10) !== endDate) {
            throw new Error('End date must use YYYY-MM-DD format.');
        }
        range.$lte = date;
    }
    if (range.$gte && range.$lte && range.$gte > range.$lte) {
        throw new Error('Start date cannot be after end date.');
    }
    return range;
}

function completedSalesPipeline(dateRange) {
    const pipeline = [
        {
            $addFields: {
                salesDate: {
                    $ifNull: ['$completedAt', { $ifNull: ['$deliveredAt', '$paidAt'] }]
                }
            }
        },
        { $match: { orderStatus: { $in: ['Completed', 'Delivered'] } } }
    ];
    if (Object.keys(dateRange).length) {
        pipeline.push({ $match: { salesDate: dateRange } });
    }
    return pipeline;
}

module.exports = { parseDateRange, completedSalesPipeline };
