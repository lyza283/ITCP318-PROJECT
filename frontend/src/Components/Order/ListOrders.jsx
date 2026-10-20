import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { getToken } from '../Utils/helpers'
import { useDispatch, useSelector } from 'react-redux'
import { myOrders } from '../../actions/orderActions'

import {

    Button
} from '@mui/material'


import { DataGrid, } from '@mui/x-data-grid'

const ListOrders = () => {
    const dispatch = useDispatch();
    const { loading, error, orders } = useSelector(state => state.myOrders);
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
    useEffect(() => {
        dispatch(myOrders());
        if (error) {
            toast.error(error, {
                position: 'bottom-right'
            });
        }
    }, [error, dispatch])



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
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            pageSizeOptions={[5, 10, 25]}
                            initialState={{
                                pagination: {
                                    paginationModel: { pageSize: 10, page: 0 }
                                }
                            }}
                            disableRowSelectionOnClick
                            getRowId={(row) => row.id}
                            showToolbar
                        />
                    </div>
                )}
            </main>
        </>
    )
}

export default ListOrders