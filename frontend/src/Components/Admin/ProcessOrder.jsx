import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate, } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import adminApi from './adminApi'

const ProcessOrder = () => {

    const [status, setStatus] = useState('')
    const [loading, setLoading] = useState(true)
    const [order, setOrder] = useState({})
    const [saving, setSaving] = useState(false)
    const navigate = useNavigate()

    const { id } = useParams();
    const { shippingInfo = {}, orderItems = [], paymentInfo, user, totalPrice, orderStatus } = order
    const orderId = id;
    const updateOrder = async (id, formData) => {
        try {
            setSaving(true)
            const { data } = await adminApi.put(`/admin/order/${id}`, formData)
            if (data.unchanged) {
                toast.success('Status notification email sent again.', { position: 'bottom-center' })
                navigate('/admin/orders')
                return
            }
            toast.success('Order status updated and customer notified by email.', { position: 'bottom-center' })
            navigate('/admin/orders')
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Unable to update order.', {
                position: 'bottom-center'
            })
        } finally {
            setSaving(false)
        }
    }

    useEffect(() => {
        let active = true
        adminApi.get(`/order/${orderId}`)
            .then(({ data }) => {
                if (active) {
                    setOrder(data.order)
                    setStatus(data.order.orderStatus)
                }
            })
            .catch(error => {
                if (active) {
                    toast.error(error.response?.data?.message || error.message || 'Unable to load order.', {
                        position: 'bottom-center'
                    })
                }
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    }, [orderId])

    const updateOrderHandler = (id) => {
        updateOrder(id, { status })
    }

    const shippingDetails = [shippingInfo.address, shippingInfo.city, shippingInfo.postalCode, shippingInfo.country]
        .filter(Boolean)
        .join(', ')
    const allowedStatuses = {
        Pending: ['Processing', 'Cancelled'],
        Processing: ['Shipped', 'Cancelled'],
        Shipped: ['Completed'],
        Completed: [],
        Delivered: [],
        Cancelled: []
    }
    const nextStatuses = allowedStatuses[orderStatus] || []
    return (
        <>
            <MetaData title={`Process Order # ${order && order._id}`} />
            <main className="admin-page-content order-details-page process-order-page">
                {loading ? <Loader /> : (
                    <>
                        <header className="order-details-heading">
                            <div>
                                <p className="admin-eyebrow">ORDER MANAGEMENT</p>
                                <h1>Process order</h1>
                                <p className="order-details-id">Order #{order._id}</p>
                            </div>
                            <span className={`order-status ${orderStatus === 'Completed' || orderStatus === 'Delivered' ? 'order-status-complete' : orderStatus === 'Cancelled' ? 'order-status-cancelled' : 'order-status-progress'}`}>
                                {orderStatus}
                            </span>
                        </header>

                        <div className="order-details-layout">
                            <div className="order-details-main">
                                <section className="order-detail-card">
                                    <div className="order-detail-card-heading">
                                        <span className="order-detail-icon"><i className="fa fa-map-marker" aria-hidden="true"></i></span>
                                        <div>
                                            <p className="admin-eyebrow">DELIVERY</p>
                                            <h2>Shipping information</h2>
                                        </div>
                                    </div>
                                    <div className="order-shipping-grid">
                                        <div><span>Recipient</span><strong>{user?.name || '—'}</strong></div>
                                        <div><span>Phone</span><strong>{shippingInfo.phoneNo || '—'}</strong></div>
                                        <div className="order-shipping-address"><span>Address</span><strong>{shippingDetails || '—'}</strong></div>
                                    </div>
                                </section>

                                <section className="order-detail-items">
                                    <header className="order-items-heading">
                                        <div>
                                            <p className="admin-eyebrow">IN THIS ORDER</p>
                                            <h2>Order items <span>{orderItems.length}</span></h2>
                                        </div>
                                    </header>
                                    <div className="order-detail-items-list">
                                        {orderItems.map((item, index) => (
                                            <article key={item.product || `${item.name}-${index}`} className="order-detail-item">
                                                <Link to={`/product/${item.product}`} className="order-detail-item-image">
                                                    <img src={item.image} alt={item.name} />
                                                </Link>
                                                <div className="order-detail-item-info">
                                                    <Link to={`/product/${item.product}`} className="order-detail-item-name">{item.name}</Link>
                                                    <span>₱{Number(item.price).toFixed(2)} each · {item.quantity} {Number(item.quantity) === 1 ? 'item' : 'items'}</span>
                                                </div>
                                                <strong className="order-detail-item-total">₱{(Number(item.price) * Number(item.quantity)).toFixed(2)}</strong>
                                            </article>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            <aside className="order-detail-summary process-order-controls">
                                <p className="admin-eyebrow">ORDER SUMMARY</p>
                                <h2>Payment &amp; status</h2>
                                <div className="order-payment-method">
                                    <span>Payment method</span>
                                    <strong>{paymentInfo?.method || 'Cash on Delivery'}</strong>
                                    <small>{paymentInfo?.status || 'Pending payment'}</small>
                                </div>
                                <div className="order-grand-total">
                                    <span>Grand total</span>
                                    <strong>₱{Number(totalPrice || 0).toFixed(2)}</strong>
                                </div>
                                <div className="process-order-status-field">
                                    <label htmlFor="order_status">Update order status</label>
                                    <select
                                        id="order_status"
                                        className="form-control"
                                        name="status"
                                        value={status || orderStatus}
                                        onChange={(event) => setStatus(event.target.value)}
                                    >
                                        <option value={orderStatus}>{orderStatus}</option>
                                        {nextStatuses.map(nextStatus => (
                                            <option key={nextStatus} value={nextStatus}>{nextStatus}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    className="btn btn-primary btn-block process-order-submit"
                                    disabled={saving || (status !== orderStatus && !nextStatuses.includes(status))}
                                    onClick={() => updateOrderHandler(order._id)}
                                >
                                    {saving ? 'Sending...' : status === orderStatus ? 'Resend Status Email' : 'Update Status & Notify Customer'}
                                </button>
                            </aside>
                        </div>
                    </>
                )}
            </main>
        </>
    )
}
export default ProcessOrder