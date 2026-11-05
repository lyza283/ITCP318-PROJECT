import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { getToken } from '../Utils/helpers'
import axios from 'axios'
import InfiniteDataGrid from '../Utils/InfiniteDataGrid'
import InfiniteScrollSentinel from '../Utils/InfiniteScrollSentinel'
import ListPagination from '../Utils/ListPagination'
import useInfiniteRecords from '../Utils/useInfiniteRecords'
import { PAGE_SIZE } from '../Utils/pagination'

import { Button } from '@mui/material'

const ListOrders = () => {
    const fetchPage = useCallback(async page => {
        const { data } = await axios.get(`${import.meta.env.VITE_API}/orders/me`, {
            params: { page, limit: PAGE_SIZE },
            withCredentials: true
        })
        return data
    }, [])
    const onLoadError = useCallback(error => {
        toast.error(error.response?.data?.message || error.message || 'Unable to load orders.', {
            position: 'bottom-right'
        })
    }, [])
    const {
        records: orders,
        loading,
        loadingMore,
        hasMore,
        failed,
        currentPage,
        totalCount,
        pageSize,
        loadMore,
        goToPage
    } = useInfiniteRecords(fetchPage, 'orders', true, onLoadError)
    // const [loading, setLoading] = useState(true)
    // const [error, setError] = useState('')
    // const [myOrdersList, setMyOrdersList] = useState([])

    // const myOrders = async () => {
    //     try {
    //         const config = {
    //             headers: {
    //                 'Authorization': `Bearer ${getToken()}`
    //             }
    //         }
    //         const { data } = await axios.get(`${import.meta.env.VITE_API}/orders/me`, config)
    //         console.log(data)
    //         setMyOrdersList(data.orders)
    //         setLoading(false)

    //     } catch (error) {
    //         setError(error.response.data.message)
    //     }
    // }
    // useEffect(() => {
    //     myOrders();
    //     if (error) {
    //         toast.error(error, {
    //             position: toast.POSITION.BOTTOM_RIGHT
    //         });
    //     }
    // }, [error])

    const columns = [
        {
            field: 'id',
            headerName: 'Order ID',
            flex: 2,
            minWidth: 220,
            renderCell: (params) => <span style={{ wordBreak: 'break-all' }}>{params.value}</span>
        },
        {
            field: 'numOfItems',
            headerName: 'Num of Items',
            type: 'number',
            flex: 1,
            minWidth: 130,
            align: 'right',
            headerAlign: 'right'
        },
        {
            field: 'amount',
            headerName: 'Amount',
            flex: 1,
            minWidth: 130,
            align: 'right',
            headerAlign: 'right'
        },
        {
            field: 'status',
            headerName: 'Status',
            flex: 1,
            minWidth: 140,
            renderCell: (params) =>
                (params.value === 'Completed' || params.value === 'Delivered')
                    ? <span className="order-status order-status-complete">{params.value}</span>
                    : params.value === 'Cancelled'
                        ? <span className="order-status order-status-cancelled">{params.value}</span>
                        : <span className="order-status order-status-progress">{params.value}</span>
        },
        {
            field: 'actions',
            headerName: 'Actions',
            flex: 1,
            minWidth: 120,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Button
                    component={Link}
                    to={`/order/${params.id}`}
                    variant="contained"
                    size="small"
                >
                    <i className="fa fa-eye" />
                </Button>
            )
        }
    ];

    const rows = orders.map(order => ({
        id: order._id,
        numOfItems: order.orderItems.length,
        amount: `₱${Number(order.totalPrice).toFixed(2)}`,
        status: order.orderStatus || ''
    }));
    return (
        <>
            <MetaData title={'My Orders'} />
            <main className="admin-page-content my-orders-page">
                <header className="admin-page-heading">
                    <div>
                        <p className="admin-eyebrow">ORDER HISTORY</p>
                        <h1>My Orders</h1>
                        <p className="admin-page-subtitle">View your purchases and check their current status.</p>
                    </div>
                </header>

                {loading ? <Loader /> : (
                    <div className="admin-data-grid my-orders-grid">
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

export default ListOrders