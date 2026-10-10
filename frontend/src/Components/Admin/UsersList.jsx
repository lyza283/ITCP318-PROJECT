import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import 'react-toastify/dist/ReactToastify.css';

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'

import { errMsg, successMsg } from '../Utils/helpers';
import adminApi from './adminApi'
import { DataGrid, } from '@mui/x-data-grid'

const UsersList = () => {
    const [loading, setLoading] = useState(true)
    const [allUsers, setAllUsers] = useState([])
    const navigate = useNavigate();
    const deleteUser = async (id) => {
        try {
            const { data } = await adminApi.delete(`/admin/user/${id}`)
            if (data.success) {
                successMsg('User deleted successfully')
                navigate('/admin/users')
            }

        } catch (error) {
            errMsg(error.response?.data?.message || error.message || 'Unable to delete user.')
        }
    }

    useEffect(() => {
        let active = true
        adminApi.get('/admin/users')
            .then(({ data }) => {
                if (active) setAllUsers(data.users)
            })
            .catch(error => {
                if (active) errMsg(error.response?.data?.message || error.message || 'Unable to load users.')
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    }, [])

    const deleteUserHandler = (id) => {
        deleteUser(id)
    }

    const columns = [
        {
            field: 'id',
            headerName: 'User ID',
            flex: 1,
            renderCell: (params) => <span style={{ wordBreak: 'break-all' }}>{params.value}</span>
        },
        {
            field: 'name',
            headerName: 'Name',

            width: 130,
            align: 'right',
            headerAlign: 'right'
        },
        {
            field: 'email',
            headerName: 'Email',
            width: 120,
            align: 'right',
            headerAlign: 'right'
        },
        {
            field: 'role',
            headerName: 'Role',
            width: 120,
            align: 'right',
            headerAlign: 'right'
        },

        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            sortable: false,
            filterable: false,
            renderCell: (params) => (

                <>
                    {console.log(params)}
                    <Link to={`/admin/user/${params.id}`} className="btn btn-primary py-1 px-2">
                        <i className="fa fa-pencil"></i>
                    </Link>
                    <button className="btn btn-danger py-1 px-2 ml-2" onClick={() => deleteUserHandler(params.id)}>
                        <i className="fa fa-trash"></i>
                    </button>
                </>
            )
        }
    ];
    const rows = allUsers.map(user => ({
        id: user._id,
        name: user.name,

        email: user.email,
        role: user.role,
    }));

    return (
        <>
            <MetaData title={'All Users'} />
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>
                <div className="col-12 col-md-10">
                    <>
                        <h1 className="my-5">All Users</h1>
                        {loading ? <Loader /> : (
                            <div style={{ width: '100%' }}>
                                <DataGrid
                                    rows={rows}
                                    columns={columns}

                                    pageSize={5}
                                    rowsPerPageOptions={[5, 10, 25]}
                                    disableSelectionOnClick
                                    getRowId={(row) => row.id}
                                    showToolbar
                                />
                            </div>
                        )}
                    </>
                </div>
            </div>
        </>
    )
}

export default UsersList
