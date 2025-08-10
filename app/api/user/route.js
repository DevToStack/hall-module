import { query } from '@/lib/mysql-wrapper';
import { NextResponse } from "next/server";

export async function POST(req) {
    
    try {
        const {email} = await req.json();
        const Users = await query(`SELECT email FROM users WHERE email = ?`, [email]);
        if (Users.length !== 0) {
            return NextResponse.json({ message: "The account is already registered." }, { status: 400 });
        }
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return new NextResponse('Database Error', { status: 500 });
    }
}
