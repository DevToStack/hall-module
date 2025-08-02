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
        <div className="min-h-screen bg-black text-white flex">
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
            <div className="hidden md:block">{Sidebar}</div>

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
            <main className="flex-1 p-6 overflow-y-auto max-md:mt-[50px]">
                {active === 'overview' && (
                    <section>
                        <h1 className="text-3xl font-bold mb-4">Dashboard Overview</h1>
                        <p className="text-gray-300 mb-6 text-lg">
                            You're logged in as <span className="font-bold text-white">{user.name}</span>.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            <div className="bg-white/10 p-4 rounded-xl shadow hover:shadow-lg">
                                <p className="text-lg">Total Bookings</p>
                                <p className="text-3xl font-bold text-white">{bookings.length}</p>
                            </div>
                            <div className="bg-white/10 p-4 rounded-xl shadow hover:shadow-lg">
                                <p className="text-lg">Role</p>
                                <p className="text-2xl font-semibold capitalize text-white">{user.role}</p>
                            </div>
                            <div className="bg-white/10 p-4 rounded-xl shadow hover:shadow-lg">
                                <p className="text-lg">Member Since</p>
                                <p className="text-md text-white">{new Date(user.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </section>
                )}

                {active === 'bookings' && (
                    <section>
                        <h2 className="text-2xl font-bold mb-6">Your Bookings</h2>
                        {bookings.length === 0 ? (
                            <p className="text-gray-400">No bookings found.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bookings.map((b) => (
                                    <div
                                        key={b.id}
                                        className="bg-white/10 p-5 rounded-xl border border-white/20 shadow hover:shadow-md transition duration-300"
                                    >
                                        <h3 className="text-xl font-semibold mb-2">{b.apartment_title}</h3>
                                        <p className="text-sm text-gray-300">📍 {b.apartment_location}</p>
                                        <p className="text-sm text-gray-300">
                                            📅 {b.start_date} to {b.end_date}
                                        </p>
                                        <p className="text-sm text-gray-300 mt-1">
                                            Status: <span className="font-semibold text-white">{b.status}</span>
                                        </p>
                                        <p className="text-sm text-gray-300 mt-1">
                                            💳 ₹{b.amount} — <span className="font-semibold text-white">{b.payment_status}</span> via {b.method}
                                        </p>
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
