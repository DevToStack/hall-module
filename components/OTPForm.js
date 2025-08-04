'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function OtpForm() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [mode, setMode] = useState('register');
    const [otpDigits, setOtpDigits] = useState(Array(6).fill(''));
    const [loading, setLoading] = useState(false);

    const inputRefs = useRef([...Array(6)].map(() => React.createRef()));

    const [name, setName] = useState('');
    const [password, setPassword] = useState('');

    // ✅ safely extract query params on client only
    useEffect(() => {
        if (searchParams) {
            setEmail(searchParams.get('email') || '');
            setMode(searchParams.get('mode') || 'register');
        }

        // Only access storage in client environment
        if (typeof window !== 'undefined') {
            setName(localStorage.getItem('pending_name') || '');
            setPassword(localStorage.getItem('pending_password') || sessionStorage.getItem('pending_password') || '');
        }
    }, [searchParams]);

    const handleChange = (e, index) => {
        const value = e.target.value.replace(/\D/g, '').charAt(0);
        const updated = [...otpDigits];
        updated[index] = value;
        setOtpDigits(updated);
        if (value && index < 5) {
            inputRefs.current[index + 1]?.current?.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            inputRefs.current[index - 1]?.current?.focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const otp = otpDigits.join('');

        if (otp.length !== 6) {
            alert('Please enter all 6 digits.');
            return;
        }

        setLoading(true);

        try {
            const otpRes = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });

            const otpData = await otpRes.json();

            if (!otpRes.ok || !otpData.success) {
                alert(otpData.message || 'OTP verification failed.');
                return;
            }

            if (mode === 'register') {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password }),
                });

                const data = await res.json();

                if (res.ok && data.token) {
                    localStorage.removeItem('pending_name');
                    localStorage.removeItem('pending_password');
                    localStorage.setItem('token', data.token);
                    router.push('/');
                } else {
                    alert(data.error || 'Registration failed.');
                }
            } else if (mode === 'login') {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, otp }),
                });

                const data = await res.json();

                if (res.ok && data.token) {
                    sessionStorage.removeItem('pending_password');
                    localStorage.setItem('token', data.token);
                    router.push('/profile');
                } else {
                    alert(data.error || 'Login failed.');
                }
            }
        } catch (err) {
            console.error('OTP verification error:', err);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                alert('OTP resent successfully.');
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to resend OTP.');
            }
        } catch (err) {
            alert('Resend failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6">Verify OTP</h1>
                <p className="text-sm text-gray-600 text-center mb-4">
                    We&apos;ve sent an OTP to <span className="font-medium">{email}</span>
                </p>

                <form onSubmit={handleVerify} className="space-y-6">
                    <div className="flex justify-between gap-2">
                        {otpDigits.map((digit, index) => (
                            <input
                                key={index}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                ref={inputRefs.current[index]}
                                className="w-12 h-12 text-center text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        {loading
                            ? 'Verifying...'
                            : mode === 'login'
                                ? 'Login'
                                : 'Complete Registration'}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-500">
                    Didn&apos;t receive the OTP?{' '}
                    <button onClick={handleResend} className="text-blue-600 hover:underline">
                        Resend
                    </button>
                </p>
            </div>
        </div>
    );
}
