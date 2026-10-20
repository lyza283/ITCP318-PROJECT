import * as yup from 'yup'

export const loginSchema = yup.object({
    email: yup.string().trim().email('Enter a valid email address.').required('Email is required.'),
    password: yup.string().required('Password is required.').min(6, 'Password must be at least 6 characters.')
})

export const profileSchema = yup.object({
    name: yup.string().trim().min(2, 'Name must be at least 2 characters.').max(30, 'Name cannot exceed 30 characters.').required('Name is required.'),
    email: yup.string().trim().email('Enter a valid email address.').required('Email is required.')
})

export const productSchema = yup.object({
    name: yup.string().trim().min(2, 'Product name must be at least 2 characters.').max(100, 'Product name cannot exceed 100 characters.').required('Product name is required.'),
    price: yup.number().typeError('Enter a valid price.').min(0, 'Price cannot be negative.').required('Price is required.'),
    description: yup.string().trim().min(10, 'Description must be at least 10 characters.').required('Description is required.'),
    category: yup.string().required('Choose a category.'),
    stock: yup.number().typeError('Enter a valid stock quantity.').integer('Stock must be a whole number.').min(0, 'Stock cannot be negative.').required('Stock is required.'),
    seller: yup.string().trim().min(2, 'Seller name must be at least 2 characters.').required('Seller name is required.'),
    imageCount: yup.number().integer().min(1, 'At least one product image is required.').max(10, 'You can add up to 10 product images.')
})
