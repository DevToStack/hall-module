// admin/components/FileUpload.jsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUpload,
    faCheckCircle,
    faExclamationTriangle,
    faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';

const FileUpload = ({ apartmentId, onUploadComplete }) => {
    const [uploadingFiles, setUploadingFiles] = useState([]); // { file, preview, progress, status }
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Format file size to human readable format
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Calculate uploaded size based on progress
    const getUploadedSize = (file, progress) => {
        const totalSize = file.size;
        const uploadedSize = (progress / 100) * totalSize;
        return {
            uploaded: formatFileSize(uploadedSize),
            total: formatFileSize(totalSize)
        };
    };

    // ---------------- Upload Files ----------------
    const uploadFiles = async (files) => {
        setError('');
        setSuccess('');

        const newUploadFiles = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            progress: 0,
            status: 'uploading',
        }));

        setUploadingFiles((prev) => [...prev, ...newUploadFiles]);

        for (const file of files) {
            await new Promise((resolve) => {
                const formData = new FormData();
                formData.append('apartmentId', apartmentId);
                formData.append('uploadedBy', 1);
                formData.append('files', file);

                const xhr = new XMLHttpRequest();

                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const percent = (event.loaded / event.total) * 100;
                        setUploadingFiles((prev) =>
                            prev.map((f) =>
                                f.file === file ? { ...f, progress: percent } : f
                            )
                        );
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status === 200) {
                        const result = JSON.parse(xhr.responseText);
                        if (result.success) {
                            const uploaded = result.uploaded[0];
                            setUploadingFiles((prev) =>
                                prev.map((f) =>
                                    f.file === file
                                        ? { ...f, status: 'success', progress: 100 }
                                        : f
                                )
                            );
                            if (onUploadComplete) onUploadComplete([uploaded]);
                        } else {
                            setUploadingFiles((prev) =>
                                prev.map((f) =>
                                    f.file === file ? { ...f, status: 'error' } : f
                                )
                            );
                            setError('Upload failed for some files.');
                        }
                    } else {
                        setUploadingFiles((prev) =>
                            prev.map((f) =>
                                f.file === file ? { ...f, status: 'error' } : f
                            )
                        );
                        setError('Upload failed for some files.');
                    }
                    resolve();
                });

                xhr.addEventListener('error', () => {
                    setUploadingFiles((prev) =>
                        prev.map((f) =>
                            f.file === file ? { ...f, status: 'error' } : f
                        )
                    );
                    setError('Upload failed for some files.');
                    resolve();
                });

                xhr.open('POST', '/api/admin/gallery');
                xhr.send(formData);
            });
        }
    };

    // ---------------- Remove uploaded file from view ----------------
    const handleRemoveFile = (index) => {
        setUploadingFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // ---------------- Dropzone ----------------
    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length === 0) return;
        uploadFiles(acceptedFiles);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
    });

    // ---------------- UI ----------------
    return (
        <div className="space-y-6">
            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${isDragActive
                        ? 'border-neutral-400 bg-neutral-800'
                        : 'border-neutral-700 hover:border-neutral-500 bg-neutral-900'
                    }`}
            >
                <input {...getInputProps()} />
                <FontAwesomeIcon
                    icon={faUpload}
                    className="text-3xl text-neutral-400 mb-2"
                />
                <p className="text-neutral-300">
                    Drag & drop images here, or click to select
                </p>
            </div>

            {/* Alerts */}
            {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-2 rounded-lg flex items-center gap-2">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-2 rounded-lg">
                    {success}
                </div>
            )}

            {/* Upload Previews Only - No Gallery */}
            {uploadingFiles.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-neutral-200">
                        Uploading Images
                    </h3>
                    <div className="space-y-3 overflow-y-auto max-h-100 p-2">
                        {uploadingFiles.map((fileObj, index) => {
                            const sizeInfo = getUploadedSize(fileObj.file, fileObj.progress);

                            return (
                                <div
                                    key={index}
                                    className="bg-neutral-900 rounded-xl border border-neutral-800 p-4"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Small Image Preview */}
                                        <div className="relative w-16 h-16 bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0">
                                            <Image
                                                src={fileObj.preview}
                                                alt={fileObj.file.name}
                                                fill
                                                className="object-cover"
                                                onLoad={() => URL.revokeObjectURL(fileObj.preview)}
                                            />

                                            {/* Status Icon Overlay */}
                                            {fileObj.status !== 'uploading' && (
                                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                    <FontAwesomeIcon
                                                        icon={
                                                            fileObj.status === 'success'
                                                                ? faCheckCircle
                                                                : faTimesCircle
                                                        }
                                                        className={
                                                            fileObj.status === 'success'
                                                                ? 'text-green-400 text-lg'
                                                                : 'text-red-400 text-lg'
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* File Info and Progress */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-sm text-neutral-300 truncate">
                                                    {fileObj.file.name}
                                                </span>
                                                <span className="text-xs text-neutral-400 ml-2 flex-shrink-0">
                                                    {Math.round(fileObj.progress)}%
                                                </span>
                                            </div>

                                            {/* File Size Display */}
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs text-neutral-400">
                                                    {fileObj.status === 'uploading'
                                                        ? `${sizeInfo.uploaded} of ${sizeInfo.total}`
                                                        : sizeInfo.total
                                                    }
                                                </span>
                                            </div>

                                            {/* Full Width Progress Bar */}
                                            <div className="w-full bg-neutral-700 rounded-full h-2.5">
                                                <div
                                                    className={`h-2.5 rounded-full transition-all duration-300 ease-out ${fileObj.status === 'error'
                                                            ? 'bg-red-500'
                                                            : fileObj.status === 'success'
                                                                ? 'bg-green-500'
                                                                : 'bg-blue-500'
                                                        }`}
                                                    style={{
                                                        width: `${fileObj.progress}%`,
                                                        transition: 'width 0.3s ease-out'
                                                    }}
                                                />
                                            </div>

                                            {/* Status Text */}
                                            <div className="flex justify-between items-center mt-2">
                                                <span className={`text-xs ${fileObj.status === 'uploading'
                                                        ? 'text-blue-400'
                                                        : fileObj.status === 'success'
                                                            ? 'text-green-400'
                                                            : 'text-red-400'
                                                    }`}>
                                                    {fileObj.status === 'uploading' && 'Uploading...'}
                                                    {fileObj.status === 'success' && 'Upload completed'}
                                                    {fileObj.status === 'error' && 'Upload failed'}
                                                </span>

                                                {/* Remove Button */}
                                                {(fileObj.status === 'success' || fileObj.status === 'error') && (
                                                    <button
                                                        onClick={() => handleRemoveFile(index)}
                                                        className="text-neutral-400 hover:text-neutral-200 text-xs flex items-center gap-1"
                                                    >
                                                        <FontAwesomeIcon icon={faTimesCircle} className="text-xs" />
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUpload;