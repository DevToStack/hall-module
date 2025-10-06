'use client';

import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faPaperPlane, faUser, faPhone, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import Toast from '../../../components/toast';

export default function RegisterForm() {
    const [step, setStep] = useState(1); // 1: Fill details + send OTP, 2: Verify OTP & Register
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState(Array(6).fill(""));
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState("");
    const router = useRouter();
    const otpRefs = useRef([]);

    // Countdown effect
    useEffect(() => {
        if (timer <= 0) return;
        const interval = setInterval(() => setTimer((t) => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    useEffect(() => {
        if (step === 2 && otpRefs.current[0]) {
            otpRefs.current[0].focus();
        }
    }, [step]);

    // Password strength checker
    const getPasswordStrength = (pwd) => {
        let strength = 0;
        if (pwd.length >= 8) strength++;
        if (/[A-Z]/.test(pwd)) strength++;
        if (/[a-z]/.test(pwd)) strength++;
        if (/[0-9]/.test(pwd)) strength++;
        if (/[@$!%*?&]/.test(pwd)) strength++;

        if (strength <= 2) return 'Weak';
        if (strength === 3 || strength === 4) return 'Medium';
        if (strength === 5) return 'Strong';
    };

    const handlePasswordChange = (value) => {
        setPassword(value);
        setPasswordStrength(getPasswordStrength(value));
    };

    // OTP input handlers
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
                if (value && index < 5) otpRefs.current[index + 1].focus();
            }
        }
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1].focus();
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();

        // Check if passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match!');
            return;
        }

        // Check password strength
        const strength = getPasswordStrength(password);
        if (strength !== 'Strong') {
            setError(`Password strength is ${strength}. Please use a strong password.`);
            return; // Stop here, do not send OTP
        }

        // Clear previous errors and proceed
        setLoading(true);
        setTimer(60);
        setError('');
        setSuccess('');

        try {
            const requser = await fetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, phone }),
            });

            const data = await requser.json();
            if (!requser.ok) {
                setError(data.message);
                setLoading(false);
                return;
            }

            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, purpose: 'registration' }),
            });

            const otpData = await res.json();
            if (res.ok) {
                setSuccess(`OTP sent to ${email}. Please check your inbox.`);
                setTimeout(() => {
                    setStep(2);
                    setLoading(false);
                }, 1000);
            } else {
                setError(otpData.error || 'Failed to send OTP.');
                setLoading(false);
            }
        } catch (err) {
            setError('Something went wrong. Try again later');
            setLoading(false);
        }
    };
    

    // Step 2: Verify OTP and Register
    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

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
                setSuccess("User registered successfully.");
                router.push('/signin');
            } else {
                setError(data.message || 'Failed to register account.');
                setStep(1);
                setOtp(Array(6).fill(""));
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
        <div className="min-h-screen flex items-center justify-top sm:justify-center bg-white/10 sm:bg-black">
            <div className="sm:bg-white/10 text-gray-100 p-6 sm:p-8 rounded-2xl sm:shadow-xl w-full max-w-md border-0 border-white/10 sm:border max-sm:h-full">
                <h2 className="text-2xl font-bold text-center text-gray-100 mb-6">
                    {step === 1 ? "Register Account" : "Verify OTP"}
                </h2>

                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        {[
                            { icon: faUser, type: "text", placeholder: "Full Name", value: name, setter: setName },
                            { icon: faEnvelope, type: "email", placeholder: "Email", value: email, setter: setEmail },
                            { icon: faPhone, type: "tel", placeholder: "Phone Number", value: phone, setter: setPhone },
                            { icon: faLock, type: "password", placeholder: "Password", value: password, setter: handlePasswordChange, show: showPassword, setShow: setShowPassword },
                            { icon: faLock, type: "password", placeholder: "Confirm Password", value: confirmPassword, setter: setConfirmPassword, show: showConfirmPassword, setShow: setShowConfirmPassword },
                        ].map((field, i) => (
                            <div key={i} className="flex items-center border border-white/10 rounded-lg px-3 py-2 focus-within:border-white transition-colors relative">
                                <FontAwesomeIcon icon={field.icon} className="text-gray-100 mr-4" />
                                <input
                                    type={field.show !== undefined ? (field.show ? "text" : "password") : field.type}
                                    placeholder={field.placeholder}
                                    value={field.value}
                                    onChange={(e) => field.setter(e.target.value)}
                                    className="flex-1 outline-none bg-transparent text-gray-100"
                                    required
                                />
                                {field.type === "password" && (
                                    <button
                                        type="button"
                                        onClick={() => field.setShow(true)}
                                        className="absolute right-3 text-gray-400 hover:text-gray-200"
                                    >
                                        <FontAwesomeIcon icon={field.show ? faEyeSlash : faEye} />
                                    </button>
                                )}
                            </div>
                        ))}

                        {/* Password strength text */}
                        {password && (
                            <p className={`text-sm ${passwordStrength === 'Weak' ? 'text-red-500' : passwordStrength === 'Medium' ? 'text-yellow-400' : 'text-green-500'}`}>
                                Password Strength: {passwordStrength}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading || passwordStrength !== 'Strong'}
                            className="w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg flex items-center justify-center"
                        >
                            {loading ? "Sending..." : (
                                <>
                                    <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                                    Send OTP
                                </>
                            )}
                        </button>

                        <p className='text-sm text-gray-400'>
                            already have an account?{" "}
                            <a href='/signin' className='text-right text-gray-100 ml-1 underline hover:text-gray-400'>
                                Login
                            </a>
                        </p>
                    </form>
                )}

                {step === 2 && (
                    <div>
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="flex justify-between gap-2">
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => otpRefs.current[i] = el}
                                        type="text"
                                        maxLength="1"
                                        className="w-12 h-12 max-sm:w-10 max-sm:h-10 text-center text-lg font-bold border border-white/20 rounded-lg outline-none focus:border-white"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(e.target.value, i)}
                                        onKeyDown={(e) => handleOtpKeyDown(e, i)}
                                    />
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white/10 text-gray-100 py-2 rounded-lg hover:bg-white/20 transition-all"
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
