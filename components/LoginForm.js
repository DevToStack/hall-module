'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    // ✅ Redirect if already logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            router.replace('/'); // Redirect to home page
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        if (!password) {
            setError('Password is required.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await res.json();

            if (res.ok) {
                const reso = await fetch('/api/auth/send-otp', {
                    method: 'POST',
                    body: JSON.stringify({ email }),
                    headers: { 'Content-Type': 'application/json' },
                });

                if (reso.ok) {
                    sessionStorage.setItem('pending_password', password);
                    router.push(`/verify-otp?email=${encodeURIComponent(email)}&mode=login`);
                } else {
                    const errorData = await reso.json();
                    setError(errorData.message || 'Failed to send OTP. Please try again.');
                }
            } else {
                setError(data.error || 'Incorrect email or password. Try again or register.');
            }
        } catch {
            setError('Server error. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        required
                    />

                    {error && (
                        <p className="text-red-600 text-sm font-medium mt-1">{error}</p>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-500">
                    Don’t have an account?{' '}
                    <a href="/register" className="text-blue-600 underline">
                        Register
                    </a>
                </p>

                <p className="mt-2 text-center text-sm text-gray-500">
                    <a href="/forgot-password" className="text-blue-600 underline">
                        Forgot Password?
                    </a>
                </p>
            </div>
        </div>
    );
}
