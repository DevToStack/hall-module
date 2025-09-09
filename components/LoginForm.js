"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ForgotPasswordPage from "./ResetPassword";
import OtpVerificationPage from "./OTPForm";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [step, setStep] = useState(1);
    const router = useRouter();

    // ✅ Redirect if already logged in (check via API, not localStorage)
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("/api/profile", {
                    method: "GET",
                    credentials: "include", // send cookie
                });

                if (res.ok) {
                    router.replace("/"); // Already logged in
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
                credentials: "include", // ✅ important: allow cookie
            });

            const data = await res.json();

            if (res.ok) {
                // ✅ Cookie is already set, just redirect
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
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            {step === 1 && (
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
                        <div className="flex flex-col">
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                required
                            />
                            <p className="mt-2 text-left text-xs mb-3 text-gray-500">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="text-blue-600 underline disabled:opacity-50"
                                >
                                    Forgot Password?
                                </button>
                            </p>
                        </div>

                        {error && (
                            <p className="text-red-600 text-sm font-medium mt-1">{error}</p>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <p className="mt-4 text-center text-sm text-gray-500">
                        Do not have an account?{" "}
                        <a href="/register" className="text-blue-600 underline">
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
