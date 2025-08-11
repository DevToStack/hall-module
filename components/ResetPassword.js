'use client';

import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';

const ForgotPasswordPage = ()=> {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP + New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(Array(6).fill(""));
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const router = useRouter();
    const otpRefs = useRef([]);
    const [timer, setTimer] = useState(0); // seconds remaining

    // Countdown effect
    useEffect(() => {
        if (timer <= 0) return;
        const interval = setInterval(() => {
            setTimer((t) => t - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timer]);

    useEffect(() => {
        if (step === 2 && otpRefs.current[0]) {
            otpRefs.current[0].focus();
        }
    }, [step]);

    const handleOtpChange = (value, index) => {
        if (/^\d*$/.test(value)) {
            let newOtp = [...otp];

            if (value.length > 1) { // paste case
                value.split('').slice(0, 6).forEach((char, idx) => {
                    newOtp[idx] = char;
                });
                setOtp(newOtp);
                otpRefs.current[Math.min(value.length, 5)].focus();
            } else {
                newOtp[index] = value;
                setOtp(newOtp);
                if (value && index < 5) {
                    otpRefs.current[index + 1].focus();
                }
            }
        }
    };
    const handleOtpKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1].focus();
        }
    };
    // Step 1: Request OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');       // Call parent function to resend OTP
        setTimer(60);      // Reset countdown to 60 seconds
        try {
            const res = await fetch(`${process.env.NEXTAUTH_URL }/api/auth/send-reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            if (res.ok) {
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
                body: JSON.stringify({ email,otp:otp.join(""), newPassword }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage('Password reset successful! You can now log in.');
                router.push('/signin');
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
        <div className="">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                {step === 1 ? 'Forgot Password' : 'Reset Password'}
            </h2>

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
                    <p className='text-sm'>The otp has sent successfuly in you gmail account <strong>{email}</strong></p>
                    <div className="flex justify-between gap-2">
                        {otp.map((digit, i) => (
                            <input
                                key={i}
                                ref={(el) => otpRefs.current[i] = el}
                                type="text"
                                maxLength="1"
                                className="w-12 h-12 max-sm:w-10 max-sm:h-10 text-center text-lg font-bold border rounded-lg outline-none focus:border-blue-500"
                                value={digit}
                                onChange={(e) => handleOtpChange(e.target.value, i)}
                                onKeyDown={(e) => handleOtpKeyDown(e, i)}
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center"
                    >
                        Reset Password
                    </button>
                    <div className="text-center mt-3">
                        {timer > 0 ? (
                            <span className="text-gray-500">
                                Resend OTP in {timer}s
                            </span>
                        ) : (
                            <button
                                className="text-blue-600 hover:underline"
                                onClick={handleSendOtp}
                            >
                                Resend OTP
                            </button>
                        )}
                    </div>
                </form>
            )}

            {message && (
                <p className={`mt-4 text-center text-sm ${message.includes('successful') ? 'text-green-600' : 'text-red-500'}`}>
                    {message}
                </p>
            )}
        </div>
    );
}

export default ForgotPasswordPage;