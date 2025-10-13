'use client';

import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEnvelope,
    faLock,
    faPaperPlane,
    faUser,
    faPhone,
    faEye,
    faEyeSlash,
    faHome,
    faBuilding,
    faShieldAlt,
    faCheckCircle,
    faTimesCircle,
    faClock
} from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import Toast from '../../../components/toast';

export default function SecureRegisterForm() {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState('guest');
    const [selectedPlan, setSelectedPlan] = useState('Free');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [otp, setOtp] = useState(Array(6).fill(""));
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        feedback: [],
        strength: 'Very Weak',
        checks: {
            length: false,
            uppercase: false,
            lowercase: false,
            number: false,
            special: false
        }
    });
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const router = useRouter();
    const otpRefs = useRef([]);

    const plans = [
        { name: 'Free', price: 0, duration: '3 months', features: ['Basic listing', 'Standard support'] },
        { name: 'Standard', price: 300, duration: 'per month', features: ['Enhanced visibility', 'Priority support', 'Analytics'] },
        { name: 'Pro', price: 400, duration: '6 months', features: ['Featured listings', '24/7 support', 'Advanced analytics', 'Marketing tools'] },
    ];

    const securityFeatures = [
        "End-to-end encryption",
        "Two-factor authentication",
        "SSL secured connection",
        "GDPR compliant",
        "Regular security audits"
    ];

    // Set client-side flag to prevent hydration mismatch
    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (timer <= 0) return;
        const interval = setInterval(() => setTimer((t) => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    useEffect(() => {
        if (step === 2 && otpRefs.current[0]) otpRefs.current[0].focus();
    }, [step]);

    const calculatePasswordStrength = (password) => {
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[@$!%*?&]/.test(password),
        };

        const score = Object.values(checks).filter(Boolean).length;
        const feedback = [];

        if (!checks.length) feedback.push("At least 8 characters");
        if (!checks.uppercase) feedback.push("One uppercase letter");
        if (!checks.lowercase) feedback.push("One lowercase letter");
        if (!checks.number) feedback.push("One number");
        if (!checks.special) feedback.push("One special character (@$!%*?&)");

        let strength = 'Very Weak';
        if (score >= 4) strength = 'Strong';
        else if (score >= 3) strength = 'Medium';
        else if (score >= 2) strength = 'Weak';

        return { score, feedback, strength, checks };
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (field === 'password') {
            setPasswordStrength(calculatePasswordStrength(value));
        }
    };

    const handleOtpChange = (value, index) => {
        if (/^\d*$/.test(value)) {
            let newOtp = [...otp];
            if (value.length > 1) {
                value.split('').slice(0, 6).forEach((char, idx) => newOtp[idx] = char);
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
        if (e.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1].focus();
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError("Please enter your full name");
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError("Please enter a valid email address");
            return false;
        }
        if (!/^\d{10}$/.test(formData.phone)) {
            setError("Please enter a valid 10-digit phone number");
            return false;
        }
        if (passwordStrength.strength !== 'Strong') {
            setError("Please use a strong password that meets all requirements");
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return false;
        }
        if (!acceptedTerms) {
            setError("Please accept the terms and conditions");
            return false;
        }
        return true;
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setTimer(60);
        setError('');
        setSuccess('');

        try {
            const userCheck = await fetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, phone: formData.phone }),
            });

            const userData = await userCheck.json();
            if (!userCheck.ok) {
                setError(userData.message);
                setLoading(false);
                return;
            }

            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    purpose: 'registration',
                    name: formData.name
                }),
            });

            const otpData = await res.json();
            if (res.ok) {
                setSuccess(`Security code sent to ${formData.email}. Valid for 10 minutes.`);
                setTimeout(() => {
                    setStep(2);
                    setLoading(false);
                }, 1500);
            } else {
                setError(otpData.error || 'Failed to send security code.');
                setLoading(false);
            }
        } catch (error) {
            setError('Security verification failed. Please try again.');
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Security-Token': 'secure-registration-v1'
                },
                body: JSON.stringify({
                    ...formData,
                    otp: otp.join(""),
                    role,
                    selectedPlan,
                    registrationTime: new Date().toISOString()
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess("Account secured successfully! Redirecting...");

                setTimeout(() => {
                    if (role === 'host' && (selectedPlan === 'Standard' || selectedPlan === 'Pro')) {
                        router.push(`/api/razorpay/checkout?email=${formData.email}&plan=${selectedPlan}`);
                    } else {
                        router.push(role === 'host' ? '/host/dashboard' : '/signin');
                    }
                }, 2000);
            } else {
                setError(data.message || 'Security verification failed.');
                if (data.retryOtp) {
                    setStep(1);
                    setOtp(Array(6).fill(""));
                }
            }
        } catch {
            setError('Security protocol failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const PasswordStrengthIndicator = () => (
        <div className="mt-2 p-3 bg-black/20 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Password Strength:</span>
                <span className={`text-sm font-bold ${passwordStrength.strength === 'Strong' ? 'text-green-400' :
                        passwordStrength.strength === 'Medium' ? 'text-yellow-400' :
                            passwordStrength.strength === 'Weak' ? 'text-orange-400' :
                                'text-red-400'
                    }`}>
                    {passwordStrength.strength}
                </span>
            </div>

            <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                <div
                    className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.strength === 'Strong' ? 'bg-green-500 w-full' :
                            passwordStrength.strength === 'Medium' ? 'bg-yellow-500 w-3/4' :
                                passwordStrength.strength === 'Weak' ? 'bg-orange-500 w-1/2' :
                                    'bg-red-500 w-1/4'
                        }`}
                />
            </div>

            <div className="space-y-1">
                {[
                    { key: 'length', text: 'At least 8 characters' },
                    { key: 'uppercase', text: 'One uppercase letter' },
                    { key: 'lowercase', text: 'One lowercase letter' },
                    { key: 'number', text: 'One number' },
                    { key: 'special', text: 'One special character (@$!%*?&)' }
                ].map((req) => (
                    <div key={req.key} className="flex items-center text-xs">
                        <FontAwesomeIcon
                            icon={passwordStrength.checks?.[req.key] ? faCheckCircle : faTimesCircle}
                            className={`mr-2 ${passwordStrength.checks?.[req.key] ? 'text-green-400' : 'text-red-400'
                                }`}
                        />
                        <span className={passwordStrength.checks?.[req.key] ? 'text-green-400' : 'text-gray-400'}>
                            {req.text}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );

    // Don't render anything until client-side to prevent hydration mismatch
    if (!isClient) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="bg-white/10 text-gray-100 p-6 rounded-2xl w-full max-w-md border border-white/10">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-700 rounded mb-6"></div>
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-12 bg-gray-700 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="bg-white/10 text-gray-100 p-6 rounded-2xl w-full max-w-md border border-white/10">
                <h2 className="text-2xl font-bold text-center text-gray-100 mb-6">
                    {step === 1 ? "Register Account" : "Verify OTP"}
                </h2>

                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        {/* Role Selection */}
                        <div className="flex justify-between mb-4">
                            <button
                                type="button"
                                onClick={() => setRole('guest')}
                                className={`flex-1 py-2 rounded-lg mr-2 border transition-colors ${role === 'guest'
                                        ? 'bg-teal-500 text-white border-teal-500'
                                        : 'bg-transparent border-white/20 text-gray-300 hover:border-teal-400'
                                    }`}
                            >
                                <FontAwesomeIcon icon={faHome} className="mr-2" /> Guest
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('host')}
                                className={`flex-1 py-2 rounded-lg border transition-colors ${role === 'host'
                                        ? 'bg-teal-500 text-white border-teal-500'
                                        : 'bg-transparent border-white/20 text-gray-300 hover:border-teal-400'
                                    }`}
                            >
                                <FontAwesomeIcon icon={faBuilding} className="mr-2" /> Host
                            </button>
                        </div>

                        {/* Form Fields */}
                        {[
                            { icon: faUser, type: "text", placeholder: "Full Name", value: formData.name, setter: (val) => handleInputChange('name', val) },
                            { icon: faEnvelope, type: "email", placeholder: "Email", value: formData.email, setter: (val) => handleInputChange('email', val) },
                            { icon: faPhone, type: "tel", placeholder: "Phone Number", value: formData.phone, setter: (val) => handleInputChange('phone', val) },
                        ].map((field, i) => (
                            <div key={i} className="flex items-center border border-white/10 rounded-lg px-3 py-2 bg-white/5">
                                <FontAwesomeIcon icon={field.icon} className="text-gray-100 mr-4" />
                                <input
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    value={field.value}
                                    onChange={(e) => field.setter(e.target.value)}
                                    className="flex-1 outline-none bg-transparent text-gray-100 placeholder-gray-400"
                                    required
                                />
                            </div>
                        ))}

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex items-center border border-white/10 rounded-lg px-3 py-2 bg-white/5">
                                <FontAwesomeIcon icon={faLock} className="text-gray-100 mr-4" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    className="flex-1 outline-none bg-transparent text-gray-100 placeholder-gray-400"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-gray-400 hover:text-white transition-colors p-1"
                                >
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                </button>
                            </div>
                            {formData.password && <PasswordStrengthIndicator />}
                        </div>

                        {/* Confirm Password Field */}
                        <div className="flex items-center border border-white/10 rounded-lg px-3 py-2 bg-white/5">
                            <FontAwesomeIcon icon={faLock} className="text-gray-100 mr-4" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                className="flex-1 outline-none bg-transparent text-gray-100 placeholder-gray-400"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="text-gray-400 hover:text-white transition-colors p-1"
                            >
                                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                            </button>
                        </div>

                        {/* Host Plan Selector */}
                        {role === 'host' && (
                            <div className="mt-4 p-3 bg-black/20 rounded-lg border border-white/10">
                                <p className="text-gray-300 mb-2 text-sm">Select Hosting Plan:</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {plans.map(plan => (
                                        <button
                                            key={plan.name}
                                            type="button"
                                            onClick={() => setSelectedPlan(plan.name)}
                                            className={`p-2 border rounded-lg text-sm transition-colors ${selectedPlan === plan.name
                                                    ? 'bg-teal-500 border-teal-400 text-black'
                                                    : 'border-white/10 text-gray-300 hover:border-teal-400'
                                                }`}
                                        >
                                            {plan.name}<br />
                                            <span className="text-xs">{plan.price ? `₹${plan.price}` : 'Free'}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Terms and Conditions */}
                        <div className="flex items-start space-x-3 p-3 bg-black/20 rounded-lg border border-white/10">
                            <input
                                type="checkbox"
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                className="mt-1 text-teal-500 rounded focus:ring-teal-400"
                            />
                            <label className="text-sm text-gray-300">
                                I agree to the{' '}
                                <a href="/terms" className="text-teal-400 hover:text-teal-300 underline">
                                    Terms of Service
                                </a>{' '}
                                and{' '}
                                <a href="/privacy" className="text-teal-400 hover:text-teal-300 underline">
                                    Privacy Policy
                                </a>
                            </label>
                        </div>

                        {/* Security Badge */}
                        <div className="flex items-center justify-center space-x-2 text-sm text-teal-400 p-2">
                            <FontAwesomeIcon icon={faShieldAlt} />
                            <span>Secure Registration</span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <FontAwesomeIcon icon={faClock} className="animate-spin mr-2" />
                                    Sending OTP...
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                                    Send OTP
                                </>
                            )}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="text-center mb-4">
                            <FontAwesomeIcon icon={faShieldAlt} className="text-teal-400 text-2xl mb-2" />
                            <p className="text-gray-400 text-sm">
                                Enter the 6-digit code sent to<br />
                                <span className="text-white">{formData.email}</span>
                            </p>
                        </div>

                        <div className="flex justify-between gap-2">
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={(el) => otpRefs.current[i] = el}
                                    type="text"
                                    maxLength="1"
                                    className="w-12 h-12 text-center text-lg font-bold border border-white/20 rounded-lg bg-white/5 text-white focus:border-teal-400 transition-colors"
                                    value={digit}
                                    onChange={(e) => handleOtpChange(e.target.value, i)}
                                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                                />
                            ))}
                        </div>

                        {timer > 0 && (
                            <p className="text-center text-gray-400 text-sm">
                                Code expires in: <span className="text-orange-400">{timer}s</span>
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading || otp.join('').length !== 6}
                            className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Verifying...' : 'Complete Registration'}
                        </button>

                        <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={timer > 0}
                            className="w-full text-gray-400 hover:text-white py-2 text-sm transition-colors disabled:opacity-50"
                        >
                            Didn't receive code? {timer > 0 ? `Resend in ${timer}s` : 'Resend Now'}
                        </button>
                    </form>
                )}

                {error && <Toast message={error} type="error" onClose={() => setError("")} />}
                {success && <Toast message={success} type="success" onClose={() => setSuccess("")} />}
            </div>
        </div>
    );
}