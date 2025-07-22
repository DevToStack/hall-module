import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { query } from '@/lib/mysql-wrapper'; // we'll define this helper

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            // Save or update user in your MySQL database
            const existing = await query('SELECT * FROM users WHERE email = ?', [user.email]);

            if (existing.length === 0) {
                await query(
                    'INSERT INTO users (name, email, role) VALUES (?, ?, ?)',
                    [user.name, user.email, 'guest']
                );
            }

            return true;
        },
        async session({ session }) {
            // Optionally attach role/userId/etc. from DB
            const users = await query('SELECT * FROM users WHERE email = ?', [session.user.email]);
            session.user.id = users?.[0]?.id;
            session.user.role = users?.[0]?.role;
            return session;
        },
    },
});

export { handler as GET, handler as POST };
