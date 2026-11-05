import { useCallback } from 'react'
import { Link } from 'react-router-dom'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import adminApi from './adminApi'
import InfiniteDataGrid from '../Utils/InfiniteDataGrid'
import InfiniteScrollSentinel from '../Utils/InfiniteScrollSentinel'
import ListPagination from '../Utils/ListPagination'
import useInfiniteRecords from '../Utils/useInfiniteRecords'
import { PAGE_SIZE } from '../Utils/pagination'

const OrdersList = () => {
    const errMsg = (message = '') => toast.error(message, {
        position: 'bottom-right'
    });
    const successMsg = (message = '') => toast.success(message, {
        position: 'bottom-right'
    });

    const fetchPage = useCallback(async page => {
        const { data } = await adminApi.get('/admin/orders', { params: { page, limit: PAGE_SIZE } })
        return data
    }, [])
    const onLoadError = useCallback(error => {
        toast.error(error.response?.data?.message || error.message || 'Unable to load orders.', {
            position: 'bottom-right'
        })
    }, [])
    const {
        records: allOrders,
        loading,
        loadingMore,
        hasMore,
        failed,
        currentPage,
        totalCount,
        pageSize,
        loadMore,
        goToPage,
        removeRecord
    } = useInfiniteRecords(fetchPage, 'orders', true, onLoadError)

    const deleteOrder = async (id) => {
        try {
            const { data } = await adminApi.delete(`/admin/order/${id}`)
            if (data.success) {
                removeRecord(id, order => order._id)
                successMsg('Order deleted successfully')
            }
        } catch (error) {
            errMsg(error.response?.data?.message || error.message || 'Unable to delete order.')
        }
    }

    const deleteOrderHandler = (id) => {
        deleteOrder(id)
    }

    const columns = [
        {
            field: 'id',
            headerName: 'Order ID',
            flex: 1,
            renderCell: (params) => <span style={{ wordBreak: 'break-all' }}>{params.value}</span>
        },
        {
            field: 'numofItems',
            headerName: 'Number of Items',
            flex: 1,
            minWidth: 170
        },
        {
            field: 'amount',
            headerName: 'Amount',
            flex: 1,
            minWidth: 170
        },
        {
            field: 'status',
            headerName: 'Status',
            flex: 1,
            minWidth: 170
        },

        {
            field: 'actions',
            headerName: 'Actions',
            flex: 1,
            minWidth: 170,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <>
                    <Link to={`/admin/order/${params.id}`} className="btn btn-primary py-1 px-2" aria-label={`View order ${params.id}`}>
                        <i className="fa fa-eye" aria-hidden="true"></i>
                    </Link>
                    <button type="button" className="btn btn-danger py-1 px-2 ml-2" onClick={() => deleteOrderHandler(params.id)} aria-label={`Delete order ${params.id}`}>
                        <i className="fa fa-trash" aria-hidden="true"></i>
                    </button>
                </>
            )
        }
    ];
    const rows = allOrders.map(order => ({
        id: order._id,
        numofItems: order.orderItems.length,
        amount: `₱${Number(order.totalPrice).toFixed(2)}`,
        status: order.orderStatus,
    }));

    return (
        <>
            <MetaData title={'All Orders'} />
            <main className="admin-page-content">
                <h1 className="admin-page-title">All Orders</h1>
                {loading ? <Loader /> : (
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
                )}
                {!loading && (
                    <ListPagination
                        currentPage={currentPage}
                        totalCount={totalCount}
                        pageSize={pageSize}
                        disabled={loading}
                        onChange={goToPage}
                    />
                )}
                {!loading && (
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

export default OrdersList