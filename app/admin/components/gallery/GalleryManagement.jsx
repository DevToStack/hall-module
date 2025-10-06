// admin/components/ApartmentGallery.jsx
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import FileUpload from './FileUpload';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUpload, faSort, faTimes, faSave, faEdit, faTrash, faStar, faImages, faWeightHanging, faCalendar, faSync, faExclamation, faSearch, faFilter, faTh, faThList, faExpand
} from "@fortawesome/free-solid-svg-icons";

import ImagePreviewer from './ImageViewver';

const ApartmentGallery = () => {
    const [apartments, setApartments] = useState([]);
    const [selectedApartmentId, setSelectedApartmentId] = useState('');
    const [images, setImages] = useState([]);
    const [filteredImages, setFilteredImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [reorderMode, setReorderMode] = useState(false);
    const [showMobileUpload, setShowMobileUpload] = useState(false);
    const [loadingImage, setLoadingImage] = useState(true);

    // New state for enhanced features
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilters, setSelectedFilters] = useState({
        primary: 'all',
        status: 'all',
        size: 'all'
    });
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [sortConfig, setSortConfig] = useState({ key: 'display_order', direction: 'asc' });
    const [selectedImages, setSelectedImages] = useState(new Set());
    const [bulkActionsOpen, setBulkActionsOpen] = useState(false);
    const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        primary: 0,
        totalSize: 0
    });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showMobileFilters, setShowMobileFilters] = useState(0);

    const openPreview = (index) => {
        setSelectedIndex(index);
        setImagePreviewOpen(true);
    };

    const closePreview = () => setImagePreviewOpen(false);
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
            if (!selectedApartmentId) {
                setImages([]);
                setFilteredImages([]);
                return;
            }
            try {
                setLoading(true);
                const res = await fetch(`/api/admin/gallery?apartmentId=${selectedApartmentId}`);
                const data = await res.json();
                console.log(data);
                const imagesData = data.images || [];
                setImages(imagesData);
                setFilteredImages(imagesData);
                updateStats(imagesData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadImages();
    }, [selectedApartmentId]);

    // Update stats
    const updateStats = (images) => {
        const total = images.length;
        const primary = images.filter(img => img.is_primary).length;
        const totalSize = images.reduce((sum, img) => sum + img.file_size, 0);
        setStats({ total, primary, totalSize });
    };

    // Filter and search images
    useEffect(() => {
        let result = images;

        // Search filter
        if (searchTerm) {
            result = result.filter(img =>
                img.image_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filters
        if (selectedFilters.primary !== 'all') {
            result = result.filter(img =>
                selectedFilters.primary === 'primary' ? img.is_primary : !img.is_primary
            );
        }

        // Size filters (example)
        if (selectedFilters.size !== 'all') {
            result = result.filter(img => {
                const sizeMB = img.file_size / 1024 / 1024;
                switch (selectedFilters.size) {
                    case 'small': return sizeMB < 1;
                    case 'medium': return sizeMB >= 1 && sizeMB < 5;
                    case 'large': return sizeMB >= 5;
                    default: return true;
                }
            });
        }

        setFilteredImages(result);
    }, [images, searchTerm, selectedFilters]);

    // Sort images
    const sortedImages = useMemo(() => {
        const sortableItems = [...filteredImages];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (sortConfig.key === 'image_name') {
                    aValue = aValue?.toLowerCase() || '';
                    bValue = bValue?.toLowerCase() || '';
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredImages, sortConfig]);

    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Selection handlers
    const toggleImageSelection = (imageId) => {
        setSelectedImages(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(imageId)) {
                newSelection.delete(imageId);
            } else {
                newSelection.add(imageId);
            }
            return newSelection;
        });
    };

    const selectAllImages = () => {
        if (selectedImages.size === sortedImages.length) {
            setSelectedImages(new Set());
        } else {
            setSelectedImages(new Set(sortedImages.map(img => img.id)));
        }
    };

    // Bulk actions
    const handleBulkDelete = async () => {
        if (!selectedImages.size) return;

        try {
            await Promise.all(
                Array.from(selectedImages).map(id =>
                    fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' })
                )
            );
            setImages(prev => prev.filter(img => !selectedImages.has(img.id)));
            setSelectedImages(new Set());
            setBulkActionsOpen(false);
        } catch (err) {
            console.error('Bulk delete failed:', err);
        }
    };

    const handleBulkPrimary = async () => {
        if (!selectedImages.size) return;

        try {
            // Set the first selected image as primary
            const firstId = Array.from(selectedImages)[0];
            await handleSetPrimary(firstId);
            setSelectedImages(new Set());
            setBulkActionsOpen(false);
        } catch (err) {
            console.error('Bulk primary set failed:', err);
        }
    };

    // Existing handlers (updated for new functionality)
    const handleUploadComplete = (newImages) => {
        setImages(prev => [...prev, ...newImages]);
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
                setSelectedImages(prev => {
                    const newSelection = new Set(prev);
                    newSelection.delete(id);
                    return newSelection;
                });
                if (selectedImage?.id === id) {
                    setEditModalOpen(false);
                    setSelectedImage(null);
                }
                closeDeleteModal();
            }
        } catch (err) {
            console.error(err);
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

            const res = await fetch(`/api/admin/gallery/${id}/replace`, {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const updated = await res.json();
                const updatedImage = updated.image || updated;
                const timestamp = new Date().getTime();
                const updatedImageWithCacheBust = {
                    ...updatedImage,
                    image_url: `${updatedImage.image_url}?t=${timestamp}`
                };

                setImages(prev => prev.map(img =>
                    img.id === id ? { ...img, ...updatedImageWithCacheBust } : img
                ));

                if (selectedImage?.id === id) {
                    setSelectedImage(updatedImageWithCacheBust);
                }
            }
        } catch (err) {
            console.error('Error replacing image:', err);
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

    const openImagePreview = (img) => {
        setPreviewImage(img);
        setImagePreviewOpen(true);
    };

    const closeImagePreview = () => {
        setImagePreviewOpen(false);
        setPreviewImage(null);
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
            {/* Fixed Header */}
            <div className="sticky top-0 z-20 bg-neutral-900 border-b border-neutral-700 p-4 shadow-lg">
                <div className="flex justify-between items-center w-full  max-w-7xl mx-auto gap-2">
                    {/* Apartment Select (compact) */}
                    <select
                        id="apartment"
                        value={selectedApartmentId}
                        onChange={(e) => setSelectedApartmentId(e.target.value)}
                        className="flex-1 px-2 py-1 bg-neutral-800 border border-neutral-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Apartment...</option>
                        {apartments.map(ap => (
                            <option key={ap.id} value={ap.id}>
                                {ap.name || `Apartment ${ap.id}`}
                            </option>
                        ))}
                    </select>

                    {/* Upload Button */}
                    <button
                        onClick={() => setShowMobileUpload(true)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-1"
                    >
                        <FontAwesomeIcon icon={faUpload} className="text-xs" />
                        <span>Upload</span>
                    </button>

                    {/* Filters Toggle */}
                    <button
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                        className="px-3 py-1 bg-neutral-700 text-white rounded-lg text-sm"
                    >
                        <FontAwesomeIcon icon={faFilter} />
                    </button>
                </div>

                {/* Mobile Filters (expand/collapse) */}
                {showMobileFilters && (
                    <div className="mt-2 flex flex-col gap-2">
                        {/* Search */}
                        <div className="relative">
                            <FontAwesomeIcon
                                icon={faSearch}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Search images..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-1 bg-neutral-800 border border-neutral-600 rounded-lg text-white text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Filter Dropdowns */}
                        <div className="flex gap-2">
                            <select
                                value={selectedFilters.primary}
                                onChange={(e) => setSelectedFilters(prev => ({ ...prev, primary: e.target.value }))}
                                className="flex-1 px-2 py-1 bg-neutral-800 border border-neutral-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Types</option>
                                <option value="primary">Primary Only</option>
                                <option value="secondary">Secondary Only</option>
                            </select>

                            <select
                                value={selectedFilters.size}
                                onChange={(e) => setSelectedFilters(prev => ({ ...prev, size: e.target.value }))}
                                className="flex-1 px-2 py-1 bg-neutral-800 border border-neutral-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Sizes</option>
                                <option value="small">Small (&lt;1MB)</option>
                                <option value="medium">Medium (1-5MB)</option>
                                <option value="large">Large (&gt;5MB)</option>
                            </select>
                        </div>

                        {/* View & Sort */}
                        <div className="flex items-center gap-2">
                            <div className="flex bg-neutral-800 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-neutral-400'}`}
                                >
                                    <FontAwesomeIcon icon={faTh} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-neutral-400'}`}
                                >
                                    <FontAwesomeIcon icon={faThList} />
                                </button>
                            </div>

                            <select
                                value={`${sortConfig.key}-${sortConfig.direction}`}
                                onChange={(e) => {
                                    const [key, direction] = e.target.value.split('-');
                                    setSortConfig({ key, direction });
                                }}
                                className="flex-1 px-2 py-1 bg-neutral-800 border border-neutral-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="display_order-asc">Order: Ascending</option>
                                <option value="display_order-desc">Order: Descending</option>
                                <option value="image_name-asc">Name: A-Z</option>
                                <option value="image_name-desc">Name: Z-A</option>
                                <option value="created_at-asc">Date: Oldest</option>
                                <option value="created_at-desc">Date: Newest</option>
                                <option value="file_size-asc">Size: Smallest</option>
                                <option value="file_size-desc">Size: Largest</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Stats Bar */}
            {images.length > 0 && (
                <div className="bg-neutral-700 border-b border-neutral-600">
                    <div className="max-w-7xl mx-auto px-4 py-2">
                        <div className="flex flex-wrap items-center justify-between text-sm text-neutral-300">
                            <div className="flex flex-wrap gap-6 max-sm:text-sm">
                                <span>Total: {stats.total} images</span>
                                <span>Primary: {stats.primary}</span>
                                <span>Total Size: {(stats.totalSize / 1024 / 1024).toFixed(1)} MB</span>
                                <span>Showing: {filteredImages.length}</span>
                            </div>

                            {selectedImages.size > 0 && (
                                <div className="flex items-center gap-3">
                                    <span className="text-blue-400">
                                        {selectedImages.size} selected
                                    </span>
                                    <button
                                        onClick={() => setBulkActionsOpen(true)}
                                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                    >
                                        Bulk Actions
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl max-h-[80vh] overflow-y-auto mx-auto p-4">

                {/* Mobile Upload Modal */}
                {showMobileUpload && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-neutral-800 rounded-xl w-full max-w-7xl h-full max-h-180 p-6 border border-neutral-700">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-white">Upload Images</h3>
                                <button
                                    onClick={() => setShowMobileUpload(false)}
                                    className="text-neutral-400 hover:text-white"
                                >
                                    <FontAwesomeIcon icon={faTimes} />
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
                            <FontAwesomeIcon icon={faSave} className="text-sm" />
                            <span>Save Order</span>
                        </button>
                    </div>
                )}

                {/* Gallery Content */}
                {sortedImages.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-neutral-600 rounded-xl bg-neutral-900">
                        <FontAwesomeIcon icon={faImages} className="text-6xl text-neutral-500 mb-4" />
                        <p className="text-neutral-400 text-lg">No images found.</p>
                        <p className="text-neutral-500 text-sm mt-2">
                            {searchTerm || selectedFilters.primary !== 'all' || selectedFilters.size !== 'all'
                                ? 'Try changing your search or filters'
                                : 'Upload some images to get started.'}
                        </p>
                    </div>
                ) : (
                    <div
                        className={`${viewMode === "grid"
                                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                                : "space-y-4"
                            } p-2 pb-20`}
                    >

                        {sortedImages.map((img, index) => (
                            <div
                                key={img.id}
                                className={`bg-neutral-900 rounded-lg overflow-hidden border transition-all duration-300 shadow-lg hover:shadow-xl ${img.is_primary ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-30' : 'border-neutral-700'
                                    } ${reorderMode ? 'cursor-grab active:cursor-grabbing' : ''} ${selectedImages.has(img.id) ? 'ring-2 ring-green-500 border-green-500' : ''
                                    }`}
                                draggable={reorderMode}
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, index)}
                            >
                                {/* Selection Checkbox */}
                                <div className="p-2 bg-neutral-800 border-b border-neutral-700 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedImages.has(img.id)}
                                            onChange={() => toggleImageSelection(img.id)}
                                            className="w-4 h-4 text-blue-600 bg-neutral-700 border-neutral-600 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-xs text-neutral-400">#{img.display_order}</span>
                                    </div>

                                    {img.is_primary && (
                                        <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                            <FontAwesomeIcon icon={faStar} className="text-xs" />
                                            <span className="hidden sm:inline">Primary</span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-3">
                                    {/* Image with Preview */}
                                    <div
                                        className="aspect-square overflow-hidden bg-neutral-800 rounded-lg cursor-pointer relative group"
                                        onClick={() => openImagePreview(img)}
                                    >
                                        <img
                                            src={img.image_url}
                                            alt={img.image_name}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                                            <FontAwesomeIcon
                                                icon={faExpand}
                                                className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                            />
                                        </div>
                                    </div>

                                    {/* Image Info */}
                                    <div className="mt-3">
                                        <h4 className="text-white text-sm font-medium truncate" title={img.image_name}>
                                            {img.image_name}
                                        </h4>

                                        {/* Metadata */}
                                        <div className="flex justify-between items-center mt-2 text-xs text-neutral-400">
                                            <span className="flex items-center gap-1">
                                                <FontAwesomeIcon icon={faWeightHanging} className="text-xs" />
                                                <span>{(img.file_size / 1024 / 1024).toFixed(1)} MB</span>
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FontAwesomeIcon icon={faCalendar} className="text-xs" />
                                                <span>{new Date(img.created_at).toLocaleDateString()}</span>
                                            </span>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-neutral-700">
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openEditModal(img); }}
                                                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} className="text-xs" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openDeleteModal(img); }}
                                                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                                </button>
                                            </div>

                                            {!img.is_primary && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleSetPrimary(img.id); }}
                                                    className="p-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors text-xs"
                                                >
                                                    Set Primary
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bulk Actions Menu Trigger */}
            {selectedImages.size > 0 && (
                <div className="relative inline-block text-left">
                    <button
                        onClick={() => setBulkActionsOpen(!bulkActionsOpen)}
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded transition-colors"
                    >
                        <FontAwesomeIcon icon={faSort} />
                        Bulk Actions ({selectedImages.size})
                    </button>

                    {/* Dropdown Menu */}
                    {bulkActionsOpen && (
                        <div className="absolute right-0 mt-2 w-56 origin-top-right bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg z-50">
                            <div className="py-2">
                                <button
                                    onClick={() => {
                                        handleBulkPrimary();
                                        setBulkActionsOpen(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-neutral-700"
                                >
                                    <FontAwesomeIcon icon={faStar} />
                                    <span>Set First as Primary</span>
                                </button>
                                <button
                                    onClick={() => {
                                        handleBulkDelete();
                                        setBulkActionsOpen(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-600 hover:text-white"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                    <span>Delete Selected</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}


            {imagePreviewOpen && previewImage && (
                <div>
                    <div className="grid grid-cols-2 gap-4">
                        {images.map((img, i) => (
                            <img
                                key={i}
                                src={img.image_url}
                                alt={img.image_name}
                                className="w-full h-48 object-cover rounded cursor-pointer hover:opacity-80"
                                onClick={() => openPreview(i)}
                            />
                        ))}
                    </div>
            
                    <ImagePreviewer
                        images={images}
                        initialIndex={selectedIndex}
                        imagePreviewOpen={imagePreviewOpen}
                        closeImagePreview={closePreview}
                    />
            </div>
            )}


            {/* Edit Modal */}
            {editModalOpen && selectedImage && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-neutral-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-neutral-700">
                        <div className="flex justify-between items-center p-6 border-b border-neutral-700">
                            <h3 className="text-lg font-semibold text-white">Edit Image</h3>
                            <button
                                onClick={closeEditModal}
                                className="text-neutral-400 hover:text-white"
                            >
                                <FontAwesomeIcon icon={faTimes} className="text-sm" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Image Section */}
                                <div className="space-y-4">
                                    <div className="aspect-square bg-neutral-900 rounded-lg overflow-hidden relative">
                                        {/* Skeleton Shimmer */}
                                        {loadingImage && (
                                            <div className="h-full text-white flex items-center justify-center"
                                            >
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                                            </div>
                                        )}

                                        <img
                                            src={`${selectedImage.image_url}?t=${new Date(selectedImage.updated_at || selectedImage.created_at).getTime()}`}
                                            alt={selectedImage.image_name}
                                            className={`w-full h-full object-cover transition-opacity duration-300 ${loadingImage ? 'opacity-0' : 'opacity-100'}`}
                                            key={selectedImage.id}
                                            onLoad={() => setLoadingImage(false)}
                                            onError={(e) => {
                                                e.target.src = '/api/placeholder/400/400';
                                                setLoadingImage(false);
                                            }}
                                        />
                                    </div>

                                    {/* Image Actions */}
                                    <div className="flex flex-wrap gap-2">
                                        {!selectedImage.is_primary && (
                                            <button
                                                onClick={() => handleSetPrimary(selectedImage.id)}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex-1 min-w-[120px] justify-center"
                                            >
                                                <FontAwesomeIcon icon={faStar} className="text-xs" />
                                                <span>Set Primary</span>
                                            </button>
                                        )}

                                        <label className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex-1 min-w-[120px] justify-center cursor-pointer">
                                            <FontAwesomeIcon icon={faSync} className="text-sm" />
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
                                                <FontAwesomeIcon icon={faSave} className="text-sm" />
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
                                                            <FontAwesomeIcon icon={faStar} className="text-xs" />
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
                                            <FontAwesomeIcon icon={faTrash} className="text-xs" />
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
                <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
                    <div className="bg-neutral-800 rounded-xl w-full max-w-md p-6 border border-neutral-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                                <FontAwesomeIcon icon={faExclamation} className="text-white" />
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
                                <FontAwesomeIcon icon={faTrash} className="text-xs" />
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
