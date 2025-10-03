// admin/components/FileUpload.jsx
import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUpload,
    faTrash,
    faStar,
    faArrowLeft,
    faArrowRight,
    faExclamationTriangle,
    faCheckCircle,
    faSpinner,
    faImage,
    faTimes
} from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';

const FileUpload = ({
    apartmentId,
    onUploadComplete,
    existingImages = [],
    maxFiles = 10,
    maxSize = 10 * 1024 * 1024 // 10MB
}) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadedImages, setUploadedImages] = useState(existingImages);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef();

    const uploadFiles = async (files) => {
        setUploading(true);
        setProgress(0);
        setError('');
        setSuccess('');

        try {
            const formData = new FormData();
            formData.append('apartmentId', apartmentId);
            formData.append('uploadedBy', 1); // Replace with actual user from auth

            files.forEach(file => {
                formData.append('files', file);
            });

            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    setProgress(percentComplete);
                }
            });

            const uploadPromise = new Promise((resolve, reject) => {
                xhr.addEventListener('load', () => {
                    if (xhr.status === 200) {
                        resolve(JSON.parse(xhr.responseText));
                    } else {
                        try {
                            const errorResponse = JSON.parse(xhr.responseText);
                            reject(new Error(errorResponse.error || 'Upload failed'));
                        } catch {
                            reject(new Error('Upload failed'));
                        }
                    }
                });

                xhr.addEventListener('error', () => reject(new Error('Network error')));
                xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));
            });

            xhr.open('POST', '/api/admin/gallery');
            xhr.send(formData);

            const result = await uploadPromise;

            if (result.success) {
                const newImages = result.uploaded.map(img => ({
                    ...img,
                    is_primary: uploadedImages.length === 0 // Set first image as primary if no images exist
                }));

                const updatedImages = [...uploadedImages, ...newImages];
                setUploadedImages(updatedImages);
                onUploadComplete?.(newImages);

                setSuccess(`Successfully uploaded ${newImages.length} image(s)`);

                // If this is the first image, set it as primary
                if (uploadedImages.length === 0 && newImages.length > 0) {
                    await setPrimaryImage(newImages[0].id);
                }

                // Handle individual file errors
                if (result.errors && result.errors.length > 0) {
                    const errorFiles = result.errors.map(e => e.fileName).join(', ');
                    setError(`Some files failed to upload: ${errorFiles}`);
                }
            } else {
                throw new Error(result.error || 'Upload failed');
            }

        } catch (err) {
            console.error('Upload error:', err);
            setError(err.message || 'Failed to upload files. Please try again.');
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
        setError('');
        setSuccess('');

        if (rejectedFiles.length > 0) {
            const rejection = rejectedFiles[0];
            if (rejection.errors[0].code === 'file-too-large') {
                setError(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
            } else if (rejection.errors[0].code === 'file-invalid-type') {
                setError('Invalid file type. Only images are allowed.');
            } else if (rejection.errors[0].code === 'too-many-files') {
                setError(`Too many files. Maximum ${maxFiles} images allowed.`);
            } else {
                setError('Error uploading files');
            }
            return;
        }

        if (acceptedFiles.length === 0) return;

        // Check total files limit
        const totalFiles = uploadedImages.length + acceptedFiles.length;
        if (totalFiles > maxFiles) {
            setError(`Maximum ${maxFiles} images allowed. You have ${uploadedImages.length} existing images.`);
            return;
        }

        await uploadFiles(acceptedFiles);
    }, [uploadedImages.length, maxFiles, maxSize, apartmentId]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
        },
        maxSize,
        maxFiles: maxFiles - uploadedImages.length,
        multiple: true
    });

    const deleteImage = async (imageId, imageUrl) => {
        if (!confirm('Are you sure you want to delete this image?')) return;

        try {
            const response = await fetch(`/api/admin/gallery/${imageId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setUploadedImages(prev => prev.filter(img => img.id !== imageId));
                setSuccess('Image deleted successfully');

                // If we deleted the primary image and there are other images, set a new primary
                const deletedImage = uploadedImages.find(img => img.id === imageId);
                if (deletedImage?.is_primary && uploadedImages.length > 1) {
                    const remainingImages = uploadedImages.filter(img => img.id !== imageId);
                    if (remainingImages.length > 0) {
                        await setPrimaryImage(remainingImages[0].id);
                    }
                }
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Delete failed');
            }
        } catch (err) {
            console.error('Delete error:', err);
            setError(err.message || 'Failed to delete image');
        }
    };

    const setPrimaryImage = async (imageId) => {
        try {
            const response = await fetch(`/api/admin/gallery/${imageId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ is_primary: true })
            });

            if (response.ok) {
                setUploadedImages(prev =>
                    prev.map(img => ({
                        ...img,
                        is_primary: img.id === imageId
                    }))
                );
                setSuccess('Primary image updated');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to set primary image');
            }
        } catch (err) {
            console.error('Set primary error:', err);
            setError(err.message || 'Failed to set primary image');
        }
    };

    const updateDisplayOrder = async (imageId, newOrder) => {
        try {
            const response = await fetch(`/api/admin/gallery/${imageId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ display_order: newOrder })
            });

            if (response.ok) {
                setUploadedImages(prev =>
                    prev.map(img =>
                        img.id === imageId ? { ...img, display_order: newOrder } : img
                    )
                );
            } else {
                console.error('Failed to update display order');
            }
        } catch (err) {
            console.error('Update order error:', err);
        }
    };

    const moveImage = (index, direction) => {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= uploadedImages.length) return;

        const updatedImages = [...uploadedImages];
        const [movedImage] = updatedImages.splice(index, 1);
        updatedImages.splice(newIndex, 0, movedImage);

        // Update display orders locally first for immediate UI update
        const imagesWithNewOrder = updatedImages.map((img, idx) => ({
            ...img,
            display_order: idx + 1
        }));

        setUploadedImages(imagesWithNewOrder);

        // Update display orders in database
        imagesWithNewOrder.forEach((img, idx) => {
            updateDisplayOrder(img.id, idx + 1);
        });
    };

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Update uploadedImages when existingImages prop changes
    React.useEffect(() => {
        setUploadedImages(existingImages);
    }, [existingImages]);

    return (
        <div className="w-full space-y-6">
            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`
                    relative border border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
                    ${isDragActive
                        ? 'border-neutral-400 bg-neutral-800'
                        : 'border-neutral-700 bg-neutral-900 hover:border-neutral-600 hover:bg-neutral-800'
                    }
                    ${uploading ? 'opacity-70 cursor-not-allowed' : ''}
                `}
            >
                <input {...getInputProps()} ref={fileInputRef} />

                {uploading ? (
                    <div className="space-y-4">
                        <div className="w-full bg-neutral-700 rounded-full h-2">
                            <div
                                className="bg-neutral-200 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-neutral-300">
                            <FontAwesomeIcon icon={faSpinner} className="fa-spin" />
                            <span>Uploading... {Math.round(progress)}%</span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <FontAwesomeIcon
                            icon={isDragActive ? faImage : faUpload}
                            className={`h-12 w-12 mx-auto ${isDragActive ? 'text-neutral-200' : 'text-neutral-500'}`}
                        />
                        <div className="space-y-1">
                            <p className="text-lg font-medium text-neutral-200">
                                {isDragActive ? 'Drop files here...' : 'Drag & drop images here'}
                            </p>
                            <p className="text-sm text-neutral-400">
                                or <span className="text-neutral-200 font-medium">click to browse</span>
                            </p>
                        </div>
                        <p className="text-xs text-neutral-500">
                            Supports JPG, PNG, WEBP, GIF • Max {maxSize / 1024 / 1024}MB per file
                            <br />
                            {maxFiles - uploadedImages.length} of {maxFiles} slots remaining
                        </p>
                    </div>
                )}
            </div>

            {/* Status Messages */}
            {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <span>{error}</span>
                    <button
                        onClick={() => setError('')}
                        className="ml-auto hover:text-red-300 transition-colors"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
            )}

            {success && (
                <div className="flex items-center space-x-2 p-3 bg-green-900/20 border border-green-800 rounded-lg text-green-400">
                    <FontAwesomeIcon icon={faCheckCircle} />
                    <span>{success}</span>
                    <button
                        onClick={() => setSuccess('')}
                        className="ml-auto hover:text-green-300 transition-colors"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
            )}

            {/* Gallery */}
            {uploadedImages.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-neutral-200">Gallery Images</h3>
                        <span className="text-sm text-neutral-400 bg-neutral-800 px-3 py-1 rounded-full">
                            {uploadedImages.length} / {maxFiles}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {uploadedImages.map((image, index) => (
                            <div
                                key={image.id}
                                className="group relative bg-neutral-900 rounded-xl border border-neutral-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                            >
                                {/* Image */}
                                <div className="relative aspect-[4/3] bg-neutral-800">
                                    <Image
                                        src={image.image_url}
                                        alt={image.image_name || 'Apartment image'}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                    />

                                    {/* Primary Badge */}
                                    {image.is_primary && (
                                        <div className="absolute top-2 left-2 bg-neutral-200 text-neutral-900 text-xs font-medium px-2 py-1 rounded-full flex items-center space-x-1">
                                            <FontAwesomeIcon icon={faStar} className="w-3 h-3" />
                                            <span>Primary</span>
                                        </div>
                                    )}

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteImage(image.id, image.image_url);
                                            }}
                                            className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition"
                                        >
                                            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                                        </button>
                                        {!image.is_primary && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setPrimaryImage(image.id);
                                                }}
                                                className="bg-neutral-200 text-neutral-900 p-2 rounded-full hover:bg-neutral-300 transition"
                                            >
                                                <FontAwesomeIcon icon={faStarRegular} className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Image Info */}
                                <div className="p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-neutral-300 truncate flex-1 mr-2">
                                            {image.image_name || `Image ${index + 1}`}
                                        </span>
                                        <span className="text-xs text-neutral-500 whitespace-nowrap">
                                            {formatFileSize(image.file_size)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between space-x-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                moveImage(index, -1);
                                            }}
                                            disabled={index === 0}
                                            className="flex-1 p-1 text-neutral-500 hover:text-neutral-200 disabled:text-neutral-700 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
                                        </button>
                                        <span className="text-xs text-neutral-500 min-w-6 text-center">
                                            {index + 1}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                moveImage(index, 1);
                                            }}
                                            disabled={index === uploadedImages.length - 1}
                                            className="flex-1 p-1 text-neutral-500 hover:text-neutral-200 disabled:text-neutral-700 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {uploadedImages.length === 0 && !uploading && (
                <div className="text-center py-12">
                    <FontAwesomeIcon icon={faImage} className="h-16 w-16 text-neutral-700 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-neutral-200 mb-2">No images yet</h3>
                    <p className="text-neutral-500 max-w-sm mx-auto">
                        Upload some images to showcase your apartment. The first image will be set as primary.
                    </p>
                </div>
            )}
        </div>
    );
};

export default FileUpload;