// admin/components/ApartmentGallery.jsx
'use client';
import React, { useState, useEffect } from 'react';
import FileUpload from './FileUpload';

const ApartmentGallery = () => {
    const [apartments, setApartments] = useState([]);
    const [selectedApartmentId, setSelectedApartmentId] = useState('');
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [reorderMode, setReorderMode] = useState(false);
    const [showMobileUpload, setShowMobileUpload] = useState(false);

    // Load apartments
    useEffect(() => {
        const loadApartments = async () => {
            try {
                const res = await fetch('/api/admin/apartments');
                const data = await res.json();
                setApartments(data.apartments || []);
                if (data.apartments?.length) setSelectedApartmentId(data.apartments[0].id);
            } catch (err) {
                console.error(err);
            }
        };
        loadApartments();
    }, []);

    // Load images when apartment changes
    useEffect(() => {
        const loadImages = async () => {
            if (!selectedApartmentId) return setImages([]);
            try {
                setLoading(true);
                const res = await fetch(`/api/admin/gallery?apartmentId=${selectedApartmentId}`);
                const data = await res.json();
                setImages(data.images || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadImages();
    }, [selectedApartmentId]);

    const handleUploadComplete = (newImages) => {
        setImages(prev => [...prev, ...newImages]);
        setShowMobileUpload(false);
    };

    const openDeleteModal = (img) => {
        setSelectedImage(img);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setSelectedImage(null);
    };

    const handleDeleteImage = async (id) => {
        try {
            const res = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setImages(prev => prev.filter(img => img.id !== id));
                if (selectedImage?.id === id) {
                    setEditModalOpen(false);
                    setSelectedImage(null);
                }
                closeDeleteModal();
            } else {
                // You might want to show an error modal here instead
                console.error('Failed to delete image');
            }
        } catch (err) {
            console.error(err);
            // You might want to show an error modal here instead
        }
    };

    const handleSetPrimary = async (id) => {
        try {
            const res = await fetch(`/api/admin/gallery/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_primary: true }),
            });
            if (res.ok) {
                setImages(prev => prev.map(img => ({ ...img, is_primary: img.id === id })));
                if (selectedImage?.id === id) {
                    setSelectedImage(prev => ({ ...prev, is_primary: true }));
                }
            } else {
                console.error('Failed to set primary');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateFileName = async (id, newName) => {
        try {
            const res = await fetch(`/api/admin/gallery/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_name: newName }),
            });
            if (res.ok) {
                setImages(prev => prev.map(img => (img.id === id ? { ...img, image_name: newName } : img)));
                if (selectedImage?.id === id) {
                    setSelectedImage(prev => ({ ...prev, image_name: newName }));
                }
            } else {
                console.error('Failed to update name');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleReplaceImage = async (id, file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('apartmentId', selectedApartmentId);

            const res = await fetch(`/api/admin/gallery/${id}/replace`, { method: 'POST', body: formData });
            if (res.ok) {
                const updated = await res.json();
                setImages(prev => prev.map(img => (img.id === id ? { ...img, ...updated } : img)));
                if (selectedImage?.id === id) {
                    setSelectedImage(updated);
                }
            } else {
                console.error('Failed to replace image');
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Drag & drop for reorder
    const handleDragStart = (e, index) => e.dataTransfer.setData('index', index);
    const handleDragOver = (e) => e.preventDefault();
    const handleDrop = (e, targetIndex) => {
        e.preventDefault();
        const sourceIndex = parseInt(e.dataTransfer.getData('index'));
        if (sourceIndex === targetIndex) return;
        const updated = [...images];
        const [moved] = updated.splice(sourceIndex, 1);
        updated.splice(targetIndex, 0, moved);
        setImages(updated.map((img, i) => ({ ...img, display_order: i + 1 })));
    };

    const handleReorderSave = async () => {
        try {
            await Promise.all(images.map((img, i) =>
                fetch(`/api/admin/gallery/${img.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ display_order: i + 1 }),
                })
            ));
            setReorderMode(false);
        } catch (err) {
            console.error(err);
        }
    };

    const openEditModal = (img) => {
        setSelectedImage(img);
        setEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditModalOpen(false);
        setSelectedImage(null);
    };

    if (loading && !selectedApartmentId) {
        return (
            <div className="h-screen flex items-center justify-center bg-neutral-800 text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <section className="min-h-screen bg-neutral-800">
            {/* Fixed Apartment Selection Header */}
            <div className="sticky top-0 z-50 bg-neutral-900 border-b border-neutral-700 p-4 shadow-lg">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        {/* Apartment Selection */}
                        <div className="w-full sm:w-auto">
                            <label htmlFor="apartment" className="block text-sm font-medium text-neutral-300 mb-2">
                                Select Apartment
                            </label>
                            <select
                                id="apartment"
                                value={selectedApartmentId}
                                onChange={(e) => setSelectedApartmentId(e.target.value)}
                                className="w-full sm:w-64 px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            >
                                <option value="" className="bg-neutral-800">Choose an apartment...</option>
                                {apartments.map(ap => (
                                    <option key={ap.id} value={ap.id} className="bg-neutral-800">{ap.name || `Apartment ${ap.id}`}</option>
                                ))}
                            </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {/* Mobile Upload Button */}
                            <button
                                onClick={() => setShowMobileUpload(true)}
                                className="sm:hidden flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full justify-center"
                            >
                                <i className="fas fa-upload text-sm"></i>
                                <span>Upload</span>
                            </button>

                            {/* Reorder Button */}
                            {images.length > 0 && (
                                <button
                                    onClick={() => setReorderMode(!reorderMode)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${reorderMode
                                        ? 'bg-orange-600 text-white hover:bg-orange-700'
                                        : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                                        }`}
                                >
                                    <i className={`fas ${reorderMode ? 'fa-times' : 'fa-sort'} text-sm`}></i>
                                    <span>{reorderMode ? 'Cancel' : 'Reorder'}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4">
                {/* Desktop File Upload */}
                {selectedApartmentId && (
                    <div className='hidden sm:block mb-6'>
                        <FileUpload
                            apartmentId={selectedApartmentId}
                            existingImages={images}
                            onUploadComplete={handleUploadComplete}
                            maxFiles={20}
                        />
                    </div>
                )}

                {/* Mobile Upload Modal */}
                {showMobileUpload && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 sm:hidden">
                        <div className="bg-neutral-800 rounded-xl w-full max-w-md p-6 border border-neutral-700">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-white">Upload Images</h3>
                                <button
                                    onClick={() => setShowMobileUpload(false)}
                                    className="text-neutral-400 hover:text-white"
                                >
                                    <i className="fas fa-times text-lg"></i>
                                </button>
                            </div>
                            {selectedApartmentId && (
                                <FileUpload
                                    apartmentId={selectedApartmentId}
                                    existingImages={images}
                                    onUploadComplete={handleUploadComplete}
                                    maxFiles={20}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Save Reorder Button */}
                {reorderMode && images.length > 0 && (
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={handleReorderSave}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <i className="fas fa-save text-sm"></i>
                            <span>Save Order</span>
                        </button>
                    </div>
                )}

                {/* Gallery */}
                {images.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-neutral-600 rounded-xl bg-neutral-900">
                        <i className="fas fa-images text-6xl text-neutral-500 mb-4"></i>
                        <p className="text-neutral-400 text-lg">No images found for this apartment.</p>
                        <p className="text-neutral-500 text-sm mt-2">Upload some images to get started.</p>
                    </div>
                ) : (
                    <div className="overflow-y-auto pb-20">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {images.map((img, index) => (
                                <div
                                    key={img.id}
                                    className={`bg-neutral-900 rounded-lg overflow-hidden border transition-all duration-300 shadow-lg hover:shadow-xl ${img.is_primary ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-30' : 'border-neutral-700'
                                        } ${reorderMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
                                    draggable={reorderMode}
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, index)}
                                >
                                    {/* Card divided into two sections */}
                                    <div className="flex flex-col">
                                        {/* Section 1: Buttons with Icons */}
                                        <div className="p-3 bg-neutral-800 border-b border-neutral-700">
                                            <div className="flex justify-between items-center">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openEditModal(img)}
                                                        className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <i className="fas fa-edit text-xs"></i>
                                                        <span className="hidden sm:inline">Edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(img)}
                                                        className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <i className="fas fa-trash text-xs"></i>
                                                        <span className="hidden sm:inline">Delete</span>
                                                    </button>
                                                </div>

                                                {/* Primary Badge and Reorder Index */}
                                                <div className="flex items-center gap-2">
                                                    {img.is_primary && (
                                                        <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                                            <i className="fas fa-star text-xs"></i>
                                                            <span className="hidden sm:inline">Primary</span>
                                                        </div>
                                                    )}
                                                    {reorderMode && (
                                                        <div className="bg-neutral-700 text-white text-xs px-2 py-1 rounded-full">
                                                            {index + 1}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section 2: Image */}
                                        <div className="p-3">
                                            <div className="aspect-square overflow-hidden bg-neutral-800 rounded-lg">
                                                <img
                                                    src={img.image_url}
                                                    alt={img.image_name}
                                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                                />
                                            </div>

                                            {/* Image Info */}
                                            <div className="mt-3">
                                                <h4 className="text-white text-sm font-medium truncate">{img.image_name}</h4>

                                                {/* Metadata */}
                                                <div className="flex justify-between items-center mt-2 text-xs text-neutral-400">
                                                    <span className="flex items-center gap-1">
                                                        <i className="fas fa-weight-hanging text-xs"></i>
                                                        <span>{(img.file_size / 1024 / 1024).toFixed(1)} MB</span>
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <i className="fas fa-calendar text-xs"></i>
                                                        <span>{new Date(img.created_at).toLocaleDateString()}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editModalOpen && selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-neutral-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-neutral-700">
                        <div className="flex justify-between items-center p-6 border-b border-neutral-700">
                            <h3 className="text-lg font-semibold text-white">Edit Image</h3>
                            <button
                                onClick={closeEditModal}
                                className="text-neutral-400 hover:text-white"
                            >
                                <i className="fas fa-times text-lg"></i>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Image Section */}
                                <div className="space-y-4">
                                    <div className="aspect-square bg-neutral-900 rounded-lg overflow-hidden">
                                        <img
                                            src={selectedImage.image_url}
                                            alt={selectedImage.image_name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Image Actions */}
                                    <div className="flex flex-wrap gap-2">
                                        {!selectedImage.is_primary && (
                                            <button
                                                onClick={() => handleSetPrimary(selectedImage.id)}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex-1 min-w-[120px] justify-center"
                                            >
                                                <i className="fas fa-star text-sm"></i>
                                                <span>Set Primary</span>
                                            </button>
                                        )}

                                        <label className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex-1 min-w-[120px] justify-center cursor-pointer">
                                            <i className="fas fa-sync text-sm"></i>
                                            <span>Replace</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => e.target.files[0] && handleReplaceImage(selectedImage.id, e.target.files[0])}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Info Section */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                                            Image Name
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={selectedImage.image_name}
                                                onChange={(e) => setSelectedImage(prev => ({ ...prev, image_name: e.target.value }))}
                                                className="flex-1 px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <button
                                                onClick={() => handleUpdateFileName(selectedImage.id, selectedImage.image_name)}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                            >
                                                <i className="fas fa-save text-sm"></i>
                                                <span>Save</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Image Details */}
                                    <div className="space-y-3 p-4 bg-neutral-700 rounded-lg">
                                        <h4 className="font-medium text-white">Image Details</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-neutral-400">File Size:</span>
                                                <p className="text-white font-medium">
                                                    {(selectedImage.file_size / 1024 / 1024).toFixed(1)} MB
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-neutral-400">Uploaded:</span>
                                                <p className="text-white font-medium">
                                                    {new Date(selectedImage.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-neutral-400">Status:</span>
                                                <p className="text-white font-medium">
                                                    {selectedImage.is_primary ? (
                                                        <span className="flex items-center gap-1 text-blue-400">
                                                            <i className="fas fa-star text-xs"></i>
                                                            Primary Image
                                                        </span>
                                                    ) : 'Secondary'}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-neutral-400">Display Order:</span>
                                                <p className="text-white font-medium">
                                                    {selectedImage.display_order}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Danger Zone */}
                                    <div className="p-4 border border-red-500 rounded-lg bg-red-900 bg-opacity-20">
                                        <h4 className="font-medium text-red-400 mb-2">Danger Zone</h4>
                                        <p className="text-red-300 text-sm mb-3">
                                            Once you delete this image, it cannot be recovered.
                                        </p>
                                        <button
                                            onClick={() => openDeleteModal(selectedImage)}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                        >
                                            <i className="fas fa-trash text-sm"></i>
                                            <span>Delete Image</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-neutral-800 rounded-xl w-full max-w-md p-6 border border-neutral-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                                <i className="fas fa-exclamation text-white"></i>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Delete Image</h3>
                                <p className="text-neutral-400 text-sm">This action cannot be undone.</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-neutral-300">
                                Are you sure you want to delete <strong className="text-white">"{selectedImage.image_name}"</strong>?
                            </p>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeDeleteModal}
                                className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteImage(selectedImage.id)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                                <i className="fas fa-trash text-sm"></i>
                                <span>Delete Image</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default ApartmentGallery;