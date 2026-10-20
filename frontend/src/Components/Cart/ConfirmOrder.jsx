import { Link, useNavigate } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import CheckoutSteps from './CheckoutSteps'
// import { getUser } from '../Utils/helpers'
import { useSelector } from 'react-redux'
const ConfirmOrder = () => {
    // const [user, setUser] = useState(getUser() ? getUser() : {})
    let navigate = useNavigate();
    const { cartItems, shippingInfo } = useSelector(state => state.cart)
    const { user } = useSelector(state => state.auth)
    // Calculate Order Prices
    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
    const shippingPrice = itemsPrice > 200 ? 0 : 25
    const taxPrice = Number((0.05 * itemsPrice).toFixed(2))
    const totalPrice = (itemsPrice + shippingPrice + taxPrice).toFixed(2)
    const itemCount = cartItems.reduce((total, item) => total + Number(item.quantity), 0)

    const processToPayment = () => {
        const data = {
            itemsPrice: itemsPrice.toFixed(2),
            shippingPrice,
            taxPrice,
            totalPrice
        }

        sessionStorage.setItem('orderInfo', JSON.stringify(data))
        navigate('/payment')
    }

    return (
        <>
            <MetaData title={'Confirm Order'} />
            <CheckoutSteps shipping confirmOrder />
            <main className="confirm-order-page">
                <div className="confirm-order-content">
                    <div className="confirm-order-main">
                        <section className="confirm-shipping-card">
                            <div className="confirm-section-heading">
                                <div>
                                    <p className="admin-eyebrow">DELIVERY DETAILS</p>
                                    <h1>Shipping information</h1>
                                </div>
                                <i className="fa fa-map-marker" aria-hidden="true"></i>
                            </div>
                            <div className="confirm-shipping-details">
                                {user && <div><span>Name</span><strong>{user.name}</strong></div>}
                                <div><span>Phone</span><strong>{shippingInfo.phoneNo}</strong></div>
                                <div className="confirm-address"><span>Address</span><strong>{`${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode}, ${shippingInfo.country}`}</strong></div>
                            </div>
                        </section>

                        <section className="confirm-items-section">
                            <div className="confirm-section-heading">
                                <div>
                                    <p className="admin-eyebrow">ORDER CONTENTS</p>
                                    <h2>Your items <span>{itemCount}</span></h2>
                                </div>
                            </div>
                            <div className="confirm-items-list">
                                {cartItems.map(item => (
                                    <article className="confirm-item" key={item.product}>
                                        <Link to={`/product/${item.product}`} className="confirm-item-image">
                                            <img src={item.image} alt={item.name} />
                                        </Link>
                                        <div className="confirm-item-details">
                                            <Link to={`/product/${item.product}`} className="confirm-item-name">{item.name}</Link>
                                            <span>Quantity: {item.quantity}</span>
                                        </div>
                                        <div className="confirm-item-price">
                                            <span>₱{Number(item.price).toFixed(2)} each</span>
                                            <strong>₱{(Number(item.quantity) * Number(item.price)).toFixed(2)}</strong>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside id="order_summary" className="confirm-order-summary">
                        <p className="admin-eyebrow">PAYMENT BREAKDOWN</p>
                        <h2>Order summary</h2>
                        <div className="confirm-summary-row">
                            <span>Subtotal <small>({itemCount} items)</small></span>
                            <strong>₱{itemsPrice.toFixed(2)}</strong>
                        </div>
                        <div className="confirm-summary-row">
                            <span>Shipping</span>
                            <strong>{shippingPrice === 0 ? 'Free' : `₱${shippingPrice.toFixed(2)}`}</strong>
                        </div>
                        <div className="confirm-summary-row">
                            <span>Tax</span>
                            <strong>₱{taxPrice.toFixed(2)}</strong>
                        </div>
                        <div className="confirm-summary-total">
                            <span>Total</span>
                            <strong>₱{totalPrice}</strong>
                        </div>
                        <button id="checkout_btn" className="btn btn-primary btn-block" onClick={processToPayment}>
                            Continue to payment
                        </button>
                        <p className="confirm-summary-note">Review your delivery details and items before continuing.</p>
                    </aside>
                </div>
            </main>

        </>
    )
}

export default ConfirmOrder