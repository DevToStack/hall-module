'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faKey, faLock, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP + New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Step 1: Request OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch(`${process.env.NEXTAUTH_URL }/api/auth/send-reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage('OTP sent to your email.');
                setStep(2);
            } else {
                setMessage(data.error || 'Failed to send OTP.');
            }
        } catch (error) {
            setMessage('Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch(`${process.env.NEXTAUTH_URL }/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage('Password reset successful! You can now log in.');
                setStep(1);
                setEmail('');
                setOtp('');
                setNewPassword('');
            } else {
                setMessage(data.error || 'Failed to reset password.');
            }
        } catch (error) {
            setMessage('Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    {step === 1 ? 'Forgot Password' : 'Reset Password'}
                </h2>

                {message && (
                    <p className={`mb-4 text-center text-sm ${message.includes('successful') ? 'text-green-600' : 'text-red-500'}`}>
                        {message}
                    </p>
                )}

                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div className="flex items-center border rounded-lg px-3 py-2">
                            <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 mr-2" />
                            <input
                                type="email"
                                className="flex-1 outline-none"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center"
                        >
                            {loading ? 'Sending...' : (
                                <>
                                    <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                                    Send OTP
                                </>
                            )}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="flex items-center border rounded-lg px-3 py-2">
                            <FontAwesomeIcon icon={faKey} className="text-gray-400 mr-2" />
                            <input
                                type="text"
                                className="flex-1 outline-none"
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex items-center border rounded-lg px-3 py-2">
                            <FontAwesomeIcon icon={faLock} className="text-gray-400 mr-2" />
                            <input
                                type="password"
                                className="flex-1 outline-none"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
