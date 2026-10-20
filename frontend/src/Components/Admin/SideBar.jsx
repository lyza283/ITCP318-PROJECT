import { NavLink, useLocation } from 'react-router-dom'

const Sidebar = () => {
    const { pathname } = useLocation()

    return (
        <div className="admin-nav-shell">
            <nav className="admin-nav" aria-label="Admin navigation">
                <NavLink to="/dashboard" end className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
                    <i className="fa fa-tachometer" aria-hidden="true"></i>
                    Dashboard
                </NavLink>
                <NavLink
                    to="/admin/products"
                    className={({ isActive }) => `admin-nav-link${isActive || pathname.startsWith('/admin/product/') ? ' active' : ''}`}
                >
                    <i className="fa fa-product-hunt" aria-hidden="true"></i>
                    Products
                </NavLink>
                <NavLink to="/admin/orders" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
                    <i className="fa fa-shopping-basket" aria-hidden="true"></i>
                    Orders
                </NavLink>
                <NavLink to="/admin/users" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
                    <i className="fa fa-users" aria-hidden="true"></i>
                    Users
                </NavLink>
                <NavLink to="/admin/reviews" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
                    <i className="fa fa-star" aria-hidden="true"></i>
                    Reviews
                </NavLink>
            </nav>
        </div>
    )
}

export default Sidebar