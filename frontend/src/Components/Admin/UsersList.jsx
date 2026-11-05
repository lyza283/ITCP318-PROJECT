import { useCallback } from 'react'
import { Link } from 'react-router-dom'

import 'react-toastify/dist/ReactToastify.css';

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'

import { errMsg, successMsg } from '../Utils/helpers';
import adminApi from './adminApi'
import InfiniteDataGrid from '../Utils/InfiniteDataGrid'
import InfiniteScrollSentinel from '../Utils/InfiniteScrollSentinel'
import ListPagination from '../Utils/ListPagination'
import useInfiniteRecords from '../Utils/useInfiniteRecords'
import { PAGE_SIZE } from '../Utils/pagination'

const UsersList = () => {
    const fetchPage = useCallback(async page => {
        const { data } = await adminApi.get('/admin/users', { params: { page, limit: PAGE_SIZE } })
        return data
    }, [])
    const onLoadError = useCallback(error => {
        errMsg(error.response?.data?.message || error.message || 'Unable to load users.')
    }, [])
    const {
        records: allUsers,
        loading,
        loadingMore,
        hasMore,
        failed,
        currentPage,
        totalCount,
        pageSize,
        loadMore,
        goToPage,
        removeRecord
    } = useInfiniteRecords(fetchPage, 'users', true, onLoadError)

    const deleteUser = async (id) => {
        try {
            const { data } = await adminApi.delete(`/admin/user/${id}`)
            if (data.success) {
                removeRecord(id, user => user._id)
                successMsg('User deleted successfully')
            }

        } catch (error) {
            errMsg(error.response?.data?.message || error.message || 'Unable to delete user.')
        }
    }

    const deleteUserHandler = (id) => {
        deleteUser(id)
    }

    const columns = [
        {
            field: 'id',
            headerName: 'User ID',
            flex: 2,
            minWidth: 380,
            renderCell: (params) => <span style={{ wordBreak: 'break-all' }}>{params.value}</span>
        },
        {
            field: 'name',
            headerName: 'Name',
            flex: 1,
            minWidth: 170
        },
        {
            field: 'email',
            headerName: 'Email',
            flex: 1,
            minWidth: 170,
            renderCell: (params) => (
                <span title={params.value} className="admin-user-email">
                    {params.value}
                </span>
            )
        },
        {
            field: 'role',
            headerName: 'Role',
            flex: 1,
            minWidth: 170
        },

        {
            field: 'actions',
            headerName: 'Actions',
            flex: 1,
            minWidth: 170,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <>
                    <Link to={`/admin/user/${params.id}`} className="btn btn-primary py-1 px-2" aria-label={`Edit ${params.row.name}`}>
                        <i className="fa fa-pencil" aria-hidden="true"></i>
                    </Link>
                    <button type="button" className="btn btn-danger py-1 px-2 ml-2" onClick={() => deleteUserHandler(params.id)} aria-label={`Delete ${params.row.name}`}>
                        <i className="fa fa-trash" aria-hidden="true"></i>
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
            <main className="admin-page-content">
                <h1 className="admin-page-title">All Users</h1>
                {loading ? <Loader /> : (
                    <div className="admin-data-grid">
                        <InfiniteDataGrid
                            rows={rows}
                            columns={columns}
                            hasMore={hasMore}
                            loadingMore={loadingMore}
                            onLoadMore={loadMore}
                            disableSelectionOnClick
                            getRowId={(row) => row.id}
                            showToolbar
                        />
                    </div>
                )}
                {!loading && (
                    <ListPagination
                        currentPage={currentPage}
                        totalCount={totalCount}
                        pageSize={pageSize}
                        disabled={loading}
                        onChange={goToPage}
                    />
                )}
                {!loading && (
                    <InfiniteScrollSentinel
                        hasMore={hasMore}
                        loading={false}
                        loadingMore={loadingMore}
                        failed={failed}
                        observeWindowScroll={false}
                        onLoadMore={loadMore}
                    />
                )}
            </main>
        </>
    )
}

export default UsersList
