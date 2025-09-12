'use client';

import { useState, useRef, useEffect } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faKey, faLock, faPaperPlane, faUser, faPhone } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import Toast from './toast';

export default function RegisterForm() {
    const [step, setStep] = useState(1); // 1: Fill details + send OTP, 2: Verify OTP & Register
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState(Array(6).fill(""));
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [timer, setTimer] = useState(0);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const otpRefs = useRef([]);
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

    // Step 1: Send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match!');
            return;
        }
        setLoading(true);
        setTimer(60);
        try {
            const requser = await fetch('/api/user',{
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email,phone}),
            });
            const data = await requser.json();
            if(requser.ok){
                const res = await fetch('/api/auth/send-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, purpose: 'registration' }),
                });

                const data = await res.json();
                if (res.ok) {
                    setSuccess(`OTP sent to ${email}. Please check your inbox.`);
                    setTimeout(() => {
                        setStep(2);
                        setLoading(false);
                    }, 1000);
                } else {
                    setError(data.error || 'Failed to send OTP.')
                }
            }
            else{
                setError(data.message);
            }
            
        } catch (error) {
            setError('Something went wrong.Try again later');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP and Register
    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    password,
                    otp: otp.join("")
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setSuccess("user registered succesfully.")
                router.push('/signin'); // no delay needed
            } else {
                setError(data.error || 'Failed to register account.');
                setStep(1);
                setOtp(Array(6).fill("")); // reset OTP
                setName('');
                setEmail('');
                setPhone('');
                setPassword('');
                setConfirmPassword('');
            }
        } catch {
            setError('Something went wrong.');
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    {step === 1 ? "Register Account" : "Verify OTP"}
                </h2>

                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        {[
                            { icon: faUser, type: "text", placeholder: "Full Name", value: name, setter: setName },
                            { icon: faEnvelope, type: "email", placeholder: "Email", value: email, setter: setEmail },
                            { icon: faPhone, type: "tel", placeholder: "Phone Number", value: phone, setter: setPhone },
                            { icon: faLock, type: "password", placeholder: "Password", value: password, setter: setPassword },
                            { icon: faLock, type: "password", placeholder: "Confirm Password", value: confirmPassword, setter: setConfirmPassword },
                        ].map((field, i) => (
                            <div key={i} className="flex items-center border rounded-lg px-3 py-2">
                                <FontAwesomeIcon icon={field.icon} className="text-gray-400 mr-2" />
                                <input
                                    type={field.type}
                                    className="flex-1 outline-none"
                                    placeholder={field.placeholder}
                                    value={field.value}
                                    onChange={(e) => field.setter(e.target.value)}
                                    required
                                />
                            </div>
                        ))}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center"
                        >
                            {loading ? "Sending..." : (
                                <>
                                    <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                                    Send OTP
                                </>
                            )}
                        </button>
                        <a href='/signin' className='text-sm text-right text-blue-700'>
                            already have an account?
                        </a>
                    </form>
                )}

                {step === 2 &&(
                    <div>
                        <form onSubmit={handleRegister} className="space-y-4">
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
                                Register
                            </button>
                        </form>
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
                    </div>
                    
                    
                )}

                {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
                {success && <Toast message={success} type="success" onClose={() => setSuccess(null)} />}
            </div>
        </div>
    );
}
