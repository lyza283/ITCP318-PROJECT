import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux'
import { getOrderDetails } from '../../actions/orderActions'

const OrderDetails = () => {
    const dispatch = useDispatch();
    const { loading, error, order = {} } = useSelector(state => state.orderDetails);
    // const [loading, setLoading] = useState(true)
    // const [error, setError] = useState('')
    // const [order, setOrder] = useState({})

    const { shippingInfo = {}, orderItems = [], paymentInfo, user, totalPrice, orderStatus } = order
    const { id } = useParams();

    // const getOrderDetails = async (id) => {
    //     try {

    //         const config = {
    //             headers: {
    //                 'Authorization': `Bearer ${getToken()}`
    //             }
    //         }

    //         const { data } = await axios.get(`${import.meta.env.VITE_API}/order/${id}`, config)
    //         console.log(data)
    //         setOrder(data.order)

    //         setLoading(false)


    //     } catch (error) {
    //         setError(error.response.data.message)
    //     }
    // }

    useEffect(() => {
        dispatch(getOrderDetails(id))

        if (error) {
            toast.error(error, { position: 'bottom-right' })
        }
    }, [dispatch, error, id])

    const shippingDetails = [shippingInfo.address, shippingInfo.city, shippingInfo.postalCode, shippingInfo.country]
        .filter(Boolean)
        .join(', ')

    const isCompleted = orderStatus === 'Completed' || orderStatus === 'Delivered'
    const isCancelled = orderStatus === 'Cancelled'

    return (
        <>
            <MetaData title={'Order Details'} />

            {loading ? <Loader /> : (
                <main className="admin-page-content order-details-page">
                    <header className="order-details-heading">
                        <div>
                            <p className="admin-eyebrow">PURCHASE DETAILS</p>
                            <h1>Order details</h1>
                            <p className="order-details-id">Order #{order._id}</p>
                        </div>
                        <span className={`order-status ${isCompleted ? 'order-status-complete' : isCancelled ? 'order-status-cancelled' : 'order-status-progress'}`}>
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

                        <aside className="order-detail-summary">
                            <p className="admin-eyebrow">ORDER SUMMARY</p>
                            <h2>Payment &amp; total</h2>
                            <div className="order-payment-method">
                                <span>Payment method</span>
                                <strong>{paymentInfo?.method || 'Cash on Delivery'}</strong>
                                <small>{paymentInfo?.status || 'Pending payment'}</small>
                            </div>
                            <div className="order-payment-status">
                                <span>Order status</span>
                                <strong className={`order-status ${isCompleted ? 'order-status-complete' : isCancelled ? 'order-status-cancelled' : 'order-status-progress'}`}>
                                    {orderStatus}
                                </strong>
                            </div>
                            <div className="order-grand-total">
                                <span>Grand total</span>
                                <strong>₱{Number(totalPrice || 0).toFixed(2)}</strong>
                            </div>
                            <a className="btn btn-outline-primary order-receipt-button" href={`${import.meta.env.VITE_API}/order/${id}/receipt`}>
                                <i className="fa fa-download" aria-hidden="true"></i>
                                Download PDF receipt
                            </a>
                        </aside>
                    </div>
                </main>
            )}

        </>
    )
}

export default OrderDetails