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

    const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
        setError('');
        setSuccess('');

        if (rejectedFiles.length > 0) {
            const rejection = rejectedFiles[0];
            if (rejection.errors[0].code === 'file-too-large') {
                setError(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
            } else if (rejection.errors[0].code === 'file-invalid-type') {
                setError('Invalid file type. Only images are allowed.');
            } else {
                setError('Error uploading files');
            }
            return;
        }

        if (acceptedFiles.length === 0) return;

        // Check total files limit
        const totalFiles = uploadedImages.length + acceptedFiles.length;
        if (totalFiles > maxFiles) {
            setError(`Maximum ${maxFiles} images allowed`);
            return;
        }

        await uploadFiles(acceptedFiles);
    }, [uploadedImages.length, maxFiles, maxSize]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
        },
        maxSize,
        multiple: true
    });

    const uploadFiles = async (files) => {
        setUploading(true);
        setProgress(0);

        try {
            const formData = new FormData();
            formData.append('apartmentId', apartmentId);
            formData.append('uploadedBy', '1'); // Replace with actual user ID from auth

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
                        reject(new Error('Upload failed'));
                    }
                });

                xhr.addEventListener('error', () => reject(new Error('Upload failed')));
            });

            xhr.open('POST', '/api/gallery');
            xhr.send(formData);

            const result = await uploadPromise;

            if (result.success) {
                const newImages = result.uploaded.map(img => ({
                    ...img,
                    is_primary: uploadedImages.length === 0 // Set first image as primary if no images exist
                }));

                setUploadedImages(prev => [...prev, ...newImages]);
                onUploadComplete?.(newImages);
                setSuccess(`Successfully uploaded ${newImages.length} image(s)`);

                // If this is the first image, set it as primary
                if (uploadedImages.length === 0 && newImages.length > 0) {
                    await setPrimaryImage(newImages[0].id);
                }
            }

            if (result.errors) {
                setError(`Some files failed to upload: ${result.errors.map(e => e.fileName).join(', ')}`);
            }

        } catch (err) {
            console.error('Upload error:', err);
            setError('Failed to upload files. Please try again.');
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    const deleteImage = async (imageId, imageUrl) => {
        if (!confirm('Are you sure you want to delete this image?')) return;

        try {
            const response = await fetch(`/api/gallery/${imageId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setUploadedImages(prev => prev.filter(img => img.id !== imageId));
                setSuccess('Image deleted successfully');
            } else {
                throw new Error('Delete failed');
            }
        } catch (err) {
            console.error('Delete error:', err);
            setError('Failed to delete image');
        }
    };

    const setPrimaryImage = async (imageId) => {
        try {
            const response = await fetch(`/api/gallery/${imageId}`, {
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
            }
        } catch (err) {
            console.error('Set primary error:', err);
            setError('Failed to set primary image');
        }
    };

    const updateDisplayOrder = async (imageId, newOrder) => {
        try {
            await fetch(`/api/gallery/${imageId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ display_order: newOrder })
            });

            setUploadedImages(prev =>
                prev.map(img =>
                    img.id === imageId ? { ...img, display_order: newOrder } : img
                )
            );
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

        // Update display orders
        updatedImages.forEach((img, idx) => {
            img.display_order = idx;
            updateDisplayOrder(img.id, idx);
        });

        setUploadedImages(updatedImages);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="w-full space-y-6">
            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300
          ${isDragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                    }
          ${uploading ? 'opacity-70 cursor-not-allowed' : ''}
        `}
            >
                <input {...getInputProps()} ref={fileInputRef} />

                {uploading ? (
                    <div className="space-y-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-blue-600">
                            <FontAwesomeIcon icon={faSpinner} className="fa-spin" />
                            <span>Uploading... {Math.round(progress)}%</span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <FontAwesomeIcon
                            icon={isDragActive ? faImage : faUpload}
                            className={`h-12 w-12 mx-auto ${isDragActive ? 'text-blue-500' : 'text-gray-400'
                                }`}
                        />
                        <div className="space-y-1">
                            <p className="text-lg font-medium text-gray-900">
                                {isDragActive ? 'Drop files here...' : 'Drag & drop images here'}
                            </p>
                            <p className="text-sm text-gray-500">
                                or <span className="text-blue-600 font-medium">click to browse</span>
                            </p>
                        </div>
                        <p className="text-xs text-gray-400">
                            Supports JPG, PNG, WEBP, GIF • Max {maxSize / 1024 / 1024}MB per file
                            <br />
                            {maxFiles - uploadedImages.length} of {maxFiles} slots remaining
                        </p>
                    </div>
                )}
            </div>

            {/* Status Messages */}
            {error && (
                <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500" />
                    <span className="text-red-700">{error}</span>
                    <button
                        onClick={() => setError('')}
                        className="ml-auto text-red-500 hover:text-red-700"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
            )}

            {success && (
                <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                    <span className="text-green-700">{success}</span>
                    <button
                        onClick={() => setSuccess('')}
                        className="ml-auto text-green-500 hover:text-green-700"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
            )}

            {/* Image Gallery */}
            {uploadedImages.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Gallery Images
                        </h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {uploadedImages.length} / {maxFiles}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {uploadedImages.map((image, index) => (
                            <div
                                key={image.id}
                                className="group relative bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                            >
                                {/* Image Container */}
                                <div className="relative aspect-[4/3] bg-gray-100">
                                    <Image
                                        src={image.image_url}
                                        alt={image.image_name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                                    />

                                    {/* Primary Badge */}
                                    {image.is_primary && (
                                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center space-x-1">
                                            <FontAwesomeIcon icon={faStar} className="w-3 h-3" />
                                            <span>Primary</span>
                                        </div>
                                    )}

                                    {/* Action Overlay */}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100">
                                        <button
                                            onClick={() => deleteImage(image.id, image.image_url)}
                                            className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors duration-200 transform scale-90 group-hover:scale-100"
                                            title="Delete image"
                                        >
                                            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={() => setPrimaryImage(image.id)}
                                            className={`p-2 rounded-full transition-colors duration-200 transform scale-90 group-hover:scale-100 ${image.is_primary
                                                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                                }`}
                                            title={image.is_primary ? 'Primary image' : 'Set as primary'}
                                        >
                                            <FontAwesomeIcon
                                                icon={image.is_primary ? faStar : faStarRegular}
                                                className="w-4 h-4"
                                            />
                                        </button>
                                    </div>
                                </div>

                                {/* Image Info & Controls */}
                                <div className="p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-gray-700 truncate flex-1 mr-2">
                                            {image.image_name}
                                        </span>
                                        <span className="text-xs text-gray-500 whitespace-nowrap">
                                            {formatFileSize(image.file_size)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between space-x-2">
                                        <button
                                            onClick={() => moveImage(index, -1)}
                                            disabled={index === 0}
                                            className="flex-1 flex items-center justify-center p-1 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                                            title="Move left"
                                        >
                                            <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
                                        </button>

                                        <span className="text-xs text-gray-500 font-medium px-2">
                                            {index + 1}
                                        </span>

                                        <button
                                            onClick={() => moveImage(index, 1)}
                                            disabled={index === uploadedImages.length - 1}
                                            className="flex-1 flex items-center justify-center p-1 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                                            title="Move right"
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
                    <FontAwesomeIcon icon={faImage} className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No images yet</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        Upload some images to showcase your apartment. The first image will be set as primary.
                    </p>
                </div>
            )}
        </div>
    );
};

export default FileUpload;