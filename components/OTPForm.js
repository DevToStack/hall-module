'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function OtpForm() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const email = searchParams.get('email') || '';
    const mode = searchParams.get('mode') || 'register';

    const inputRefs = useRef([...Array(6)].map(() => React.createRef()));
    const [otpDigits, setOtpDigits] = useState(Array(6).fill(''));
    const [loading, setLoading] = useState(false);

    // Get name and password from localStorage (used in register mode)
    const name = typeof window !== 'undefined' ? localStorage.getItem("pending_name") || "" : "";
    const password = typeof window !== 'undefined' ? localStorage.getItem("pending_password") || "" : "";

    const handleVerify = async (e) => {
        e.preventDefault();
        const otp = otpDigits.join('');
        if (otp.length < 6) {
            alert('Enter all 6 digits');
            return;
        }

        setLoading(true);

        try {
            const otpRes = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                body: JSON.stringify({ email, otp }),
                headers: { 'Content-Type': 'application/json' },
            });

            const otpData = await otpRes.json();
            if (!otpRes.ok || !otpData.success) {
                alert(otpData.message || 'OTP verification failed');
                return;
            }

            if (mode === 'register') {
                const regRes = await fetch('/api/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({ name, email, password }),
                    headers: { 'Content-Type': 'application/json' },
                });

                const regData = await regRes.json();
                if (regData.token) {
                    localStorage.removeItem("pending_name");
                    localStorage.removeItem("pending_password");
                    localStorage.setItem('token', regData.token);
                    router.push('/');
                } else {
                    alert(regData.error || 'Registration failed');
                }
            } else if (mode === 'login') {
                const password = sessionStorage.getItem('pending_password') || '';

                const loginRes = await fetch('/api/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password, otp }),
                    headers: { 'Content-Type': 'application/json' },
                });

                const loginData = await loginRes.json();

                if (loginData.token) {
                    sessionStorage.removeItem("pending_password");
                    localStorage.setItem('token', loginData.token);
                    router.push('/profile');
                } else {
                    alert(loginData.error || 'Login failed');
                }
            }
            
        } catch (err) {
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e, index) => {
        const value = e.target.value.replace(/\D/g, '').charAt(0);
        const newOtp = [...otpDigits];
        newOtp[index] = value;
        setOtpDigits(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.current?.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            inputRefs.current[index - 1]?.current?.focus();
        }
    };

    const handleResend = async () => {
        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                body: JSON.stringify({ email }),
                headers: { 'Content-Type': 'application/json' },
            });

            if (res.ok) {
                alert('OTP resent successfully');
            } else {
                const error = await res.json();
                alert(error.message || "Failed to resend OTP");
            }
        } catch {
            alert("Failed to resend OTP. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6">Verify OTP</h1>
                <p className="text-sm text-gray-600 text-center mb-4">
                    We've sent an OTP to <span className="font-medium">{email}</span>
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
                    Didn't receive the OTP?{' '}
                    <button onClick={handleResend} className="text-blue-600 hover:underline">
                        Resend
                    </button>
                </p>
            </div>
        </div>
    );
}
