import { useState, useEffect } from 'react'
import MetaData from '../Layout/MetaData'

import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import adminApi from './adminApi'
import { productSchema } from '../../validation/schemas'
import { productCategories } from '../../constants/productCategories'


const UpdateProduct = () => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [stock, setStock] = useState(0);
    const [seller, setSeller] = useState('');
    const [images, setImages] = useState([]);
    const [oldImages, setOldImages] = useState([]);
    const [imagesPreview, setImagesPreview] = useState([])
    const [loading, setLoading] = useState(true)

    const { id } = useParams();
    const navigate = useNavigate();

    const errMsg = (message = '') => toast.error(message, {
        position: 'bottom-right'
    });
    const successMsg = (message = '') => toast.success(message, {
        position: 'bottom-right'
    });

    useEffect(() => {
        let active = true
        adminApi.get(`/product/${id}`)
            .then(({ data }) => {
                if (active) {
                    const product = data.product
                    setName(product.name)
                    setPrice(product.price)
                    setDescription(product.description)
                    setCategory(product.category)
                    setSeller(product.seller)
                    setStock(product.stock)
                    setOldImages(product.images)
                }
            })
            .catch(error => {
                if (active) {
                    errMsg(error.response?.data?.message || error.message || 'Unable to load product.')
                }
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    }, [id])

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
                imageCount: oldImages.length + images.length
            }, { abortEarly: false })
        } catch (validationError) {
            errMsg(validationError.errors[0])
            return
        }

        const formData = new FormData();
        formData.set('name', name);
        formData.set('price', price);
        formData.set('description', description);
        formData.set('category', category);
        formData.set('stock', stock);
        formData.set('seller', seller);
        formData.set('retainedImages', JSON.stringify(oldImages.map(image => image.public_id)));
        images.forEach(image => {
            formData.append('images', image)
        })
        setLoading(true)
        adminApi.put(`/admin/product/${id}`, formData)
            .then(({ data }) => {
                if (data.success) {
                    navigate('/admin/products')
                    successMsg('Product updated successfully')
                }
            })
            .catch(error => {
                errMsg(error.response?.data?.message || error.message || 'Unable to update product.')
            })
            .finally(() => setLoading(false))
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
        })
    }
    return (
        <>
            <MetaData title={'Update Product'} />
            <main className="admin-page-content">
                <div className="wrapper my-5 product-editor-wrapper">
                    <form className="shadow-lg product-editor-form" onSubmit={submitHandler} encType='multipart/form-data'>
                                <h1 className="mb-4">Update Product</h1>
                                <p className="product-editor-subtitle">Review the product details and manage its images.</p>
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
                                        {productCategories.map(category => (
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
                                            Add Images (up to 10)
                                        </label>
                                    </div>
                                    {oldImages && oldImages.map(img => (
                                        <span className="product-image-preview" key={img.public_id}>
                                            <img src={img.url} alt="Current product" className="mt-3 mr-2" width="72" height="68" />
                                            <button
                                                type="button"
                                                className="product-image-remove"
                                                aria-label="Remove current image"
                                                onClick={() => setOldImages(current => current.filter(image => image.public_id !== img.public_id))}
                                            >
                                                &times;
                                            </button>
                                        </span>
                                    ))}
                                    {imagesPreview.map(img => (
                                        <img src={img} key={img} alt="Images Preview" className="mt-3 mr-2" width="55" height="52" />
                                    ))}
                                </div>
                                <button
                                    id="login_button"
                                    type="submit"
                                    className="btn btn-block py-3"
                                    disabled={loading ? true : false}
                                >
                                    UPDATE
                                </button>
                    </form>
                </div>
            </main>
        </>
    )
}

export default UpdateProduct