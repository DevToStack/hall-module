'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHome,
    faCreditCard,
    faGears,
    faTrash,
    faCalendar,
    faBars,
    faXmark,
    faDoorOpen,
    faRightFromBracket
    
} from '@fortawesome/free-solid-svg-icons';
import EditProfileForm from '@/components/EditProfile';

const navItems = [
    { id: 'overview', label: 'Overview', icon: faHome },
    { id: 'bookings', label: 'Bookings', icon: faCalendar },
    { id: 'payments', label: 'Payments', icon: faCreditCard },
    { id: 'settings', label: 'Settings', icon: faGears },
    { id: 'danger', label: 'Danger Zone', icon: faTrash },
];

export default function ProfileDashboard() {
    const [active, setActive] = useState('overview');
    const [profile, setProfile] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();
    const devices = [];
    const activity = [
        { message: "Logged in from Chrome", date: "2025-08-01T12:00:00Z" },
        { message: "Booked Apartment A101", date: "2025-08-02T15:45:00Z" },
      ];
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return router.push('/signin');

        fetch('/api/profile', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                if (data.user) setProfile(data);
                else router.push('/signin');
            });
    }, [router]);

    if (!profile) return <div className="h-screen flex items-center justify-center text-gray-500">Loading...</div>;

    const { user, bookings } = profile;

    const Sidebar = (
        <aside className="w-80 p-6 space-y-6 bg-white/10 text-white backdrop-blur-md h-full">
            <div className="flex items-center justify-between md:block">
                <h2 className="text-2xl font-bold tracking-wide">Welcome</h2>
                <button
                    className="md:hidden text-white"
                    onClick={() => setSidebarOpen(false)}
                >
                    <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                </button>
            </div>
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-xl font-bold">
                    {user.name.charAt(0)}
                </div>
                <div>
                    <p className="text-lg font-semibold">{user.name}</p>
                    <p className="text-sm text-gray-300 break-all">{user.email}</p>
                </div>
            </div>

            <nav className="pt-6 space-y-3">
                {navItems.map(({ id, label, icon }) => (
                    <button
                        key={id}
                        onClick={() => {
                            setActive(id);
                            setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition duration-300 ${active === id ? 'bg-white text-black' : 'hover:bg-white/10'
                            }`}
                    >
                        <FontAwesomeIcon icon={icon} className="w-5 h-5" />
                        <span>{label}</span>
                    </button>
                ))}
                
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        router.push('/signin');
                    }}
                    className="w-full text-left px-4 py-2 mt-6 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                >
                    <FontAwesomeIcon icon={faRightFromBracket} className="w-5 h-5" />
                    <span className='ml-3'>Logout</span>
                </button>
                <h3 className='mt-3 font-bold'>Quick Links</h3>
                <button className='w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10'
                    onClick={() => {
                        router.push('/');
                    }}>
                    <FontAwesomeIcon icon={faHome} className="w-5 h-5" />
                    <span className=''>Home</span>
                </button>
            </nav>
        </aside>
    );

    return (
        <div className="h-screen overflow-hidden bg-black text-white flex">
            {/* Mobile Toggle Button */}
            <div className='md:hidden flex w-full bg-black h-[50px] fixed top-0 z-10  shadow shadow-white shadow-bottom-md'>
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 ml-2"
                >
                    <FontAwesomeIcon icon={faBars} className="text-2xl text-center text-white pt-1" />
                </button>
            </div>
            
            {/* Desktop Sidebar */}
            <div className="hidden md:block h-full">{Sidebar}</div>
            {/* Mobile Sidebar (Slide-in) */}
            <div
                className={`fixed inset-0 z-40 md:hidden transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } flex`}
            >
                {/* Sidebar Panel */}
                <div className="w-80 bg-black text-white p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Dashboard</h2>
                        <button onClick={() => setSidebarOpen(false)}>
                            <FontAwesomeIcon icon={faXmark} className="text-2xl" />
                        </button>
                    </div>
                    <nav className="pt-4 space-y-3">
                        {navItems.map(({ id, label, icon }) => (
                            <button
                                key={id}
                                onClick={() => {
                                    setActive(id);
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition duration-300 ${active === id ? 'bg-white text-black' : 'hover:bg-white/10'
                                    }`}
                            >
                                <FontAwesomeIcon icon={icon} className="w-5 h-5" />
                                <span>{label}</span>
                            </button>
                        ))}
                        <button
                            onClick={() => {
                                localStorage.removeItem('token');
                                router.push('/signin');
                            }}
                            className="w-full text-left px-4 py-2 mt-6 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                        >
                            <FontAwesomeIcon icon={faRightFromBracket} className="w-5 h-5" />
                            <span className='ml-3'>Logout</span>
                        </button>
                        <h3 className='mt-3 font-bold'>Quick Links</h3>
                        <button className='w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10'
                            onClick={() => {
                                router.push('/');
                            }}>
                            <FontAwesomeIcon icon={faHome} className="w-5 h-5" />
                            <span className=''>Home</span>
                        </button>
                    </nav>
                </div>

                {/* Overlay */}
                <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
            </div>
            {/* Main content */}
            <main className="flex-1 overflow-y-auto p-6 max-md:mt-[50px] h-full">
                {active === 'overview' && (
                    <section>
                        <h1 className="text-3xl font-bold mb-4">Dashboard Overview</h1>
                        <p className="text-gray-300 mb-6 text-lg">
                            You're logged in as <span className="font-bold text-white">{user.name}</span>.
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            <div className="bg-white/10 p-4 rounded-xl shadow hover:shadow-lg">
                                <p className="text-lg">Total Bookings</p>
                                <p className="text-3xl font-bold text-white">{bookings.length}</p>
                            </div>
                            <div className="bg-white/10 p-4 rounded-xl shadow hover:shadow-lg">
                                <p className="text-lg">Upcoming Bookings</p>
                                <p className="text-2xl font-semibold text-white">
                                    {bookings.filter(b => new Date(b.check_in) > new Date()).length}
                                </p>
                            </div>
                            <div className="bg-white/10 p-4 rounded-xl shadow hover:shadow-lg">
                                <p className="text-lg">Last Booking</p>
                                <p className="text-md text-white">
                                    {bookings.length > 0
                                        ? new Date(bookings[bookings.length - 1].created_at).toLocaleDateString()
                                        : 'N/A'}
                                </p>
                            </div>
                            <div className="bg-white/10 p-4 rounded-xl shadow hover:shadow-lg">
                                <p className="text-lg">Devices Logged In</p>
                                <p className="text-2xl font-semibold text-white">{devices?.length || 1}</p>
                            </div>
                            <div className="bg-white/10 p-4 rounded-xl shadow hover:shadow-lg">
                                <p className="text-lg">Role</p>
                                <p className="text-2xl font-semibold capitalize text-white">{user.role}</p>
                            </div>
                            <div className="bg-white/10 p-4 rounded-xl shadow hover:shadow-lg">
                                <p className="text-lg">Member Since</p>
                                <p className="text-md text-white">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="mt-10">
                            <h2 className="text-xl font-bold mb-4 text-white">Quick Actions</h2>
                            <div className="flex flex-wrap gap-4">
                                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl">
                                    Book Apartment
                                </button>
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl">
                                    View Booking History
                                </button>
                                <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-xl">
                                    Edit Profile
                                </button>
                            </div>
                        </div>

                        {/* Welcome Card */}
                        <div className="bg-white/10 p-6 rounded-xl shadow mt-10">
                            <h3 className="text-xl font-semibold mb-2 text-white">Welcome, {user.name.split(' ')[0]} 👋</h3>
                            <p className="text-gray-300 text-sm">
                                Here’s what you can do next:
                            </p>
                            <ul className="list-disc list-inside text-gray-400 text-sm mt-2">
                                <li>Check your upcoming apartment bookings</li>
                                <li>Update your profile & secure your account</li>
                                <li>Download invoices or receipts</li>
                            </ul>
                        </div>

                        {/* Recent Activity */}
                        {activity && activity.length > 0 && (
                            <div className="mt-10">
                                <h2 className="text-xl font-bold mb-4 text-white">Recent Activity</h2>
                                <div className="space-y-2">
                                    {activity.map((item, i) => (
                                        <div key={i} className="bg-white/10 p-3 rounded-lg text-sm text-gray-200">
                                            {item.message} —{' '}
                                            <span className="text-gray-400">
                                                {new Date(item.date).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Empty state message if no bookings */}
                        {bookings.length === 0 && (
                            <div className="mt-6 text-center text-gray-400">
                                You haven't made any bookings yet.{' '}
                                <a href="/apartments" className="text-blue-500 underline">
                                    Browse now
                                </a>
                            </div>
                        )}
                    </section>
                )}


                {active === 'bookings' && (
                    <section className="pb-16">
                        <h2 className="text-3xl font-extrabold mb-8 text-white">Your Apartment Bookings</h2>

                        {bookings.length === 0 ? (
                            <div className="text-center text-gray-400">
                                <img
                                    src="/no-bookings.svg"
                                    alt="No bookings"
                                    className="mx-auto w-48 opacity-40 mb-4"
                                />
                                <p className="text-lg">You haven’t made any bookings yet.</p>
                                <p className="text-sm">Start exploring apartments to find your next stay!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                                {bookings.map((b) => (
                                    <div
                                        key={b.id}
                                        className="relative group bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-2xl border border-white/20 backdrop-blur-md shadow-xl hover:scale-[1.015] transition-transform duration-300"
                                    >
                                        {/* Badge */}
                                        <div className="absolute top-4 right-4 px-3 py-1 text-sm font-medium rounded-full bg-blue-600 text-white shadow">
                                            {b.status === 'confirmed' ? '✅ Confirmed' : '⏳ Pending'}
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-2xl font-bold text-white mb-2">
                                            🏢 {b.apartment_title}
                                        </h3>

                                        {/* Location */}
                                        <p className="text-sm text-blue-200 mb-2">📍 {b.apartment_location}</p>

                                        {/* Dates */}
                                        <div className="flex items-center text-sm text-gray-300 mb-2">
                                            📅 <span className="ml-1">{b.start_date} → {b.end_date}</span>
                                        </div>

                                        {/* Amount & Payment */}
                                        <div className="mt-4 text-sm text-gray-300">
                                            <p>💳 ₹{b.amount}</p>
                                            <p>
                                                Payment: <span className="text-white font-semibold">{b.payment_status}</span> via <span className="font-semibold">{b.method}</span>
                                            </p>
                                        </div>

                                        {/* Optional Footer */}
                                        <div className="mt-4">
                                            <button className="px-4 py-1 mt-2 text-sm rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all">
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {active === 'payments' && (
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Payments</h2>
                        <p className="text-gray-300">(This section is under construction...)</p>
                    </section>
                )}

                {active === 'settings' && (
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
                        <EditProfileForm currentUser={user} />
                    </section>
                )}


                {active === 'danger' && (
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-red-400">Danger Zone</h2>
                        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">
                            Delete My Account
                        </button>
                    </section>
                )}
            </main>
        </div>
    );
}
