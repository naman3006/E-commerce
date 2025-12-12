// src/components/ProductList/ProductList.jsx
import React from 'react';

const ProductList = ({ products, onEdit, onDelete }) => {
    const getImgSrc = (product) => {
        const srcCandidate = product?.thumbnail || (product?.images && product.images.length ? product.images[0] : null);
        if (!srcCandidate) {
            const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect fill='%23f3f4f6' width='100%25' height='100%25'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='14'>No image</text></svg>`;
            return `data:image/svg+xml;utf8,${svg}`;
        }
        let src = srcCandidate;
        if (!/^https?:\/\//i.test(src)) {
            if (!src.startsWith('/')) src = `/${src}`;
        }
        return src;
    };
    if (!products || products.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500">No products found. Create your first product!</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product, index) => (
                            <tr key={product._id || index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img
                                            src={getImgSrc(product)}
                                            alt={product.title}
                                            onError={(e) => { e.target.onerror = null; e.target.src = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect fill='%23f3f4f6' width='100%25' height='100%25'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='14'>No image</text></svg>`; }}
                                            className="h-10 w-10 rounded object-cover mr-3"
                                        />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {product.title}
                                            </div>
                                            {product.sku && (
                                                <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {product.categoryId?.name || 'N/A'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        ₹{product.price.toFixed(2)}
                                        {product.discountPrice && (
                                            <div className="text-xs text-green-600">
                                                Sale: ₹{product.discountPrice.toFixed(2)}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{product.stock}</div>
                                    <div className={`text-xs ${product.stockStatus === 'in-stock' ? 'text-green-600' :
                                        product.stockStatus === 'out-of-stock' ? 'text-red-600' :
                                            'text-yellow-600'
                                        }`}>
                                        {product.stockStatus}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col gap-1">
                                        <span className={`inline-flex text-xs leading-5 font-semibold rounded-full px-2 py-1 ${product.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {product.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                        {product.isFeatured && (
                                            <span className="inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 px-2 py-1">
                                                Featured
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => onEdit(product)}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => onDelete(product._id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductList;
