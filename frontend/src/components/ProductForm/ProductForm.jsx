/* eslint-disable react-hooks/set-state-in-effect */
// src/components/ProductForm/ProductForm.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";

const ProductForm = ({ product, categories, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    longDescription: "",
    price: "",
    discountPrice: "",
    categoryId: "",
    brand: "",
    stock: "",
    sku: "",
    weight: "",
    images: [], // For existing: strings (URLs); new: not stored here, use separate state
    thumbnail: "", // For existing: string (URL)
    tags: "",
    isFeatured: false,
    isActive: true,
    stockStatus: "in-stock",
    variants: [],
    specifications: [],
    seo: {
      metaTitle: "",
      metaDescription: "",
      keywords: "", // String for comma-separated input
    },
  });

  // Separate state for new files
  const [newImages, setNewImages] = useState([]); // Array of {file, preview, name}
  const [newThumbnail, setNewThumbnail] = useState(null); // {file, preview, name} or null
  const [dragging, setDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [variantName, setVariantName] = useState("");
  const [variantOptions, setVariantOptions] = useState("");
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");
  const [categoryError, setCategoryError] = useState(false);

  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        tags: product.tags?.join(", ") || "",
        seo: {
          ...product.seo,
          keywords: Array.isArray(product.seo?.keywords)
            ? product.seo.keywords.join(", ")
            : product.seo?.keywords || "",
        },
      });
      // Clear new files on edit load
      setNewImages([]);
      setNewThumbnail(null);
      // Clean up previews if any
      newImages.forEach((img) => URL.revokeObjectURL(img.preview));
    }
  }, [product]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;

    // Clear category error when a category is selected
    if (name === "categoryId" && value) {
      setCategoryError(false);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const handleSEOChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        [name]: value,
      },
    }));
  }, []);

  // File handlers
  const handleFilesSelect = useCallback(
    (files) => {
      const newFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/")
      );
      const added = [];
      newFiles.forEach((file) => {
        if (newImages.length < 9) {
          // Leave room for thumbnail if separate
          const preview = URL.createObjectURL(file);
          added.push({ file, preview, name: file.name });
        }
      });
      if (added.length > 0) {
        setNewImages((prev) => [...prev, ...added]);
        toast.success(`${added.length} images added!`);
      }
    },
    [newImages.length]
  );

  const handleImageChange = useCallback(
    (e) => {
      handleFilesSelect(e.target.files);
    },
    [handleFilesSelect]
  );

  const handleThumbnailChange = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith("image/")) {
        if (newThumbnail) {
          URL.revokeObjectURL(newThumbnail.preview);
        }
        const preview = URL.createObjectURL(file);
        setNewThumbnail({ file, preview, name: file.name });
      }
    },
    [newThumbnail]
  );

  const removeNewImage = useCallback(
    (index) => {
      const img = newImages[index];
      if (img.preview) {
        URL.revokeObjectURL(img.preview);
      }
      setNewImages((prev) => prev.filter((_, i) => i !== index));
    },
    [newImages]
  );

  const removeNewThumbnail = useCallback(() => {
    if (newThumbnail?.preview) {
      URL.revokeObjectURL(newThumbnail.preview);
    }
    setNewThumbnail(null);
  }, [newThumbnail]);

  // Drag-drop handlers
  const handleFileDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      handleFilesSelect(e.dataTransfer.files);
    },
    [handleFilesSelect]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  // Existing image remove (for edit, but since replace on upload, perhaps warn or just display)
  // For simplicity, display existing, but can't remove without backend support; assume replace all on new upload
  const removeExistingImage = useCallback((index) => {
    // TODO: If want to remove specific, need backend update to partial images
    toast.warning(
      "Uploading new images will replace all. For partial updates, handle in backend."
    );
    // Or set formData.images = filter, but since service keeps if no files, but if remove, send updated array without files
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }, []);

  const removeExistingThumbnail = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      thumbnail: "",
    }));
  }, []);

  // Variant and spec handlers (unchanged)
  
  const addVariant = () => {
    if (variantName && variantOptions) {
      const options = variantOptions
        .split(",")
        .map((opt) => opt.trim())
        .filter(Boolean);
      if (options.length > 0) {
        setFormData((prev) => ({
          ...prev,
          variants: [...prev.variants, { name: variantName.trim(), options }],
        }));
        setVariantName("");
        setVariantOptions("");
      }
    }
  };

  const removeVariant = (index) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const addSpecification = () => {
    if (specKey && specValue) {
      setFormData((prev) => ({
        ...prev,
        specifications: [
          ...prev.specifications,
          { key: specKey.trim(), value: specValue.trim() },
        ],
      }));
      setSpecKey("");
      setSpecValue("");
    }
  };

  const removeSpecification = (index) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  // Progress simulation
  const simulateProgress = useCallback(() => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 20;
      });
    }, 300);
    // Clear after 5s
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(0);
    }, 5000);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Existing validations
    if (!formData.categoryId || formData.categoryId === "") {
      setCategoryError(true);
      toast.error("Please select a category for the product");
      document.querySelector('select[name="categoryId"]')?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    if (parseInt(formData.stock) < 0) {
      toast.error("Stock cannot be negative");
      return;
    }

    if (
      formData.discountPrice &&
      parseFloat(formData.discountPrice) >= parseFloat(formData.price)
    ) {
      toast.error("Discount price must be less than regular price");
      return;
    }

    // Prepare FormData
    const submitData = new FormData();

    // Append simple fields
    const simpleFields = [
      "title",
      "description",
      "longDescription",
      "price",
      "discountPrice",
      "brand",
      "stock",
      "sku",
      "weight",
      "tags",
      "isFeatured",
      "isActive",
      "stockStatus",
    ];
    simpleFields.forEach((key) => {
      const value = formData[key];
      if (value !== undefined && value !== null && value !== "") {
        submitData.append(key, String(value));
      }
    });

    // Handle categoryId separately - extract _id if it's an object
    const categoryIdValue =
      typeof formData.categoryId === "object"
        ? formData.categoryId?._id || formData.categoryId?.toString() || ""
        : formData.categoryId || "";
    if (categoryIdValue) {
      submitData.append("categoryId", categoryIdValue);
    }

    // Append variants array of objects
    formData.variants.forEach((variant, idx) => {
      submitData.append(`variants[${idx}].name`, variant.name);
      variant.options.forEach((opt, optIdx) => {
        submitData.append(`variants[${idx}].options[${optIdx}]`, opt);
      });
    });

    // Append specifications
    formData.specifications.forEach((spec, idx) => {
      submitData.append(`specifications[${idx}].key`, spec.key);
      submitData.append(`specifications[${idx}].value`, spec.value);
    });

    // Append SEO
    if (formData.seo) {
      submitData.append("seo[metaTitle]", formData.seo.metaTitle || "");
      submitData.append(
        "seo[metaDescription]",
        formData.seo.metaDescription || ""
      );
      submitData.append("seo[keywords]", formData.seo.keywords || ""); // String, split in backend
    }

    // Append files: thumbnail first, then images
    if (newThumbnail?.file) {
      submitData.append("images", newThumbnail.file);
    }
    newImages.forEach((img) => {
      submitData.append("images", img.file);
    });

    // If no new files, existing will be kept by backend

    simulateProgress();

    // Debug: Log all FormData entries
    console.log("📤 FormData being sent:");
    for (let [key, value] of submitData.entries()) {
      console.log(
        `  ${key}:`,
        value instanceof File ? `File(${value.name})` : value
      );
    }

    try {
      await onSubmit(submitData);
      toast.success(
        product
          ? "Product updated successfully!"
          : "Product created successfully!"
      );
      // Cleanup previews
      [...newImages, newThumbnail].forEach((item) => {
        if (item?.preview) URL.revokeObjectURL(item.preview);
      });
      setNewImages([]);
      setNewThumbnail(null);
      setUploadProgress(0);
    } catch (error) {
      const errorMessage =
        error?.message ||
        "Submission failed! Please check the form and try again.";
      toast.error(errorMessage);
      console.error("Form submission error:", error);
      setUploadProgress(0);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-md p-6 space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {product ? "Edit Product" : "Create New Product"}
      </h2>

      {/* Basic Information - unchanged */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter product title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                categoryError ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {categoryError && (
              <p className="text-red-500 text-sm mt-1">
                Please select a category before submitting
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter brand name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SKU
            </label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Auto-generated if empty"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Short Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Brief product description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Long Description (HTML supported)
          </label>
          <textarea
            name="longDescription"
            value={formData.longDescription}
            onChange={handleChange}
            rows="6"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="Detailed product description (supports HTML)"
          />
        </div>
      </div>

      {/* Pricing & Inventory - unchanged */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
          Pricing & Inventory
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price * (₹)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Price (₹)
            </label>
            <input
              type="number"
              name="discountPrice"
              value={formData.discountPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock * (units)
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Status
            </label>
            <select
              name="stockStatus"
              value={formData.stockStatus}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="in-stock">In Stock</option>
              <option value="out-of-stock">Out of Stock</option>
              <option value="pre-order">Pre-order</option>
            </select>
          </div>

          <div className="flex items-center space-x-6 pt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Featured Product
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>
          </div>
        </div>
      </div>

      {/* Images - Updated with file upload, drag-drop, previews */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
          Images
        </h3>

        {/* Existing Thumbnail Display (if editing) */}
        {product && formData.thumbnail && (
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Thumbnail
            </label>
            <img
              src={formData.thumbnail}
              alt="Current Thumbnail"
              className="w-32 h-32 object-cover rounded border"
            />
            <button
              type="button"
              onClick={removeExistingThumbnail}
              className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-500"
              title="Clear current (new upload will replace)"
            >
              ×
            </button>
          </div>
        )}

        {/* New Thumbnail Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Thumbnail (optional - will replace current)
          </label>
          <input
            type="file"
            ref={thumbnailInputRef}
            onChange={handleThumbnailChange}
            accept="image/*"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {newThumbnail && (
            <div className="mt-2 relative">
              <img
                src={newThumbnail.preview}
                alt="New Thumbnail Preview"
                className="w-32 h-32 object-cover rounded border"
              />
              <button
                type="button"
                onClick={removeNewThumbnail}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                ×
              </button>
              <p className="text-xs text-gray-500 mt-1">{newThumbnail.name}</p>
            </div>
          )}
        </div>

        {/* Existing Images Display (if editing) */}
        {product && formData.images?.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Images (new uploads will replace all)
            </label>
            <div className="flex flex-wrap gap-2">
              {formData.images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img}
                    alt={`Current Product ${index + 1}`}
                    className="w-20 h-20 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Additional Images - Drag & Drop */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Additional Images (optional)
          </label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
            onDrop={handleFileDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <p className="text-gray-600 mb-2">
              Drag & drop images here, or click to select
            </p>
            <input
              type="file"
              multiple
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
              id="image-upload"
              ref={fileInputRef}
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-block"
            >
              Select Images
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Max 10 total images, 5MB each
            </p>
          </div>

          {/* New Images Previews */}
          {newImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {newImages.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img.preview}
                    alt={`New Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded border"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded">
                    <span className="text-white text-xs text-center px-1">
                      {img.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {uploadProgress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}
      </div>

      {/* Variants - unchanged */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
          Product Variants
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input
            type="text"
            value={variantName}
            onChange={(e) => setVariantName(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Variant name (e.g., Color)"
          />
          <input
            type="text"
            value={variantOptions}
            onChange={(e) => setVariantOptions(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Options (comma-separated)"
          />
          <button
            type="button"
            onClick={addVariant}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={!variantName || !variantOptions}
          >
            Add Variant
          </button>
        </div>

        {formData.variants.length > 0 && (
          <div className="space-y-2">
            {formData.variants.map((variant, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-3 rounded"
              >
                <div>
                  <span className="font-medium">{variant.name}:</span>{" "}
                  <span className="text-gray-600">
                    {variant.options.join(", ")}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Specifications - unchanged */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
          Specifications
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input
            type="text"
            value={specKey}
            onChange={(e) => setSpecKey(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Specification name"
          />
          <input
            type="text"
            value={specValue}
            onChange={(e) => setSpecValue(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Specification value"
          />
          <button
            type="button"
            onClick={addSpecification}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={!specKey || !specValue}
          >
            Add Spec
          </button>
        </div>

        {formData.specifications.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {formData.specifications.map((spec, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-3 rounded"
              >
                <div>
                  <span className="font-medium">{spec.key}:</span>{" "}
                  <span className="text-gray-600">{spec.value}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeSpecification(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tags & SEO - Updated with keywords input */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
          Tags & SEO
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="electronics, gadgets, tech"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SEO Meta Title
            </label>
            <input
              type="text"
              name="metaTitle"
              value={formData.seo.metaTitle}
              onChange={handleSEOChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="SEO-friendly title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SEO Meta Description
            </label>
            <input
              type="text"
              name="metaDescription"
              value={formData.seo.metaDescription}
              onChange={handleSEOChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="SEO-friendly description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SEO Keywords (comma-separated)
            </label>
            <input
              type="text"
              name="keywords"
              value={formData.seo.keywords}
              onChange={handleSEOChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="keyword1, keyword2, keyword3"
            />
          </div>
        </div>
      </div>

      {/* Form Actions - Updated button text */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={uploadProgress > 0 && uploadProgress < 100}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
        >
          {uploadProgress > 0
            ? `Uploading... ${Math.round(uploadProgress)}%`
            : product
            ? "Update Product"
            : "Create Product"}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
