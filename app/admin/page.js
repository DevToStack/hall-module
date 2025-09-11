// app/admin/dashboard/page.jsx
'use client';
import AdminDashboardStats from '@/components/adminDashboard';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHome, faUsers, faCalendar, faCreditCard, faChartLine,
    faBars, faXmark, faRightFromBracket
} from '@fortawesome/free-solid-svg-icons';

const navItems = [
    { id: 'overview', label: 'Overview', icon: faHome },
    { id: 'users', label: 'Users', icon: faUsers },
    { id: 'bookings', label: 'Bookings', icon: faCalendar },
    { id: 'payments', label: 'Payments', icon: faCreditCard },
];

export default function AdminDashboard() {
    const [active, setActive] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const router = useRouter();
    
    const fetchDashboardData = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/dashboard', {
                cache: 'no-store',
                credentials: 'include',
            });

            if (!res.ok) {
                router.push('/signin');
                return;
            }
            const data = await res.json();
            setDashboardData(data);
        } catch (err) {
            console.error('Admin dashboard fetch error:', err);
            router.push('/signin');
        }
    }, [router]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    if (!dashboardData) return <div className="h-screen flex items-center justify-center">Loading...</div>;

    const { users, bookings, payments} = dashboardData;

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            router.push('/signin');
        }
    };

    const Sidebar = (
        <aside className="w-80 p-6 space-y-6 text-white bg-white/10 backdrop-blur-md h-full">
            <div className="flex items-center justify-between md:block">
                <h2 className="text-2xl font-bold tracking-wide">Admin</h2>
                <button className="md:hidden text-white" onClick={() => setSidebarOpen(false)}>
                    <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                </button>
            </div>
            <nav className="pt-6 space-y-3">
                {navItems.map(({ id, label, icon }) => (
                    <button
                        key={id}
                        onClick={() => { setActive(id); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition duration-300 border border-gray-100/10 
              ${active === id ? 'bg-white text-black' : 'hover:bg-white/10'}`}
                    >
                        <FontAwesomeIcon icon={icon} className="w-5 h-5" />
                        <span>{label}</span>
                    </button>
                ))}
                <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                >
                    <FontAwesomeIcon icon={faRightFromBracket} className="w-5 h-5" />
                    <span className="ml-3">Logout</span>
                </button>
            </nav>
        </aside>
    );

    return (
        <div className="h-screen overflow-hidden bg-black text-white flex">
            {/* Mobile Toggle Button */}
            <div className="md:hidden flex w-full bg-black h-[50px] fixed top-0 z-10 shadow shadow-white shadow-bottom-md">
                <button onClick={() => setSidebarOpen(true)} className="p-2 ml-2">
                    <FontAwesomeIcon icon={faBars} className="text-2xl text-white pt-1" />
                </button>
            </div>

            {/* Sidebar */}
            <div className="hidden md:block h-full">{Sidebar}</div>
            <div
                className={`fixed inset-0 z-40 md:hidden transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex`}
            >
                <div className="w-80 bg-black text-white p-6 space-y-6">{Sidebar}</div>
                <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
            </div>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto p-6 max-md:mt-[50px] mb-6 h-full">
                {active === 'overview' && (
                    <AdminDashboardStats/>
                )}

                {active === 'users' && (
                    <section>
                        <h2 className="text-2xl font-bold mb-4">All Users</h2>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/10">
                                    <th className="p-2">ID</th>
                                    <th className="p-2">Name</th>
                                    <th className="p-2">Email</th>
                                    <th className="p-2">Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id} className="border-b border-white/10">
                                        <td className="p-2">{u.id}</td>
                                        <td className="p-2">{u.name}</td>
                                        <td className="p-2">{u.email}</td>
                                        <td className="p-2">{new Date(u.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}

                {active === 'bookings' && (
                    <section>
                        <h2 className="text-2xl font-bold mb-4">All Bookings</h2>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/10">
                                    <th className="p-2">ID</th>
                                    <th className="p-2">User</th>
                                    <th className="p-2">Apartment</th>
                                    <th className="p-2">Dates</th>
                                    <th className="p-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((b) => (
                                    <tr key={b.id} className="border-b border-white/10">
                                        <td className="p-2">{b.id}</td>
                                        <td className="p-2">{b.user_name}</td>
                                        <td className="p-2">{b.apartment_title}</td>
                                        <td className="p-2">{b.start_date} → {b.end_date}</td>
                                        <td className="p-2">{b.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}

                {active === 'payments' && (
                    <section>
                        <h2 className="text-2xl font-bold mb-4">All Payments</h2>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/10">
                                    <th className="p-2">ID</th>
                                    <th className="p-2">User</th>
                                    <th className="p-2">Booking</th>
                                    <th className="p-2">Amount</th>
                                    <th className="p-2">Status</th>
                                    <th className="p-2">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((p) => (
                                    <tr key={p.id} className="border-b border-white/10">
                                        <td className="p-2">{p.id}</td>
                                        <td className="p-2">{p.user_name}</td>
                                        <td className="p-2">{p.booking_id}</td>
                                        <td className="p-2">₹{p.amount}</td>
                                        <td className="p-2">{p.status}</td>
                                        <td className="p-2">{new Date(p.paid_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}
            </main>
        </div>
    );
}
