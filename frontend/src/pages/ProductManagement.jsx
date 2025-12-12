// src/pages/ProductManagement.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { findAllProducts, createProduct, deleteProduct } from '../store/slices/productsSlice';
import { findAllCategories } from '../store/slices/categoriesSlice';
import ProductForm from '../components/ProductForm/ProductForm';
import ProductList from '../components/ProductList/ProductList';
import { toast } from 'react-toastify';

const ProductManagement = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const { products, loading } = useSelector((state) => state.products);
    const { categories } = useSelector((state) => state.categories);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(findAllProducts({ limit: 50, isActive: undefined }));
        dispatch(findAllCategories());
    }, [dispatch]);

    // Check if user is admin or seller
    if (!user || (user.role !== 'admin' && user.role !== 'seller')) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
                <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
            </div>
        );
    }

    const handleCreateProduct = async (productData) => {
        try {
            await dispatch(createProduct(productData)).unwrap();
            setShowForm(false);
            dispatch(findAllProducts({ limit: 50, isActive: undefined }));
        } catch (error) {
            toast.error('Failed to create product:', error);
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setShowForm(true);
        toast.info('Editing product');
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await dispatch(deleteProduct(productId)).unwrap();
                dispatch(findAllProducts({ limit: 50, isActive: undefined }));
            } catch (error) {
                toast.error('Failed to delete product:', error);
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
                <button
                    onClick={() => {
                        setEditingProduct(null);
                        setShowForm(!showForm);
                    }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                    {showForm ? 'Cancel' : '+ Add New Product'}
                </button>
            </div>

            {showForm && (
                <div className="mb-8">
                    <ProductForm
                        product={editingProduct}
                        categories={categories}
                        onSubmit={handleCreateProduct}
                        onCancel={() => {
                            setShowForm(false);
                            setEditingProduct(null);
                        }}
                    />
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <ProductList
                    products={products?.products || products || []}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                />
            )}
        </div>
    );
};

export default ProductManagement;
