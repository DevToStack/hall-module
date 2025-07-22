'use client'; // ✅ Must be the first line

import { signIn, signOut, useSession } from 'next-auth/react';

export default function AuthButton() {
    const { data: session } = useSession();

    return session ? (
        <div>
            <p>Welcome, {session.user.name}</p>
            <button onClick={() => signOut()}>Logout</button>
        </div>
    ) : (
        <button onClick={() => signIn('google')}>Sign in with Google</button>
    );
}
