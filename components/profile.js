// app/profile/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const ProfilePage = ()=> {
    const [profile, setProfile] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log(token);
        if (!token) return router.push('/signin');

        fetch('/api/profile', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.user) setProfile(data);
                else router.push('/signin');
            })
            .catch(() => router.push('/signin'));
    }, [router]);

    if (!profile) {
        return <div className="text-center mt-32 text-gray-600">Loading profile...</div>;
    }

    const { user, bookings } = profile;

    return (
        <div className="max-w-4xl mx-auto mt-24 p-6 bg-white shadow-xl rounded-xl">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Welcome, {user.name}</h1>

            <div className="grid sm:grid-cols-2 gap-4 mb-8 text-gray-700">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Member Since:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
                <p><strong>Total Bookings:</strong> {bookings.length}</p>
            </div>

            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Recent Bookings</h2>
            <div className="space-y-4">
                {bookings.length === 0 ? (
                    <p className="text-gray-500">No bookings yet.</p>
                ) : (
                    bookings.map((b) => (
                        <div key={b.id} className="border rounded-lg p-4 shadow-sm">
                            <p><strong>Apartment:</strong> {b.apartment_title}</p>
                            <p><strong>Location:</strong> {b.apartment_location}</p>
                            <p><strong>Dates:</strong> {b.start_date} to {b.end_date}</p>
                            <p><strong>Status:</strong> {b.status}</p>
                            <p><strong>Payment:</strong> ₹{b.amount} ({b.payment_status})</p>
                            <p><strong>Paid By:</strong> {b.method}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
export default ProfilePage;