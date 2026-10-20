import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DataGrid, } from '@mui/x-data-grid'
import adminApi from './adminApi'

const OrdersList = () => {
    let navigate = useNavigate();
    const [loading, setLoading] = useState(true)
    const [allOrders, setAllOrders] = useState([])
    const errMsg = (message = '') => toast.error(message, {
        position: 'bottom-right'
    });
    const successMsg = (message = '') => toast.success(message, {
        position: 'bottom-right'
    });

    const deleteOrder = async (id) => {
        try {
            const { data } = await adminApi.delete(`/admin/order/${id}`)
            if (data.success) {
                successMsg('Order deleted successfully')
                navigate('/admin/orders')
            }
        } catch (error) {
            errMsg(error.response?.data?.message || error.message || 'Unable to delete order.')
        }
    }
    useEffect(() => {
        let active = true
        adminApi.get('/admin/orders')
            .then(({ data }) => {
                if (active) setAllOrders(data.orders)
            })
            .catch(error => {
                if (active) errMsg(error.response?.data?.message || error.message || 'Unable to load orders.')
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    }, [])

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
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            pageSizeOptions={[5, 10, 25]}
                            disableSelectionOnClick
                            getRowId={(row) => row.id}
                            showToolbar
                        />
                    </div>
                )}
            </main>
        </>
    )
}

export default OrdersList