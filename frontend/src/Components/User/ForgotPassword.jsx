import { useState } from 'react'

import MetaData from '../Layout/MetaData'
import { toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux'
import { forgotPassword } from '../../actions/userActions';
import { isFirebaseConfigured, sendFirebasePasswordReset } from '../../Utils/firebaseAuth'



const ForgotPassword = () => {
    const dispatch = useDispatch();
    const { loading } = useSelector(state => state.forgotPassword)


    const [email, setEmail] = useState('')
    // const [loading, setLoading] = useState('')

    // const forgotPassword = async (formData) => {
    //     const config = {
    //         headers: {
    //             'Content-Type': 'application/json'
    //         }
    //     }
    //     try {
    //         const { data } = await axios.post(`http://localhost:4001/api/v1/password/forgot`, formData, config)
    //         console.log(data.message)

    //         setLoading(false)
    //         toast.success(data.message, {
    //             position: 'bottom-center'
    //         });
    //         navigate('/login')
    //     } catch (error) {
    //         toast.error(error.response.data.message, {
    //             position: 'top-right'
    //         });
    //     }
    // }


    const submitHandler = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.set('email', email);
        dispatch(forgotPassword(formData))
    }

    const firebaseResetHandler = async () => {
        if (!email.trim()) {
            toast.error('Enter your email address first.')
            return
        }
        try {
            await sendFirebasePasswordReset(email.trim())
            toast.success('Firebase password reset email sent.')
        } catch (firebaseError) {
            toast.error(firebaseError.message || 'Unable to send the Firebase password reset email.')
        }
    }

    return (
        <>
            <MetaData title={'Forgot Password'} />
            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={submitHandler}>
                        <h1 className="mb-3">Forgot Password</h1>
                        <div className="form-group">
                            <label htmlFor="email_field">Enter Email</label>
                            <input
                                type="email"
                                id="email_field"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <button
                            id="forgot_password_button"
                            type="submit"
                            className="btn btn-block py-3"
                            disabled={loading ? true : false} >
                            Send Email
                        </button>
                        {isFirebaseConfigured && (
                            <button
                                type="button"
                                className="btn btn-outline-dark btn-block py-3 mt-2"
                                onClick={firebaseResetHandler}
                            >
                                Reset Firebase Password
                            </button>
                        )}

                    </form>
                </div>
            </div>

        </>
    )
}

export default ForgotPassword