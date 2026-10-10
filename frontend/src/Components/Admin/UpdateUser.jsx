import { useState, useEffect } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'

import { errMsg, successMsg } from '../Utils/helpers'
import adminApi from './adminApi'

const UpdateUser = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [role, setRole] = useState('')
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate();

    const { id } = useParams();

    useEffect(() => {
        let active = true
        adminApi.get(`/admin/user/${id}`)
            .then(({ data }) => {
                if (active) {
                    setName(data.user.name)
                    setEmail(data.user.email)
                    setRole(data.user.role)
                }
            })
            .catch(error => {
                if (active) {
                    errMsg(error.response?.data?.message || error.message || 'Unable to load user.')
                }
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    }, [id])

    const submitHandler = (e) => {
        e.preventDefault();
        setLoading(true)
        adminApi.put(`/admin/user/${id}`, { name, email, role })
            .then(({ data }) => {
                if (data.success) {
                    successMsg('User updated successfully')
                    navigate('/admin/users')
                }
            })
            .catch(error => {
                errMsg(error.response?.data?.message || error.message || 'Unable to update user.')
            })
            .finally(() => setLoading(false))
    }

    return (
        <>
            <MetaData title={`Update User`} />
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>
                <div className="col-12 col-md-10">
                    {loading ? <Loader /> : <div className="row wrapper">
                        <div className="col-10 col-lg-5">
                            <form className="shadow-lg" onSubmit={submitHandler}>
                                <h1 className="mt-2 mb-5">Update User</h1>
                                <div className="form-group">
                                    <label htmlFor="name_field">Name</label>
                                    <input
                                        type="name"
                                        id="name_field"
                                        className="form-control"
                                        name='name'
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email_field">Email</label>
                                    <input
                                        type="email"
                                        id="email_field"
                                        className="form-control"
                                        name='email'
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="role_field">Role</label>
                                    <select
                                        id="role_field"
                                        className="form-control"
                                        name='role'
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                    >
                                        <option value="user">user</option>
                                        <option value="admin">admin</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn update-btn btn-block mt-4 mb-3" disabled={loading}>Update</button>
                            </form>
                        </div>
                    </div>}
                </div>
            </div>
        </>
    )
}

export default UpdateUser