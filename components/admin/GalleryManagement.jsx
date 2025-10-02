// admin/components/ApartmentGallery.jsx
import React, { useState, useEffect } from 'react';
import FileUpload from './FileUpload';

const ApartmentGallery = ({ apartmentId }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadImages = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/gallery?apartmentId=${apartmentId}`);
                const data = await response.json();
                setImages(data.images || []);
            } catch (error) {
                console.error('Error loading images:', error);
            } finally {
                setLoading(false);
            }
        };

        if (apartmentId) {
            loadImages();
        }
    }, [apartmentId]);

    const handleUploadComplete = (newImages) => {
        setImages(prev => [...prev, ...newImages]);
    };

    if (loading) {
        return (
            <div className="h-screen text-white p-6 flex items-center justify-center"
                style={{ maxHeight: 'calc(100vh - 96px)' }}
                >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Apartment Gallery</h2>
                <p className="text-gray-600 mt-2">
                    Manage your apartment images. Drag to reorder, set primary images, and upload new photos.
                </p>
            </div>

            <FileUpload
                apartmentId={apartmentId}
                existingImages={images}
                onUploadComplete={handleUploadComplete}
                maxFiles={20}
            />
        </div>
    );
};

export default ApartmentGallery;