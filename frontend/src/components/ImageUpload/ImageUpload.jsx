// src/components/ImageUpload/ImageUpload.jsx
import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import api from '../../store/api/api';

const ImageUpload = ({ onImagesUploaded, maxImages = 10, existingImages = [] }) => {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [uploadedImages, setUploadedImages] = useState(existingImages);
    const [previewImages, setPreviewImages] = useState([]);
    const { token } = useSelector((state) => state.auth);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    }, []);

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const handleFiles = async (files) => {
        const fileArray = Array.from(files);

        // Check max images limit
        if (uploadedImages.length + fileArray.length > maxImages) {
            alert(`Maximum ${maxImages} images allowed`);
            return;
        }

        // Validate file types
        const validFiles = fileArray.filter(file => {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                alert(`${file.name} is not a valid image file`);
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert(`${file.name} is too large. Max size is 5MB`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        // Create previews
        const previews = validFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setPreviewImages(prev => [...prev, ...previews]);

        // Upload files
        await uploadImages(validFiles);
    };

    const uploadImages = async (files) => {
        setUploading(true);
        const formData = new FormData();

        files.forEach(file => {
            formData.append('images', file);
        });

        try {
            const response = await api.post('/upload/product-images', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const newImages = response.data.data.images;
            const newThumbnails = response.data.data.thumbnails;

            const imageData = newImages.map((img, index) => ({
                url: img,
                thumbnail: newThumbnails[index],
            }));

            setUploadedImages(prev => [...prev, ...imageData]);
            setPreviewImages([]);

            if (onImagesUploaded) {
                onImagesUploaded([...uploadedImages, ...imageData]);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload images. Please try again.');
            setPreviewImages([]);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = async (index) => {
        const imageToRemove = uploadedImages[index];

        try {
            await api.delete('/upload/product-images', {
                data: { imageUrls: [imageToRemove.url] },
            });

            const newImages = uploadedImages.filter((_, i) => i !== index);
            setUploadedImages(newImages);

            if (onImagesUploaded) {
                onImagesUploaded(newImages);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete image');
        }
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                    disabled={uploading || uploadedImages.length >= maxImages}
                />

                <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                >
                    <svg
                        className="w-12 h-12 text-gray-400 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                    </svg>
                    <p className="text-lg font-medium text-gray-700 mb-2">
                        {dragActive ? 'Drop images here' : 'Drag & drop images or click to browse'}
                    </p>
                    <p className="text-sm text-gray-500">
                        PNG, JPG, GIF, WEBP up to 5MB ({uploadedImages.length}/{maxImages} images)
                    </p>
                </label>

                {uploading && (
                    <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <p className="text-gray-600">Uploading...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Preview Images (while uploading) */}
            {previewImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {previewImages.map((preview, index) => (
                        <div key={index} className="relative aspect-square">
                            <img
                                src={preview.preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg opacity-50"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Uploaded Images */}
            {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedImages.map((image, index) => (
                        <div key={index} className="relative group aspect-square">
                            <img
                                src={image.thumbnail || image.url}
                                alt={`Product ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            {index === 0 && (
                                <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                    Main
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
