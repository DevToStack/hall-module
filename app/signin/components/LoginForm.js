"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ForgotPasswordPage from "./ResetPassword";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [step, setStep] = useState(1);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("/api/auth/me", {
                    method: "GET",
                    credentials: "include",
                });

                if (res.ok) {
                    router.replace("/");
                }
            } catch (err) {
                console.error("Auth check failed:", err);
            }
        };
        checkAuth();
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (!password) {
            setError("Password is required.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            const data = await res.json();

            if (res.ok) {
                router.push("/");
            } else if (res.status === 401) {
                setError("Incorrect email or password. Try again or register.");
            } else {
                setError(data.error || "Login failed. Please try again.");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Server error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-top sm:justify-center bg-white/10 sm:bg-black sm:p-4">
            {step === 1 && (
                <div className="sm:bg-white/10 text-gray-100 p-8 rounded-2xl sm:shadow-xl w-full border-0 border-white/10 sm:max-w-md sm:border">
                    <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Input */}
                        <div className="flex items-center border border-white/10 rounded-lg px-3 py-2 focus-within:border-white transition-colors">
                            <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 mr-3" />
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => {
                                    let val = e.target.value;

                                    // If user typed '@' without a domain yet
                                    if (val.endsWith("@") && !val.includes("@gmail.com")) {
                                        val = val + "gmail.com";
                                    }

                                    // If user typed extra after @gmail.com, trim it
                                    if (val.includes("@gmail.com")) {
                                        const index = val.indexOf("@gmail.com") + "@gmail.com".length;
                                        val = val.slice(0, index);
                                    }

                                    setEmail(val);
                                }}
                                className="flex-1 outline-none bg-transparent text-gray-100"
                                required
                            />


                        </div>

                        {/* Password Input */}
                        <div className="flex items-center border border-white/10 rounded-lg px-3 py-2 focus-within:border-white transition-colors relative">
                            <FontAwesomeIcon icon={faLock} className="text-gray-400 mr-3" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="flex-1 outline-none bg-transparent text-gray-100"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPassword(true); // Show password temporarily
                                    setTimeout(() => setShowPassword(false), 3000); // Hide after 3s
                                }}
                                className="absolute right-3 text-gray-400 hover:text-gray-200"
                            >
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </button>
                        </div>


                        <p className="mt-2 text-left text-xs mb-3 ml-1 text-gray-500">
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="text-gray-100 underline cursor-pointer hover:text-gray-400 disabled:opacity-50"
                            >
                                Forgot Password?
                            </button>
                        </p>

                        {error && (
                            <p className="text-red-600 text-sm font-medium mt-1">{error}</p>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-white/10 text-gray-100 py-2 rounded-lg hover:bg-white/20 transition-all"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <p className="mt-4 text-center text-sm text-gray-500">
                        Do not have an account?{" "}
                        <a href="/register" className="text-gray-100 underline hover:text-gray-400">
                            Register
                        </a>
                    </p>
                </div>
            )}

            {step === 2 && (
                <div className="bg-white p-8 max-sm:p-5 rounded-2xl shadow-xl w-full max-w-md">
                    <ForgotPasswordPage />
                </div>
            )}
        </div>
    );
}
