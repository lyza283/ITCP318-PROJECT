import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import Loader from '../Layout/Loader'
import { loadUser } from '../../actions/userActions'

const ProtectedRoute = ({ children, isAdmin = false }) => {
    const dispatch = useDispatch()
    const { user, isAuthenticated, loading } = useSelector(state => state.auth)
    const location = useLocation()

    useEffect(() => {
        if (isAuthenticated === undefined && !loading) {
            dispatch(loadUser())
        }
    }, [dispatch, isAuthenticated, loading])

    if (loading || isAuthenticated === undefined) {
        return <Loader />
    }

    if (!isAuthenticated) {
        const redirect = location.pathname.slice(1)
        return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />
    }

    if (isAdmin && user?.role !== 'admin') {
        return <Navigate to="/" replace />
    }

    return children
}

export default ProtectedRoute
