import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Carousel, Modal } from 'react-bootstrap'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import ListReviews from '../Review/ListReviews'
import { getProductDetails } from '../../actions/productActions'
import { addItemToCart } from '../../actions/cartActions'

const ProductDetails = () => {
    const { id } = useParams()
    const dispatch = useDispatch()
    const { loading, error, product } = useSelector(state => state.productDetails)
    const { user } = useSelector(state => state.auth)
    const [quantity, setQuantity] = useState(1)
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [showReview, setShowReview] = useState(false)
    const [submittingReview, setSubmittingReview] = useState(false)

    const existingReview = product.reviews?.find(
        review => String(review.user?._id || review.user) === String(user?._id)
    )

    useEffect(() => {
        dispatch(getProductDetails(id))
    }, [dispatch, id])

    const changeQuantity = (difference) => {
        setQuantity(current => Math.min(product.stock, Math.max(1, current + difference)))
    }

    const openReviewForm = () => {
        setRating(existingReview?.rating || 0)
        setComment(existingReview?.comment || '')
        setShowReview(true)
    }

    const submitReview = async (event) => {
        event.preventDefault()
        if (rating < 1 || rating > 5) {
            toast.error('Choose a rating from 1 to 5 stars.')
            return
        }
        if (comment.trim().length < 2) {
            toast.error('Write a review with at least 2 characters.')
            return
        }

        setSubmittingReview(true)
        try {
            await axios.put(`${import.meta.env.VITE_API}/review`, {
                rating,
                comment: comment.trim(),
                productId: id
            }, { withCredentials: true })
            toast.success(existingReview ? 'Your review has been updated.' : 'Your review has been submitted.')
            setShowReview(false)
            await dispatch(getProductDetails(id))
        } catch (requestError) {
            toast.error(requestError.response?.data?.message || requestError.message || 'Unable to submit your review.')
        } finally {
            setSubmittingReview(false)
        }
    }

    if (loading) return <Loader />
    if (error) return <div className="container alert alert-danger mt-5" role="alert">{error}</div>

    return (
        <>
            <MetaData title={product.name || 'Product Details'} />
            <main className="container product-detail-page">
                <div className="row justify-content-center">
                    <div className="col-12 col-lg-5 product-detail-gallery" id="product_image">
                        <Carousel pause="hover" indicators={product.images?.length > 1}>
                            {product.images?.map(image => (
                                <Carousel.Item key={image.public_id}>
                                    <img src={image.url} alt={product.name} />
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    </div>

                    <div className="col-12 col-lg-5 mt-4 mt-lg-0 product-detail-information">
                        <p className="admin-eyebrow">{product.category}</p>
                        <h1>{product.name}</h1>
                        <p id="product_id">Product # {product._id}</p>
                        <div className="d-flex align-items-center">
                            <div className="rating-outer">
                                <div className="rating-inner" style={{ width: `${(product.ratings / 5) * 100}%` }}></div>
                            </div>
                            <span id="no_of_reviews">({product.numOfReviews || 0} reviews)</span>
                        </div>
                        <hr />
                        <p id="product_price">₱{Number(product.price).toFixed(2)}</p>
                        <div className="product-purchase-controls">
                            <div className="stockCounter">
                                <button type="button" className="btn btn-light" onClick={() => changeQuantity(-1)} disabled={quantity <= 1} aria-label="Decrease quantity">−</button>
                                <input type="number" className="form-control count" value={quantity} readOnly aria-label="Quantity" />
                                <button type="button" className="btn btn-light" onClick={() => changeQuantity(1)} disabled={quantity >= product.stock} aria-label="Increase quantity">+</button>
                            </div>
                            <button
                                type="button"
                                id="cart_btn"
                                className="btn btn-primary"
                                disabled={product.stock === 0}
                                onClick={() => dispatch(addItemToCart(id, quantity))}
                            >
                                Add to cart
                            </button>
                        </div>
                        <p className="product-stock-status">
                            Availability: <strong className={product.stock > 0 ? 'greenColor' : 'redColor'}>
                                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                            </strong>
                        </p>
                        <hr />
                        <h2>Description</h2>
                        <p>{product.description}</p>
                        <p id="product_seller">Sold by: <strong>{product.seller}</strong></p>

                        {user?._id ? (
                            <button type="button" className="btn btn-primary mt-3" onClick={openReviewForm}>
                                {existingReview ? 'Edit your review' : 'Write a review'}
                            </button>
                        ) : (
                            <div className="alert alert-info mt-3" role="alert">
                                Log in to write a review. Only customers with a completed purchase can review this product.
                            </div>
                        )}
                    </div>
                </div>

                {product.reviews?.length > 0 && (
                    <section className="product-reviews-section">
                        <ListReviews reviews={product.reviews} />
                    </section>
                )}
            </main>

            <Modal show={showReview} onHide={() => setShowReview(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{existingReview ? 'Edit review' : 'Write a review'}</Modal.Title>
                </Modal.Header>
                <form onSubmit={submitReview}>
                    <Modal.Body>
                        <div className="review-rating-picker" role="group" aria-label="Select a rating">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    type="button"
                                    className={star <= rating ? 'selected' : ''}
                                    aria-label={`${star} star${star === 1 ? '' : 's'}`}
                                    aria-pressed={rating === star}
                                    onClick={() => setRating(star)}
                                >
                                    <i className="fa fa-star" aria-hidden="true"></i>
                                </button>
                            ))}
                        </div>
                        <label className="sr-only" htmlFor="review-comment">Your review</label>
                        <textarea
                            id="review-comment"
                            className="form-control mt-3"
                            value={comment}
                            onChange={event => setComment(event.target.value)}
                            maxLength={1000}
                            minLength={2}
                            required
                            placeholder="Share your experience"
                        />
                        <p className="review-eligibility-note">Reviews are limited to customers with a completed purchase.</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" className="btn btn-light" onClick={() => setShowReview(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                            {submittingReview ? 'Saving...' : existingReview ? 'Update review' : 'Submit review'}
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>
        </>
    )
}

export default ProductDetails
