import { useCallback, useEffect, useState } from 'react'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Swal from 'sweetalert2'
import { errMsg, successMsg } from '../Utils/helpers'
import adminApi from './adminApi'
import { DataGrid, } from '@mui/x-data-grid'

const ProductReviews = () => {
    const [productId, setProductId] = useState('')
    const [activeProductId, setActiveProductId] = useState('')
    const [listReviews, setListReviews] = useState([])
    const [loading, setLoading] = useState(true)

    // Loads every review by default, or only one product's reviews when a product ID is given.
    const loadReviews = useCallback(async (id = '') => {
        setLoading(true)
        try {
            const { data } = id
                ? await adminApi.get('/reviews', { params: { id } })
                : await adminApi.get('/admin/reviews')
            setListReviews(data.reviews || [])
        } catch (error) {
            setListReviews([])
            errMsg(error.response?.data?.message || error.message || 'Unable to load reviews.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadReviews()
    }, [loadReviews])

    const deleteReview = async (id, reviewProductId) => {
        try {
            const { data } = await adminApi.delete('/reviews', { params: { id, productId: reviewProductId } })
            if (data.success) {
                successMsg('Review deleted successfully')
                await loadReviews(activeProductId)
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
        setActiveProductId(id)
        loadReviews(id)
    }

    const showAllHandler = () => {
        setProductId('')
        setActiveProductId('')
        loadReviews()
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
                        {activeProductId && (
                            <button type="button" className="btn btn-light btn-block py-2 mt-2" onClick={showAllHandler}>
                                SHOW ALL REVIEWS
                            </button>
                        )}
                    </form>
                </div>
                {loading ? <Loader /> : rows.length > 0 ? (
                    <div className="admin-data-grid">
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                            pageSizeOptions={[5, 10, 25]}
                            disableRowSelectionOnClick
                            getRowId={(row) => row.id}
                            showToolbar
                        />
                    </div>
                ) : (
                    <p className="admin-empty-state">
                        {activeProductId ? 'No reviews found for this product.' : 'No reviews have been submitted yet.'}
                    </p>
                )}
            </main>
        </>
    )
}

export default ProductReviews
