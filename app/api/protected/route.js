import { verifyToken } from '@/lib/jwt';

export async function GET(req) {
    const auth = req.headers.get('authorization');
    const token = auth?.split(' ')[1];
    const user = verifyToken(token);

    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify({ message: `Hello ${user.email}` }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
