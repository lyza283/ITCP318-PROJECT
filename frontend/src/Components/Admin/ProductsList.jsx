import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import adminApi from './adminApi'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import InfiniteDataGrid from '../Utils/InfiniteDataGrid'
import InfiniteScrollSentinel from '../Utils/InfiniteScrollSentinel'
import ListPagination from '../Utils/ListPagination'
import useInfiniteRecords from '../Utils/useInfiniteRecords'
import { PAGE_SIZE } from '../Utils/pagination'

const ProductsList = () => {
    const [selectedIds, setSelectedIds] = useState([])
    const [deleting, setDeleting] = useState(false)

    const fetchPage = useCallback(async page => {
        const { data } = await adminApi.get('/admin/products', { params: { page, limit: PAGE_SIZE } })
        return data
    }, [])
    const onLoadError = useCallback(error => {
        toast.error(error.response?.data?.message || error.message || 'Unable to load products.', {
            position: 'bottom-right'
        })
    }, [])
    const {
        records: products,
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
    } = useInfiniteRecords(fetchPage, 'products', true, onLoadError)

    const loadProducts = async () => {
        const loaded = await reload()
        if (loaded) setSelectedIds([])
    }

    const deleteProduct = async (id) => {
        try {
            const { data } = await adminApi.delete(`/admin/product/${id}`)
            removeRecord(id)
            setSelectedIds(current => current.filter(selectedId => selectedId !== id))
            toast.success('Product deleted successfully.', { position: 'bottom-right' })
            if (data.imageCleanupWarning) {
                toast.warning('The product was deleted, but its image files could not all be removed from storage.', {
                    position: 'bottom-right'
                })
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Unable to delete product.', {
                position: 'bottom-right'
            })
        }
    }

    const deleteSelectedProducts = async () => {
        if (!selectedIds.length) return
        if (!window.confirm(`Delete ${selectedIds.length} selected product(s)? This cannot be undone.`)) return

        setDeleting(true)
        try {
            const { data } = await adminApi.delete('/admin/products', { data: { ids: selectedIds } })
            selectedIds.forEach(id => removeRecord(id))
            setSelectedIds([])
            toast.success(`${data.deletedCount} product(s) deleted.`, { position: 'bottom-right' })
            if (data.imageCleanupWarning) {
                toast.warning('Some image files could not be removed from storage.', { position: 'bottom-right' })
            }
        } catch (error) {
            const missingBulkRoute = error.response?.status === 404
                && typeof error.response.data === 'string'
            if (missingBulkRoute) {
                const results = await Promise.allSettled(
                    selectedIds.map(id => adminApi.delete(`/admin/product/${id}`))
                )
                const deletedIds = selectedIds.filter((_, index) => results[index].status === 'fulfilled')
                const failedCount = results.length - deletedIds.length
                deletedIds.forEach(id => removeRecord(id))
                setSelectedIds(current => current.filter(id => !deletedIds.includes(id)))

                if (failedCount === 0) {
                    toast.success(
                        `${deletedIds.length} product(s) deleted. Restart the backend to enable the bulk-delete endpoint.`,
                        { position: 'bottom-right', autoClose: 7000 }
                    )
                } else {
                    toast.error(
                        `${deletedIds.length} product(s) deleted; ${failedCount} could not be deleted. Refresh the list and retry.`,
                        { position: 'bottom-right', autoClose: 7000 }
                    )
                }
                return
            }

            toast.error(error.response?.data?.message || error.message || 'Unable to delete selected products.', {
                position: 'bottom-right'
            })
            if (error.response?.status === 404) await loadProducts()
        } finally {
            setDeleting(false)
        }
    }

    const columns = [
        {
            field: 'select',
            headerName: '',
            width: 56,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderHeader: () => (
                <input
                    type="checkbox"
                    aria-label="Select all products"
                    checked={products.length > 0 && selectedIds.length === products.length}
                    onChange={(event) => setSelectedIds(event.target.checked ? products.map(product => product._id) : [])}
                />
            ),
            renderCell: (params) => (
                <input
                    type="checkbox"
                    aria-label={`Select ${params.row.name}`}
                    checked={selectedIds.includes(params.row.id)}
                    onChange={(event) => setSelectedIds(current => (
                        event.target.checked
                            ? [...current, params.row.id]
                            : current.filter(id => id !== params.row.id)
                    ))}
                />
            )
        },
        {
            field: 'id',
            headerName: 'Product ID',
            flex: 1,
            minWidth: 180,
            renderCell: (params) => <span style={{ wordBreak: 'break-all' }}>{params.value}</span>
        },
        { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
        { field: 'price', headerName: 'Price', width: 110 },
        { field: 'stock', headerName: 'Stock', width: 90 },
        {
            field: 'ratings',
            headerName: 'Rating',
            width: 105,
            valueFormatter: value => `${Number(value || 0).toFixed(1)} / 5`
        },
        { field: 'numOfReviews', headerName: 'Reviews', width: 95 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 115,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <>
                    <Link to={`/admin/product/${params.id}`} className="btn btn-primary py-1 px-2" aria-label={`Edit ${params.row.name}`}>
                        <i className="fa fa-pencil" aria-hidden="true"></i>
                    </Link>
                    <button type="button" className="btn btn-danger py-1 px-2 ml-2" onClick={() => deleteProduct(params.id)} aria-label={`Delete ${params.row.name}`}>
                        <i className="fa fa-trash" aria-hidden="true"></i>
                    </button>
                </>
            )
        }
    ]

    const rows = products.map(product => ({
        id: product._id,
        name: product.name,
        price: `₱${Number(product.price).toFixed(2)}`,
        stock: product.stock,
        ratings: product.ratings,
        numOfReviews: product.numOfReviews,
    }))

    return (
        <>
            <MetaData title="All Products" />
            <main className="admin-page-content">
                <div className="admin-page-heading">
                    <div>
                        <h1 className="admin-page-title">All Products</h1>
                    </div>
                    <Link to="/admin/product" className="btn btn-primary">Add product</Link>
                </div>

                {loading ? <Loader /> : (
                    <>
                        <div className="admin-table-actions">
                            <span>{selectedIds.length} selected</span>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={deleteSelectedProducts}
                                disabled={!selectedIds.length || deleting}
                            >
                                {deleting ? 'Deleting…' : 'Delete selected'}
                            </button>
                        </div>
                        <div className="admin-data-grid">
                            <InfiniteDataGrid
                                rows={rows}
                                columns={columns}
                                hasMore={hasMore}
                                loadingMore={loadingMore}
                                onLoadMore={loadMore}
                                disableSelectionOnClick
                                getRowId={(row) => row.id}
                                showToolbar
                            />
                        </div>
                        <ListPagination
                            currentPage={currentPage}
                            totalCount={totalCount}
                            pageSize={pageSize}
                            disabled={loading}
                            onChange={goToPage}
                        />
                        <InfiniteScrollSentinel
                            hasMore={hasMore}
                            loading={false}
                            loadingMore={loadingMore}
                            failed={failed}
                            observeWindowScroll={false}
                            onLoadMore={loadMore}
                        />
                    </>
                )}
            </main>
        </>
    )
}

export default ProductsList
