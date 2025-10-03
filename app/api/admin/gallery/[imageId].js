// pages/api/admin/gallery/[imageId].js
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { imageId } = req.query;

    try {
        const galleryPath = path.join(process.cwd(), 'public', 'uploads', 'gallery');

        // Find the file (you might need to adjust this logic based on your naming convention)
        const files = fs.readdirSync(galleryPath);
        const fileToDelete = files.find(file => file.startsWith(imageId) || file.replace(/\.[^/.]+$/, "") === imageId);

        if (!fileToDelete) {
            return res.status(404).json({ message: 'Image not found' });
        }

        const filePath = path.join(galleryPath, fileToDelete);

        // Delete the file
        fs.unlinkSync(filePath);

        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ message: 'Error deleting image' });
    }
}