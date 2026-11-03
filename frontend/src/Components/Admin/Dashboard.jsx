import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import adminApi from './adminApi'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProductSalesChart from './ProductSalesChart';
import UserSalesChart from './UserSalesChart';
import MonthlySalesChart from './MonthlySalesChart';

const today = new Date().toISOString().slice(0, 10)
const thirtyDaysAgo = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

const Dashboard = () => {

    const [dashboardData, setDashboardData] = useState({
        products: [],
        orders: [],
        users: [],
        reviews: [],
    })
    const [loading, setLoading] = useState(true)
    const [startDate, setStartDate] = useState(thirtyDaysAgo)
    const [endDate, setEndDate] = useState(today)

    useEffect(() => {
        let active = true
        Promise.all([
            adminApi.get('/admin/products'),
            adminApi.get('/admin/orders'),
            adminApi.get('/admin/users'),
            adminApi.get('/admin/reviews'),
        ])
            .then(([productsResponse, ordersResponse, usersResponse, reviewsResponse]) => {
                if (active) {
                    setDashboardData({
                        products: productsResponse.data.products,
                        orders: ordersResponse.data.orders,
                        users: usersResponse.data.users,
                        reviews: reviewsResponse.data.reviews,
                    })
                }
            })
            .catch(error => {
                if (active) {
                    toast.error(error.response?.data?.message || error.message || 'Unable to load dashboard data.', {
                        position: 'bottom-right'
                    })
                }
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    }, [])

    const outOfStock = dashboardData.products.filter(product => product.stock === 0).length
    const stats = [
        { label: 'Products', value: dashboardData.products.length, icon: 'fa-product-hunt', to: '/admin/products' },
        { label: 'Orders', value: dashboardData.orders.length, icon: 'fa-shopping-basket', to: '/admin/orders' },
        { label: 'Users', value: dashboardData.users.length, icon: 'fa-users', to: '/admin/users' },
        { label: 'Reviews', value: dashboardData.reviews.length, icon: 'fa-star', to: '/admin/reviews' },
        { label: 'Out of stock', value: outOfStock, icon: 'fa-exclamation-circle' },
    ]

    return (
        <>
            <MetaData title="Admin Dashboard" />
            <main className="admin-page-content dashboard-page">
                <div className="admin-page-heading">
                    <div>
                        <p className="admin-eyebrow">ADMINISTRATION</p>
                        <h1>Dashboard</h1>
                    </div>
                </div>

                {loading ? <Loader /> : (
                    <>
                        <section className="dashboard-stats" aria-label="Store overview">
                            {stats.map(stat => {
                                const content = (
                                    <>
                                        <div className="dashboard-stat-top">
                                            <span className="dashboard-stat-label">{stat.label}</span>
                                            <span className="dashboard-stat-icon">
                                                <i className={`fa ${stat.icon}`} aria-hidden="true"></i>
                                            </span>
                                        </div>
                                        <strong className="dashboard-stat-value">{stat.value}</strong>
                                        {stat.to && <span className="dashboard-stat-link">View details <i className="fa fa-arrow-right" aria-hidden="true"></i></span>}
                                    </>
                                )

                                return stat.to ? (
                                    <Link key={stat.label} to={stat.to} className="dashboard-stat-card">
                                        {content}
                                    </Link>
                                ) : (
                                    <div key={stat.label} className="dashboard-stat-card">
                                        {content}
                                    </div>
                                )
                            })}
                        </section>

                        <div className="dashboard-date-filter">
                            <div>
                                <h2>Sales date range</h2>
                            </div>
                            <label>
                                <span>From</span>
                                <input type="date" value={startDate} max={endDate} onChange={event => setStartDate(event.target.value)} />
                            </label>
                            <label>
                                <span>To</span>
                                <input type="date" value={endDate} min={startDate} max={today} onChange={event => setEndDate(event.target.value)} />
                            </label>
                        </div>

                        <section className="dashboard-charts" aria-label="Sales reports">
                            <div className="dashboard-chart-card">
                                <h2>Product sales</h2>
                                <ProductSalesChart startDate={startDate} endDate={endDate} />
                            </div>
                            <div className="dashboard-chart-card">
                                <h2>Customer sales</h2>
                                <UserSalesChart startDate={startDate} endDate={endDate} />
                            </div>
                            <div className="dashboard-chart-card dashboard-chart-wide">
                                <h2>Monthly sales</h2>
                                <MonthlySalesChart startDate={startDate} endDate={endDate} />
                            </div>
                        </section>
                    </>
                )}
            </main>
        </>
    )
}

export default Dashboard