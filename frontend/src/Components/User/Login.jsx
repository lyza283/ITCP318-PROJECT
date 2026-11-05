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
import { login, loginWithGoogle, loginWithFirebase, clearErrors } from '../../actions/userActions'
import { loginSchema } from '../../validation/schemas'
import {
    firebaseAuth,
    isFirebaseConfigured,
    signInWithFirebaseEmail,
    signInWithFirebaseGoogle
} from '../../Utils/firebaseAuth'
import { signOut } from 'firebase/auth'

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
            .then(async () => {
                if (!isFirebaseConfigured) {
                    dispatch(login(email.trim(), password))
                    return
                }

                try {
                    const credential = await signInWithFirebaseEmail(email.trim(), password)
                    if (!credential.user.emailVerified) {
                        await signOut(firebaseAuth)
                        toast.error('Please verify your email using the link Firebase sent before signing in.')
                        return
                    }
                    const succeeded = await dispatch(loginWithFirebase(credential.user))
                    if (!succeeded) await signOut(firebaseAuth)
                } catch (firebaseError) {
                    const canUseLegacyLogin = [
                        'auth/user-not-found',
                        'auth/invalid-credential',
                        'auth/invalid-login-credentials'
                    ].includes(firebaseError.code)

                    if (canUseLegacyLogin) {
                        dispatch(login(email.trim(), password))
                    } else {
                        toast.error(firebaseError.message || 'Firebase sign-in failed. Please try again.')
                    }
                }
            })
            .catch(validationError => toast.error(validationError.errors[0]))
    }

    const firebaseGoogleLoginHandler = async () => {
        try {
            const credential = await signInWithFirebaseGoogle()
            const succeeded = await dispatch(loginWithFirebase(credential.user))
            if (!succeeded) await signOut(firebaseAuth)
        } catch (firebaseError) {
            if (firebaseError.code !== 'auth/popup-closed-by-user') {
                toast.error(firebaseError.message || 'Firebase Google sign-in failed. Please try again.')
            }
        }
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
                                        className="form-control auth-input"
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
                                        className="form-control auth-input"
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
                                    className="btn btn-block auth-primary-button"
                                    disabled={loading}
                                >
                                    {loading ? 'SIGNING IN...' : 'Sign In'}
                                </button>

                                <div className="social-login-divider"><span>or continue with</span></div>
                                {isFirebaseConfigured ? (
                                    <button
                                        type="button"
                                        className="btn btn-block google-auth-button"
                                        disabled={loading}
                                        onClick={firebaseGoogleLoginHandler}
                                    >
                                        <svg className="google-auth-logo" viewBox="0 0 48 48" aria-hidden="true">
                                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
                                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.27 5.48-4.78 7.18l7.73 6C44.4 37.97 46.98 31.84 46.98 24.55Z" />
                                            <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.88.93 7.56 2.56 10.78l7.97-6.19Z" />
                                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.73-6c-2.14 1.44-4.89 2.3-8.17 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
                                        </svg>
                                        <span>Continue with Google</span>
                                    </button>
                                ) : import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
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
                                    <p className="social-login-setup-note">
                                        Firebase sign-in is unavailable until the Firebase web app settings are configured.
                                    </p>
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
