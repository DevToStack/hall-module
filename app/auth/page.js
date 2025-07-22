'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session) router.push('/');
    }, [session]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg space-y-6">
                <h1 className="text-2xl font-bold text-center">Login to Your Account</h1>

                {/* Email login - not implemented */}
                <form className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-3 border border-gray-300 rounded"
                        disabled
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-3 border border-gray-300 rounded"
                        disabled
                    />
                    <button
                        type="submit"
                        disabled
                        className="w-full bg-gray-300 text-white font-semibold py-3 rounded cursor-not-allowed"
                    >
                        Login (Coming Soon)
                    </button>
                </form>

                <div className="text-center text-sm text-gray-500">or</div>

                {/* Google login */}
                <button
                    onClick={() => signIn('google')}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded"
                >
                    Sign in with Google
                </button>

                <p className="text-center text-sm">
                    Don’t have an account?{' '}
                    <a href="/auth/register" className="text-blue-500 hover:underline">
                        Register
                    </a>
                </p>
            </div>
        </div>
    );
}
