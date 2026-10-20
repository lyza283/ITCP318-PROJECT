import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

import Loader from '../Layout/Loader'
import MetaData from '../Layout/MetaData';
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
// import axios from 'axios';
// import { getUser, authenticate } from '../Utils/helpers';
import { useDispatch, useSelector } from 'react-redux'
import { login, loginWithGoogle, clearErrors } from '../../actions/userActions'
import { loginSchema } from '../../validation/schemas'

const Login = () => {
    const { isAuthenticated, error, loading, user } = useSelector(state => state.auth)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // const [loading, setLoading] = useState(false)
    let navigate = useNavigate()
    let location = useLocation()
    const dispatch = useDispatch()

    const submitHandler = (e) => {
        e.preventDefault();
        loginSchema.validate({ email, password }, { abortEarly: false })
            .then(() => dispatch(login(email.trim(), password)))
            .catch(validationError => toast.error(validationError.errors[0]))
    }

    // const login = async (email, password) => {
    //     try {
    //         const config = {
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             }
    //         }
    //         const { data } = await axios.post(`http://localhost:4001/api/v1/login`, { email, password }, config)
    //         console.log(data)
    //         authenticate(data, () => navigate("/"))

    //     } catch (error) {

    //         toast.error("invalid user or password", {
    //             position: 'bottom-right'
    //         })
    //     }
    // }

    const redirect = location.search ? new URLSearchParams(location.search).get('redirect') : ''
    const redirectPath = redirect && /^(shipping|confirm|payment|orders\/me|order\/[a-f\d]+)$/i.test(redirect)
        ? `/${redirect}`
        : ''
    // useEffect(() => {
    //     if (getUser()) {
    //         navigate('/')
    //     }
    // }, [])

    // useEffect(() => {
    //     if (getUser() && redirect === 'shipping') {
    //         navigate(`/${redirect}`)
    //     }
    // }, [])

    useEffect(() => {
        if (isAuthenticated && redirectPath) {
            navigate(redirectPath)
        } else if (isAuthenticated && user?.role === 'admin') {
            navigate('/dashboard')
        } else if (isAuthenticated) {
            navigate('/')
        }
        if (error) {
            toast.error(error)
            dispatch(clearErrors());
        }
    }, [error, isAuthenticated, user, dispatch, navigate, redirectPath])

    return (
        <>
            {loading ? <Loader /> : (
                <>
                    <MetaData title={'Login'} />

                    <div className="row wrapper">
                        <div className="col-10 col-lg-5">
                            <form className="shadow-lg"
                                onSubmit={submitHandler}
                            >
                                <h1 className="mb-3">Login</h1>
                                <div className="form-group">
                                    <label htmlFor="email_field">Email</label>
                                    <input
                                        type="email"
                                        id="email_field"
                                        className="form-control"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password_field">Password</label>
                                    <input
                                        type="password"
                                        id="password_field"
                                        className="form-control"
                                        autoComplete="current-password"
                                        minLength={6}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>

                                <Link to="/password/forgot" className="float-right mb-4">Forgot Password?</Link>

                                <button
                                    id="login_button"
                                    type="submit"
                                    className="btn btn-block py-3"
                                    disabled={loading}
                                >
                                    {loading ? 'SIGNING IN...' : 'LOGIN'}
                                </button>

                                <div className="social-login-divider"><span>or continue with</span></div>
                                {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                                    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                                        <div className="google-login-button">
                                            <GoogleLogin
                                                onSuccess={credentialResponse => {
                                                    if (credentialResponse.credential) {
                                                        dispatch(loginWithGoogle(credentialResponse.credential))
                                                    } else {
                                                        toast.error('Google did not return a sign-in credential.')
                                                    }
                                                }}
                                                onError={() => toast.error('Google sign-in failed. Please try again.')}
                                                useOneTap={false}
                                            />
                                        </div>
                                    </GoogleOAuthProvider>
                                ) : (
                                    <p className="social-login-setup-note">Google sign-in needs VITE_GOOGLE_CLIENT_ID configured by the project administrator.</p>
                                )}

                                <Link to="/register" className="float-right mt-3">New User?</Link>
                            </form>
                        </div>
                    </div>


                </>
            )}
        </>
    )
}
export default Login
