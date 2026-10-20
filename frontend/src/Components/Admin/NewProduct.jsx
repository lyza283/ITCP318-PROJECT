import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import adminApi from './adminApi'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { productSchema } from '../../validation/schemas'
import { artSupplyCategories } from '../../constants/productCategories'

const NewProduct = () => {

    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Sketchbooks');
    const [stock, setStock] = useState(0);
    const [seller, setSeller] = useState('');
    const [images, setImages] = useState([]);
    const [imagesPreview, setImagesPreview] = useState([])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState('')

    let navigate = useNavigate()

    const submitHandler = async (e) => {
        e.preventDefault();

        try {
            await productSchema.validate({
                name,
                price,
                description,
                category,
                stock,
                seller,
                imageCount: images.length
            }, { abortEarly: false })
        } catch (validationError) {
            toast.error(validationError.errors[0], { position: 'bottom-right' })
            return
        }

        const formData = new FormData();
        formData.set('name', name);
        formData.set('price', price);
        formData.set('description', description);
        formData.set('category', category);
        formData.set('stock', stock);
        formData.set('seller', seller);

        images.forEach(image => {
            formData.append('images', image)
        })

        newProduct(formData)
    }

    const onChange = e => {
        const files = Array.from(e.target.files)
        setImagesPreview([]);
        setImages(files)
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.readyState === 2) {
                    setImagesPreview(oldArray => [...oldArray, reader.result])
                }
            }

            reader.readAsDataURL(file)
            // console.log(reader)
        })

    }
    const newProduct = async (formData) => {

        try {
            setLoading(true)
            const { data } = await adminApi.post('/admin/product/new', formData)
            setLoading(false)
            setSuccess(data.success)
        } catch (error) {
            setLoading(false)
            setError(error.response?.data?.message || error.message || 'Unable to create product. Please try again.')

        }
    }
    useEffect(() => {

        if (error) {
            toast.error(error, {
                position: 'bottom-right'
            });
        }

        if (success) {
            navigate('/admin/products');
            toast.success('Product created successfully', {
                position: 'bottom-right'
            })

        }

    }, [error, success, navigate])


    return (
        <>
            <MetaData title={'New Product'} />
            <main className="admin-page-content">
                <div className="wrapper my-5 product-editor-wrapper">
                    <form className="shadow-lg product-editor-form" onSubmit={submitHandler} encType='multipart/form-data'>
                        <h1 className="mb-4">New Product</h1>
                        <p className="product-editor-subtitle">Enter the product details and upload one or more images.</p>

                                <div className="form-group">
                                    <label htmlFor="name_field">Name</label>
                                    <input
                                        type="text"
                                        id="name_field"
                                        className="form-control"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="price_field">Price</label>
                                    <input
                                        type="text"
                                        id="price_field"
                                        className="form-control"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                    />
                                </div>

                                <div className="form-group product-editor-description">
                                    <label htmlFor="description_field">Description</label>
                                    <textarea className="form-control" id="description_field" rows="5" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="category_field">Category</label>
                                    <select className="form-control" id="category_field" value={category} onChange={(e) => setCategory(e.target.value)}>
                                        {artSupplyCategories.map(category => (
                                            <option key={category} value={category} >{category}</option>
                                        ))}

                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="stock_field">Stock</label>
                                    <input
                                        type="number"
                                        id="stock_field"
                                        className="form-control"
                                        value={stock}
                                        onChange={(e) => setStock(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="seller_field">Seller Name</label>
                                    <input
                                        type="text"
                                        id="seller_field"
                                        className="form-control"
                                        value={seller}
                                        onChange={(e) => setSeller(e.target.value)}
                                    />
                                </div>

                                <div className='form-group product-editor-images'>
                                    <label>Images</label>

                                    <div className='custom-file'>
                                        <input
                                            type='file'
                                            name='images'
                                            className='custom-file-input'
                                            id='customFile'
                                            onChange={onChange}
                                            multiple
                                            accept="image/jpeg,image/png,image/webp"
                                        />
                                        <label className='custom-file-label' htmlFor='customFile'>
                                            Choose Images (up to 10)
                                        </label>
                                    </div>

                                    {imagesPreview.map(img => (
                                        <img src={img} key={img} alt="Images Preview" className="mt-3 mr-2" width="55" height="52" />
                                    ))}

                                </div>


                                <button
                                    id="login_button"
                                    type="submit"
                                    className="btn btn-block py-3"
                                    disabled={loading}
                                >
                                    {loading ? 'CREATING...' : 'CREATE'}
                                </button>

                    </form>
                </div>
            </main>

        </>
    )
}
export default NewProduct
