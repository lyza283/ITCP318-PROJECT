import { Link } from 'react-router-dom'
import '../../App.css'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { getUser, logout } from '../Utils/helpers';
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../actions/userActions'

import Search from './Search'
import Sidebar from '../Admin/SideBar'
export const Header = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth)
    const { cartItems } = useSelector(state => state.cart)

    const logoutHandler = () => {
        dispatch(logout());
        toast.success('log out', {
            position: 'bottom-right'
        });
    }
    return (
        <>
            <nav className="navbar site-navbar">
                <div className="navbar-brand">
                    <Link to="/">
                        <img src="/images/guhit_space_logo.png" alt="Guhit Space" />
                    </Link>
                </div>
                <div className="header-search">
                    <Search />
                </div>
                <div className="header-actions">
                    {user ? (<div className="dropdown d-inline">
                        <Link to="#!" className="btn dropdown-toggle text-white" type="button" id="dropDownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <figure className="avatar avatar-nav">
                                <img
                                    src={user.avatar && user.avatar.url}
                                    alt={user && user.name}
                                    className="rounded-circle"
                                />
                            </figure>
                            <span>{user && user.name}</span>
                        </Link>

                        <div className="dropdown-menu" aria-labelledby="dropDownMenuButton">
                            {user && user.role === 'admin' && (
                                <Link className="dropdown-item" to="/dashboard">Dashboard</Link>
                            )}
                            <Link className="dropdown-item" to="/orders/me">Orders</Link>
                            <Link className="dropdown-item" to="/me">Profile</Link>

                            <Link
                                className="dropdown-item text-danger" to="/"
                                onClick={logoutHandler}
                            >
                                Logout
                            </Link>
                        </div>
                    </div>) : <Link to="/login" className="btn ml-4" id="login_btn">Login</Link>}

                    <Link to="/cart" className="header-cart" style={{ textDecoration: 'none' }} >
                        <span id="cart">Cart</span>
                        <span className="ml-1" id="cart_count">{cartItems ? cartItems.length : null}</span>
                    </Link>
                </div>
            </nav>
            {user?.role === 'admin' && <Sidebar />}
        </>
    )
}
