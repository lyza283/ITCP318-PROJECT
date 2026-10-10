import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'


import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'
import adminApi from './adminApi'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DataGrid, } from '@mui/x-data-grid'

const ProductsList = () => {
    const [products, setProducts] = useState([])
    const [error, setError] = useState('')
    const [deleteError, setDeleteError] = useState('')

    const [loading, setLoading] = useState(true)
    const [isDeleted, setIsDeleted] = useState(false)

    const navigate = useNavigate()

    useEffect(() => {
        let active = true
        adminApi.get('/admin/products')
            .then(({ data }) => {
                if (active) {
                    setProducts(data.products)
                }
            })
            .catch(error => {
                if (active) {
                    setError(error.response?.data?.message || error.message || 'Unable to load products.')
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false)
                }
            })

        return () => {
            active = false
        }
    }, [])

    useEffect(() => {
        if (error) {
            toast.error(error, {
                position: 'bottom-right'
            });
        }

        if (deleteError) {
            toast.error(deleteError, {
                position: 'bottom-right'
            });
        }

        if (isDeleted) {
            toast.success('Product deleted successfully', {
                position: 'bottom-right'
            })
            navigate('/admin/products');
        }
    }, [error, deleteError, isDeleted, navigate])

    const deleteProduct = async (id) => {
        try {
            const { data } = await adminApi.delete(`/admin/product/${id}`)

            setIsDeleted(data.success)
        } catch (error) {
            setDeleteError(error.response?.data?.message || error.message || 'Unable to delete product.')

        }
    }
    const deleteProductHandler = (id) => {
        deleteProduct(id)
    }

    const columns = [
        {
            field: 'id',
            headerName: 'Product ID',
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
            field: 'price',
            headerName: 'Price',
            width: 120,
            align: 'right',
            headerAlign: 'right'
        },
        {
            field: 'stock',
            headerName: 'Stock',
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
                    <Link to={`/admin/product/${params.id}`} className="btn btn-primary py-1 px-2">
                        <i className="fa fa-pencil"></i>
                    </Link>
                    <button className="btn btn-danger py-1 px-2 ml-2" onClick={() => deleteProductHandler(params.id)}>
                        <i className="fa fa-trash"></i>
                    </button>
                </>
            )
        }
    ];

    const rows = products.map(product => ({
        id: product._id,
        name: product.name,
        price: `$${product.price}`,
        stock: product.stock,
    }));

    return (
        <>
            <MetaData title={'All Products'} />
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>

                <div className="col-12 col-md-10">
                    <>
                        <h1 className="my-5">All Products</h1>

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

export default ProductsList