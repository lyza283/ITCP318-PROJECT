import { useCallback, useState } from 'react'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Swal from 'sweetalert2'
import { errMsg, successMsg } from '../Utils/helpers'
import adminApi from './adminApi'
import InfiniteDataGrid from '../Utils/InfiniteDataGrid'
import InfiniteScrollSentinel from '../Utils/InfiniteScrollSentinel'
import ListPagination from '../Utils/ListPagination'
import useInfiniteRecords from '../Utils/useInfiniteRecords'
import { PAGE_SIZE } from '../Utils/pagination'

const ProductReviews = () => {
    const [productId, setProductId] = useState('')
    const [searchedProductId, setSearchedProductId] = useState('')

    const fetchPage = useCallback(async page => {
        const endpoint = searchedProductId ? '/reviews' : '/admin/reviews'
        const params = { page, limit: PAGE_SIZE }
        if (searchedProductId) params.id = searchedProductId
        const { data } = await adminApi.get(endpoint, { params })
        return data
    }, [searchedProductId])
    const onLoadError = useCallback(error => {
        errMsg(error.response?.data?.message || error.message || 'Unable to load reviews.')
    }, [])
    const {
        records: listReviews,
        loading,
        loadingMore,
        hasMore,
        failed,
        currentPage,
        totalCount,
        pageSize,
        loadMore,
        goToPage,
        reload,
        removeRecord
    } = useInfiniteRecords(fetchPage, 'reviews', true, onLoadError)

    const deleteReview = async (id, reviewProductId) => {
        try {
            const { data } = await adminApi.delete('/reviews', { params: { id, productId: reviewProductId } })
            if (data.success) {
                removeRecord(id, review => review._id)
                successMsg('Review deleted successfully')
                await reload()
            }
        } catch (error) {
            errMsg(error.response?.data?.message || error.message || 'Unable to delete review.')
        }
    }

    const deleteReviewHandler = (id, reviewProductId) => {
        Swal.fire({
            title: 'Delete Review',
            icon: 'info',
            text: 'Do you want to delete this review',
            confirmButtonText: 'Delete',
            showCancelButton: true
        }).then((result) => {
            if (result.isConfirmed) {
                deleteReview(id, reviewProductId)
            }
        })
    }

    const submitHandler = (e) => {
        e.preventDefault();
        const id = productId.trim()
        if (id === searchedProductId) reload()
        else setSearchedProductId(id)
    }

    const showAllHandler = () => {
        setProductId('')
        if (searchedProductId) setSearchedProductId('')
        else reload()
    }

    const columns = [
        {
            field: 'productName',
            headerName: 'Product',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'rating',
            headerName: 'Rating',
            width: 100,
            type: 'number',
        },
        {
            field: 'comment',
            headerName: 'Comment',
            flex: 2,
            minWidth: 220,
        },
        {
            field: 'name',
            headerName: 'Customer',
            width: 150,
        },
        {
            field: 'verifiedPurchase',
            headerName: 'Verified',
            width: 100,
            renderCell: (params) => (params.value ? 'Yes' : 'No')
        },
        {
            field: 'id',
            headerName: 'Review ID',
            width: 220,
            renderCell: (params) => <span style={{ wordBreak: 'break-all' }}>{params.value}</span>
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <button
                    className="btn btn-danger py-1 px-2"
                    onClick={() => deleteReviewHandler(params.row.id, params.row.productId)}
                >
                    <i className="fa fa-trash"></i>
                </button>
            )
        }
    ];

    const rows = listReviews.map(review => ({
        id: review._id,
        productId: review.productId,
        productName: review.productName,
        comment: review.comment,
        rating: review.rating,
        name: review.name,
        verifiedPurchase: review.verifiedPurchase,
    }));

    return (
        <>
            <MetaData title={'Product Reviews'} />
            <main className="admin-page-content">
                <h1 className="admin-page-title">Product Reviews</h1>
                <div className="review-search-panel">
                    <form onSubmit={submitHandler}>
                        <div className="form-group">
                            <label htmlFor="productId_field">Filter by Product ID (optional)</label>
                            <input
                                type="text"
                                id="productId_field"
                                className="form-control"
                                value={productId}
                                onChange={(e) => setProductId(e.target.value)}
                            />
                        </div>
                        <button
                            id="search_button"
                            type="submit"
                            className="btn btn-primary btn-block py-2"
                        >
                            SEARCH REVIEWS
                        </button>
                        {searchedProductId && (
                            <button type="button" className="btn btn-light btn-block py-2 mt-2" onClick={showAllHandler}>
                                SHOW ALL REVIEWS
                            </button>
                        )}
                    </form>
                </div>
                {loading ? <Loader /> : rows.length > 0 ? (
                    <div className="admin-data-grid">
                        <InfiniteDataGrid
                            rows={rows}
                            columns={columns}
                            hasMore={hasMore}
                            loadingMore={loadingMore}
                            onLoadMore={loadMore}
                            disableRowSelectionOnClick
                            getRowId={(row) => row.id}
                            showToolbar
                        />
                    </div>
                ) : (
                    <p className="admin-empty-state">
                        {searchedProductId ? 'No reviews found for this product.' : 'No reviews have been submitted yet.'}
                    </p>
                )}
                {!loading && totalCount > 0 && (
                    <ListPagination
                        currentPage={currentPage}
                        totalCount={totalCount}
                        pageSize={pageSize}
                        disabled={loading}
                        onChange={goToPage}
                    />
                )}
                {!loading && totalCount > 0 && (
                    <InfiniteScrollSentinel
                        hasMore={hasMore}
                        loading={false}
                        loadingMore={loadingMore}
                        failed={failed}
                        observeWindowScroll={false}
                        onLoadMore={loadMore}
                    />
                )}
            </main>
        </>
    )
}

export default ProductReviews
