// app/api/apartments/route.js
import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Cache for apartment data (5 minutes)
const apartmentCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET() {
    try {
        const cacheKey = 'apartments_list';
        const cached = apartmentCache.get(cacheKey);
        
        // Return cached data if still valid
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return NextResponse.json(cached.data, { 
                status: 200,
                headers: {
                    'Cache-Control': 'public, max-age=300, s-maxage=300', // 5 minutes
                    'X-Cache': 'HIT'
                }
            });
        }

        const conn = await pool.getConnection();

        // Optimized single query with JOINs instead of multiple queries
        const [apartments] = await conn.query(`
            SELECT 
                a.id,
                a.title,
                a.location,
                a.price_per_night AS price,
                COALESCE(r.rating, 0) AS rating,
                COALESCE(r.totalReviews, 0) AS totalReviews,
                GROUP_CONCAT(af.icon) AS features,
                ag.image_url AS primary_image
            FROM apartments a
            LEFT JOIN (
                SELECT 
                    apartment_id, 
                    ROUND(AVG(rating), 1) AS rating, 
                    COUNT(*) AS totalReviews
                FROM reviews 
                GROUP BY apartment_id
            ) r ON a.id = r.apartment_id
            LEFT JOIN apartment_features af ON a.id = af.apartment_id
            LEFT JOIN apartment_gallery ag ON a.id = ag.apartment_id AND ag.is_primary = TRUE
            WHERE a.available = TRUE
            GROUP BY a.id, a.title, a.location, a.price_per_night, r.rating, r.totalReviews, ag.image_url
            ORDER BY a.created_at DESC
        `);

        conn.release();

        // Process and format data
        const response = apartments.map(apartment => ({
            id: apartment.id,
            title: apartment.title,
            location: apartment.location,
            price: Number(apartment.price),
            reviews: {
                rating: Number(apartment.rating),
                totalReviews: Number(apartment.totalReviews)
            },
            features: apartment.features ? apartment.features.split(',') : [],
            image: apartment.primary_image || '/api/placeholder/400/300'
        }));

        // Cache the result
        apartmentCache.set(cacheKey, {
            data: response,
            timestamp: Date.now()
        });

        return NextResponse.json(response, { 
            status: 200,
            headers: {
                'Cache-Control': 'public, max-age=300, s-maxage=300', // 5 minutes
                'X-Cache': 'MISS'
            }
        });

    } catch (err) {
        console.error("Error fetching apartments:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
