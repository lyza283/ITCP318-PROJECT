import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import Loader from '../Layout/Loader'
import { loadUser } from '../../actions/userActions'

const ProtectedRoute = ({ children, isAdmin = false }) => {
    const dispatch = useDispatch()
    const { user, isAuthenticated, loading } = useSelector(state => state.auth)

    useEffect(() => {
        if (isAuthenticated === undefined && !loading) {
            dispatch(loadUser())
        }
    }, [dispatch, isAuthenticated, loading])

    if (loading || isAuthenticated === undefined) {
        return <Loader />
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (isAdmin && user?.role !== 'admin') {
        return <Navigate to="/" replace />
    }

    return children
}

export default ProtectedRoute
