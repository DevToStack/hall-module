// /api/admin/gallery/[id]/route.js
import { query } from '@/lib/mysql-wrapper';
import { NextResponse } from 'next/server';
import { unlink, writeFile, mkdir } from 'fs/promises';
import path from 'path';

// DELETE - Remove an image
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        // Get image info before deletion
        const [image] = await query(
            'SELECT image_url FROM apartment_gallery WHERE id = ?',
            [id]
        );

        if (!image) {
            return NextResponse.json(
                { error: 'Image not found' },
                { status: 404 }
            );
        }

        // Delete from database
        await query('DELETE FROM apartment_gallery WHERE id = ?', [id]);

        // Delete physical file
        try {
            const filePath = path.join(process.cwd(), 'public', image.image_url);
            await unlink(filePath);
        } catch (fileError) {
            console.warn('Could not delete physical file:', fileError.message);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting image:', error);
        return NextResponse.json(
            { error: 'Failed to delete image' },
            { status: 500 }
        );
    }
}

// PATCH - Update image properties (order, primary status, file name)
export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const updates = await request.json();

        const allowedUpdates = ['display_order', 'is_primary', 'image_name'];
        const updateFields = [];
        const updateValues = [];

        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updateFields.push(`${key} = ?`);
                updateValues.push(updates[key]);
            }
        });

        if (updateFields.length === 0) {
            return NextResponse.json(
                { error: 'No valid fields to update' },
                { status: 400 }
            );
        }

        // If setting as primary, unset other primaries for this apartment
        if (updates.is_primary) {
            const [image] = await query(
                'SELECT apartment_id FROM apartment_gallery WHERE id = ?',
                [id]
            );

            if (image) {
                await query(
                    'UPDATE apartment_gallery SET is_primary = FALSE WHERE apartment_id = ? AND id != ?',
                    [image.apartment_id, id]
                );
            }
        }

        updateValues.push(id);
        await query(
            `UPDATE apartment_gallery SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );

        // Return updated image data
        const [updatedImage] = await query(
            'SELECT * FROM apartment_gallery WHERE id = ?',
            [id]
        );

        return NextResponse.json({ success: true, image: updatedImage });

    } catch (error) {
        console.error('Error updating image:', error);
        return NextResponse.json(
            { error: 'Failed to update image' },
            { status: 500 }
        );
    }
}

// POST - Replace image file while keeping the same record
export async function POST(request, { params }) {
    try {
        const { id } = await params;

        // Check if image exists
        const [existingImage] = await query(
            'SELECT * FROM apartment_gallery WHERE id = ?',
            [id]
        );

        if (!existingImage) {
            return NextResponse.json(
                { error: 'Image not found' },
                { status: 404 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file');
        const apartmentId = formData.get('apartmentId');

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'File must be an image' },
                { status: 400 }
            );
        }

        // Generate new filename while keeping the original naming structure
        const fileExtension = path.extname(file.name);
        const originalName = path.parse(existingImage.image_url).name;
        const fileName = `${originalName}${fileExtension}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'apartments', apartmentId);

        // Create directory if it doesn't exist
        await mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, fileName);
        const publicUrl = `/uploads/apartments/${apartmentId}/${fileName}`;

        // Convert file to buffer and write to disk
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Delete old physical file if it exists and is different from new one
        try {
            const oldFilePath = path.join(process.cwd(), 'public', existingImage.image_url);
            if (oldFilePath !== filePath) {
                await unlink(oldFilePath);
            }
        } catch (fileError) {
            console.warn('Could not delete old physical file:', fileError.message);
        }

        // Update database with new file info
        const fileStats = buffer;
        const fileSize = buffer.length;

        await query(
            `UPDATE apartment_gallery 
             SET image_url = ?, file_size = ?, mime_type = ?, updated_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [publicUrl, fileSize, file.type, id]
        );

        // Get updated image data
        const [updatedImage] = await query(
            'SELECT * FROM apartment_gallery WHERE id = ?',
            [id]
        );

        return NextResponse.json({
            success: true,
            image: updatedImage
        });

    } catch (error) {
        console.error('Error replacing image:', error);
        return NextResponse.json(
            { error: 'Failed to replace image' },
            { status: 500 }
        );
    }
}

// GET - Get single image details (optional, for completeness)
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const [image] = await query(
            'SELECT * FROM apartment_gallery WHERE id = ?',
            [id]
        );

        if (!image) {
            return NextResponse.json(
                { error: 'Image not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ image });

    } catch (error) {
        console.error('Error fetching image:', error);
        return NextResponse.json(
            { error: 'Failed to fetch image' },
            { status: 500 }
        );
    }
}