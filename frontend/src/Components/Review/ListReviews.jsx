import { useCallback, useState } from 'react'
import InfiniteScrollSentinel from '../Utils/InfiniteScrollSentinel'
import ListPagination from '../Utils/ListPagination'

const ListReviews = ({ reviews }) => {
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 5
    const visibleCount = currentPage * pageSize
    const loadMore = useCallback(() => {
        setCurrentPage(current => Math.min(current + 1, Math.ceil(reviews.length / pageSize)))
    }, [pageSize, reviews.length])

    return (
        <div className="reviews w-75">

            <h3>Other's Reviews:</h3>
            <hr />
            {reviews && reviews.slice((currentPage - 1) * pageSize, visibleCount).map(review => (
                <div key={review._id} className="review-card my-3">
                    <div className="rating-outer">
                        <div className="rating-inner" style={{ width: `${(review.rating / 5) * 100}%` }}></div>
                    </div>
                    <p className="review_user">
                        by {review.name}
                        {review.verifiedPurchase && <span className="verified-purchase-badge">Verified purchase</span>}
                    </p>
                    <p className="review_comment">{review.comment}</p>
                    <hr />
                </div>
            ))}
            <InfiniteScrollSentinel
                hasMore={visibleCount < (reviews?.length || 0)}
                loading={false}
                loadingMore={false}
                onLoadMore={loadMore}
            />
            <ListPagination
                currentPage={currentPage}
                totalCount={reviews?.length || 0}
                pageSize={pageSize}
                onChange={setCurrentPage}
            />
        </div>
    )

}



export default ListReviews