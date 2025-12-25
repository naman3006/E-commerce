// src/pages/CategoryManagement.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { findAllCategories, createCategory } from '../store/slices/categoriesSlice';
import { toast } from 'react-toastify';
import { getOptimizedImageUrl } from '../utils/urlUtils';

const CategoryManagement = () => {
    const dispatch = useDispatch();
    const { categories, loading } = useSelector((state) => state.categories);
    const { user } = useSelector((state) => state.auth);

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
    });

    useEffect(() => {
        dispatch(findAllCategories());
    }, [dispatch]);

    // Check permissions
    if (!user || user.role !== 'admin') {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
                <p className="text-gray-600 mt-2">Only admins can access this page.</p>
            </div>
        );
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(createCategory(formData)).unwrap();
            setShowForm(false);
            setFormData({ name: '', description: '', image: '' });
            dispatch(findAllCategories()); // Refresh list
        } catch (error) {
            toast.error(typeof error === 'string' ? error : 'Failed to create category');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                    {showForm ? 'Cancel' : '+ Add New Category'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8 transform transition-all duration-300">
                    <h2 className="text-xl font-semibold mb-6 text-gray-800">New Category</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Category Name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                                <input
                                    type="text"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Category Description"
                                ></textarea>
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                className="bg-green-600 text-white px-8 py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
                            >
                                Save Category
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                        <div key={category._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col">
                            <div className="flex items-center space-x-4">
                                {category.image ? (
                                    <img src={getOptimizedImageUrl(category.image)} alt={category.name} className="h-16 w-16 object-cover rounded-md" />
                                ) : (
                                    <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                                        <span className="text-2xl">📁</span>
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-1">{category.description || 'No description'}</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                                <span>ID: {category._id.slice(-6)}</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {category.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    ))}
                    {categories.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                            <p className="text-lg">No categories found.</p>
                            <p className="text-sm">Create one to get started!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CategoryManagement;
