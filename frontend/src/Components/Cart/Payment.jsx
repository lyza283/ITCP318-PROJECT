import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'

import MetaData from '../Layout/MetaData'
import CheckoutSteps from './CheckoutSteps'
import { clearErrors, createOrder } from '../../actions/orderActions'
import { clearCart } from '../../actions/cartActions'

const Payment = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { cartItems, shippingInfo } = useSelector(state => state.cart)
    const { error } = useSelector(state => state.newOrder)
    const [placingOrder, setPlacingOrder] = useState(false)

    useEffect(() => {
        if (error) {
            toast.error(error)
            dispatch(clearErrors())
        }
    }, [dispatch, error])

    const submitHandler = async (event) => {
        event.preventDefault()
        if (!cartItems.length) {
            toast.error('Your cart is empty.')
            navigate('/cart')
            return
        }

        setPlacingOrder(true)
        const order = await dispatch(createOrder({
            orderItems: cartItems,
            shippingInfo
        }))
        setPlacingOrder(false)

        if (order?._id) {
            await dispatch(clearCart())
            sessionStorage.removeItem('orderInfo')
            navigate('/success', { state: { orderId: order._id } })
        }
    }

    return (
        <>
            <MetaData title="Place Order" />
            <CheckoutSteps shipping confirmOrder payment />
            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={submitHandler}>
                        <h1 className="mb-4">Place your order</h1>
                        <p>Your order will be confirmed now and paid for using Cash on Delivery.</p>
                        <p>We will verify the final totals and stock before creating your order.</p>
                        <button
                            id="pay_btn"
                            type="submit"
                            className="btn btn-block py-3"
                            disabled={placingOrder}
                        >
                            {placingOrder ? 'PLACING ORDER...' : 'PLACE ORDER (CASH ON DELIVERY)'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Payment
