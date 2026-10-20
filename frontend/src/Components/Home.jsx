import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Stack from '@mui/material/Stack'
import Pagination from '@mui/material/Pagination'
import MetaData from './Layout/MetaData'
import Loader from './Layout/Loader'
import Product from './Product/Product'
import { useDispatch, useSelector } from 'react-redux'
import { getProducts } from '../actions/productActions'
import { productCategories } from '../constants/productCategories'

const initialFilters = {
    minPrice: '',
    maxPrice: '',
    category: '',
    minRating: '',
    hasReviews: ''
}

const Home = () => {
    const [filters, setFilters] = useState(initialFilters)
    const [currentPage, setCurrentPage] = useState(1)
    const { keyword = '' } = useParams()
    const dispatch = useDispatch()
    const { loading, products, error, productsCount, resPerPage, filteredProductsCount } = useSelector(state => state.products)

    const count = keyword || Object.values(filters).some(Boolean)
        ? filteredProductsCount
        : productsCount

    const stableFilters = useMemo(() => filters, [filters])

    useEffect(() => {
        dispatch(getProducts(currentPage, keyword, stableFilters))
    }, [currentPage, dispatch, keyword, stableFilters])

    const updateFilter = (field, value) => {
        setCurrentPage(1)
        setFilters(current => ({ ...current, [field]: value }))
    }

    const clearFilters = () => {
        setCurrentPage(1)
        setFilters(initialFilters)
    }

    return (
        <>
            <MetaData title="Explore Supplies" />
            <main className="container container-fluid storefront-page">
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                <section className="product-filter-panel storefront-filter-panel" aria-label="Product filters">
                    <div className="product-filter-heading">
                        <div>
                            <h2>Filter products</h2>
                        </div>
                        <button type="button" className="btn btn-link" onClick={clearFilters}>Clear filters</button>
                    </div>
                    <div className="product-filter-controls">
                        <fieldset className="product-filter-group product-filter-price">
                            <legend>Price range</legend>
                            <div className="price-filter-fields">
                                <label>
                                    <span>Minimum</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={filters.minPrice}
                                        onChange={event => updateFilter('minPrice', event.target.value)}
                                        placeholder="₱0"
                                    />
                                </label>
                                <label>
                                    <span>Maximum</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={filters.maxPrice}
                                        onChange={event => updateFilter('maxPrice', event.target.value)}
                                        placeholder="Any"
                                    />
                                </label>
                            </div>
                        </fieldset>
                        <fieldset className="product-filter-group">
                            <legend>Category</legend>
                            <select value={filters.category} onChange={event => updateFilter('category', event.target.value)}>
                                <option value="">All categories</option>
                                {productCategories.map(category => <option key={category} value={category}>{category}</option>)}
                            </select>
                        </fieldset>
                        <fieldset className="product-filter-group">
                            <legend>Minimum rating</legend>
                            <select value={filters.minRating} onChange={event => updateFilter('minRating', event.target.value)}>
                                <option value="">Any rating</option>
                                {[4, 3, 2, 1].map(rating => (
                                    <option key={rating} value={rating}>{rating} stars and above</option>
                                ))}
                            </select>
                        </fieldset>
                        <fieldset className="product-filter-group">
                            <legend>Customer reviews</legend>
                            <select value={filters.hasReviews} onChange={event => updateFilter('hasReviews', event.target.value)}>
                                <option value="">All products</option>
                                <option value="true">With reviews</option>
                                <option value="false">Without reviews</option>
                            </select>
                        </fieldset>
                    </div>
                </section>
                <div className="storefront-heading">
                    <div>
                        <p className="admin-eyebrow">GUHITSPACE COLLECTION</p>
                        <h1 id="products_heading">Explore supplies</h1>
                    </div>
                </div>
                <section className="storefront-results" aria-label="Product catalogue">
                        {loading ? <Loader /> : products.length ? (
                            <>
                                <div className="product-grid">
                                    {products.map(product => <Product key={product._id} product={product} />)}
                                </div>
                                {resPerPage < count && (
                                    <div className="d-flex justify-content-center mt-5">
                                        <Stack spacing={2}>
                                            <Pagination
                                                count={Math.ceil(count / resPerPage)}
                                                page={currentPage}
                                                onChange={(event, page) => setCurrentPage(page)}
                                                color="primary"
                                                variant="outlined"
                                                shape="rounded"
                                                showFirstButton
                                                showLastButton
                                                size="large"
                                            />
                                        </Stack>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="product-no-results">
                                <i className="fa fa-search" aria-hidden="true"></i>
                                <h2>No products found</h2>
                                <p>Try adjusting your filters or search term.</p>
                                <button className="btn btn-primary" type="button" onClick={clearFilters}>Clear filters</button>
                            </div>
                        )}
                </section>
            </main>
        </>
    )
}

export default Home
