import { Link, useNavigate } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import { useDispatch, useSelector } from 'react-redux'
import { addItemToCart, removeItemFromCart } from '../../actions/cartActions'


const Cart = () => {
    const dispatch = useDispatch();
    const { cartItems } = useSelector(state => state.cart)
    const { isAuthenticated } = useSelector(state => state.auth)

    const navigate = useNavigate()


    const increaseQty = (id, quantity, stock) => {
        const newQty = quantity + 1;
        if (newQty > stock) return;
        dispatch(addItemToCart(id, newQty))
    }

    const decreaseQty = (id, quantity) => {
        const newQty = quantity - 1;
        if (newQty <= 0) return;
        dispatch(addItemToCart(id, newQty))
    }

    const removeCartItemHandler = (id) => {
        dispatch(removeItemFromCart(id))
    }
    const checkoutHandler = () => {
        navigate(isAuthenticated ? '/shipping' : '/login?redirect=shipping')
    }
    // localStorage.setItem('cartItems', JSON.stringify(cartItems))
    // useEffect(() => {
    //     localStorage.setItem('cartItems', JSON.stringify(cartItems));
    // }, [cartItems]);
    return (
        <>
            <MetaData title={'Your Cart'} />
            <main className="cart-page">
                <header className="cart-page-heading">
                    <div>
                        <p className="admin-eyebrow">YOUR SELECTION</p>
                        <h1>Your Cart <span>{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</span></h1>
                    </div>
                </header>

                {cartItems.length === 0 ? (
                    <section className="cart-empty-state">
                        <i className="fa fa-shopping-bag" aria-hidden="true"></i>
                        <h2>Your cart is empty</h2>
                        <p>Explore the collection and add something you love.</p>
                        <Link to="/" className="btn btn-primary">Browse products</Link>
                    </section>
                ) : (
                    <div className="cart-content">
                        <section className="cart-items" aria-label="Items in your cart">
                            {cartItems.map(item => (
                                <article className="cart-line-item" key={item.product}>
                                    <Link to={`/product/${item.product}`} className="cart-line-image">
                                        <img src={item.image} alt={item.name} />
                                    </Link>
                                    <div className="cart-line-details">
                                        <Link to={`/product/${item.product}`} className="cart-line-name">{item.name}</Link>
                                        <span className="cart-line-unit-price">₱{Number(item.price).toFixed(2)} each</span>
                                    </div>
                                    <div className="cart-line-quantity" aria-label={`Quantity ${item.quantity}`}>
                                        <button
                                            type="button"
                                            className="cart-quantity-button"
                                            onClick={() => decreaseQty(item.product, item.quantity)}
                                            disabled={item.quantity <= 1}
                                            aria-label={`Decrease ${item.name} quantity`}
                                        >
                                            −
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button
                                            type="button"
                                            className="cart-quantity-button"
                                            onClick={() => increaseQty(item.product, item.quantity, item.stock)}
                                            disabled={item.quantity >= item.stock}
                                            aria-label={`Increase ${item.name} quantity`}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <strong className="cart-line-total">₱{(Number(item.price) * item.quantity).toFixed(2)}</strong>
                                    <button
                                        type="button"
                                        className="cart-remove-button"
                                        onClick={() => removeCartItemHandler(item.product)}
                                        aria-label={`Remove ${item.name} from cart`}
                                    >
                                        <i className="fa fa-trash" aria-hidden="true"></i>
                                    </button>
                                </article>
                            ))}
                        </section>

                        <aside id="order_summary" className="cart-order-summary">
                            <h2>Order Summary</h2>
                            <div className="cart-summary-row">
                                <span>Items</span>
                                <strong>{cartItems.reduce((total, item) => total + Number(item.quantity), 0)}</strong>
                            </div>
                            <div className="cart-summary-row cart-summary-total">
                                <span>Estimated total</span>
                                <strong>₱{cartItems.reduce((total, item) => total + item.quantity * item.price, 0).toFixed(2)}</strong>
                            </div>
                            <p className="cart-summary-note">Shipping and tax are calculated at checkout.</p>
                            <button id="checkout_btn" className="btn btn-primary btn-block" onClick={checkoutHandler}>
                                Continue to checkout
                            </button>
                        </aside>
                    </div>
                )}
            </main>
        </>
    )
}

export default Cart