'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterForm() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                body: JSON.stringify({ email }),
                headers: { 'Content-Type': 'application/json' },
            });

            if (res.ok) {
                // Save name and password for use after OTP verification
                localStorage.setItem('pending_name', name);
                localStorage.setItem('pending_password', password);

                router.push(`/verify-otp?email=${encodeURIComponent(email)}&mode=register`);
            } else {
                const error = await res.json();
                alert(error.message || 'Failed to send OTP');
            }
        } catch (err) {
            alert('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6">Register</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                    >
                        Generate OTP
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <a href="/signin" className="text-blue-600 underline">
                        Sign In
                    </a>
                </p>
            </div>
        </div>
    );
}
