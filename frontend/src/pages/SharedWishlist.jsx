import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../store/api/api';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';

const SharedWishlist = () => {
    const { token } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSharedWishlist();
    }, [token]);

    const fetchSharedWishlist = async () => {
        try {
            const res = await api.get(`/wishlist/share/${token}`);
            setWishlist(res.data);
        } catch (err) {
            // toast.error('List not found or private');
            // navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (productId) => {
        dispatch(addToCart({ productId, quantity: 1 }));
        toast.success('Added to cart!');
    };

    if (loading) return <div className="p-12 text-center">Loading...</div>;

    if (!wishlist) {
        return (
            <div className="max-w-md mx-auto mt-20 text-center p-8 bg-gray-50 rounded-2xl">
                <h2 className="text-2xl font-bold text-gray-900">Oops!</h2>
                <p className="text-gray-600 mt-2">This wishlist doesn't exist or is private.</p>
                <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg">Go Home</button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <div className="inline-block p-2 bg-indigo-50 rounded-full mb-4 px-4 text-indigo-700 font-bold text-sm tracking-wide">
                    SHARED WISHLIST
                </div>
                <h1 className="text-4xl font-bold text-gray-900 font-display">{wishlist.name}</h1>
                <p className="text-gray-500 mt-2">Check out this collection!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {wishlist.productIds?.map(product => (
                    <div key={product._id} className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 flex flex-col">
                        <div className="aspect-[4/3] bg-gray-100 rounded-xl mb-4 overflow-hidden relative">
                            {product.images?.[0] ? (
                                <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
                            )}
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{product.title}</h3>
                        <p className="text-indigo-600 font-bold text-xl mb-4">${product.price}</p>

                        <div className="mt-auto">
                            <button
                                onClick={() => handleAddToCart(product._id)}
                                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SharedWishlist;
