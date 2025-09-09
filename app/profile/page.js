'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHome, faCreditCard, faGears, faCalendar, faBars, faXmark, faRightFromBracket,
    faBuilding, faLocationDot, faCalendarDays, faClock, faIndianRupeeSign
} from '@fortawesome/free-solid-svg-icons';
import EditProfileForm from '@/components/EditProfile';
import Link from 'next/link';
import BookingSection from '@/components/bookingsSection';
import PaymentsSection from '@/components/paymentBlock';
import TimeAgo from '@/components/TimeAgo';

const navItems = [
    { id: 'overview', label: 'Overview', icon: faHome },
    { id: 'bookings', label: 'Bookings', icon: faCalendar },
    { id: 'payments', label: 'Payments', icon: faCreditCard },
    { id: 'settings', label: 'Settings', icon: faGears },
];

export default function ProfileDashboard() {
    const [active, setActive] = useState('overview');
    const [profile, setProfile] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();
    const [bookings, setBookings] = useState([]);

    const fetchProfile = useCallback(async () => {
        try {
            // ✅ No Authorization header needed; cookie is sent automatically
            const res = await fetch('/api/profile', { cache: 'no-store' });
            if (!res.ok) {
                router.push('/signin'); // redirect if unauthorized
                return;
            }

            const data = await res.json();
            if (data.user) {
                setProfile(data);
                setBookings(data.bookings || []);
            } else {
                router.push('/signin');
            }
        } catch (err) {
            console.error('Profile fetch error:', err);
            router.push('/signin');
        }
    }, [router]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    if (!profile) return <div className="h-screen flex items-center justify-center text-gray-500">Loading...</div>;

    const { user, activity } = profile;

    function getDaysUntil(dateStr) {
        const today = new Date();
        const target = new Date(dateStr);
        const diffTime = target.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const handleLogout = async () => {
        try {
            // Call logout API to clear cookie
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (err) {
            console.error(err);
        } finally {
            router.push('/signin');
        }
    };

    const Sidebar = (
        <aside className="w-80 p-6 space-y-6 text-white bg-white/10 backdrop-blur-md h-full">
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
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition duration-300 border border-gray-100/10 ${active === id ? 'bg-white text-black' : 'hover:bg-white/10'
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
                <button className='w-full flex items-center gap-3 px-4 py-2 rounded-lg border border-gray-100/10 hover:bg-white/10'
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
                            You are logged in as <span className="font-bold text-white">{user.name}</span>.
                        </p>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-6 max-sm:gap-3">
                            {[
                                {
                                    title: 'Total Bookings',
                                    value: bookings.length,
                                },
                                {
                                    title: 'Upcoming Bookings',
                                    value: bookings.filter(b => new Date(b.start_date) > new Date()).length,
                                },
                                {
                                    title: 'Last Booking',
                                    value:
                                        bookings.length > 0
                                            ? new Date(bookings[0].created_at).toLocaleDateString()
                                            : 'N/A',
                                },
                                {
                                    title: 'Member Since',
                                    value: new Date(user.created_at).toLocaleDateString(),
                                },
                            ].map((card, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-100/5 border border-white/10 p-5 rounded-xl shadow hover:shadow-lg transition-all
                 flex-grow sm:basis-[23%] md:basis-[31%] lg:basis-[23%] xl:basis-[23%]"
                                >
                                    <p className="max-sm:text-sm text-lg text-center text-gray-300">{card.title}</p>
                                    <p className="max-sm:text-lg text-2xl text-center font-bold text-white capitalize">{card.value}</p>
                                </div>
                            ))}
                        </div>



                        {bookings.filter(b => b.status === 'confirmed' && getDaysUntil(b.start_date) > 0 && getDaysUntil(b.start_date) <= 5).length > 0 && (
                            <div className="mt-10">
                                <h2 className="text-xl font-bold mb-4 text-white">⏳ Upcoming Check-ins (Next 5 Days)</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    {bookings
                                        .filter(b => b.status === 'confirmed' && getDaysUntil(b.start_date) > 0 && getDaysUntil(b.start_date) <= 5)
                                        .slice(0, 3)
                                        .map(b => (
                                            <div key={b.id} className="bg-white/10 p-4 rounded-xl shadow hover:shadow-lg">
                                                <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faBuilding} className="text-blue-300" />
                                                    {b.apartment_title}
                                                </h3>
                                                <p className="text-blue-300 text-sm mb-1 flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faLocationDot} />
                                                    {b.apartment_location}
                                                </p>
                                                <p className="text-gray-300 text-sm mb-1 flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faCalendarDays} />
                                                    {b.start_date} → {b.end_date}
                                                </p>
                                                <p className="text-yellow-400 text-sm mb-1 flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faClock} />
                                                    {getDaysUntil(b.start_date)} day(s) until check-in
                                                </p>
                                                <p className="text-sm text-white flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faIndianRupeeSign} />
                                                    {b.amount} • via <strong>{b.method}</strong>
                                                </p>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="mt-10">
                            <h2 className="text-xl font-bold mb-4 text-white">Quick Actions</h2>
                            <div className="flex flex-wrap gap-4">
                                <Link href={'/#pricing'} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl">
                                    Book Apartment
                                </Link>
                                <Link href={'#booking'} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl">
                                    View Booking History
                                </Link>
                                <Link href={''} className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-xl">
                                    Edit Profile
                                </Link>
                            </div>
                        </div>

                        {/* Welcome Card */}
                        <div className="bg-gray-100/5 border border-white/10 p-6 rounded-xl shadow mt-10">
                            <h3 className="text-xl font-semibold mb-2 text-white">Welcome, {user.name.split(' ')[0]} 👋</h3>
                            <p className="text-gray-300 text-sm">
                                Here is what you can do next:
                            </p>
                            <ul className="list-disc list-inside text-gray-400 text-sm mt-2">
                                <li>Check your upcoming apartment bookings</li>
                                <li>Update your profile & secure your account</li>
                                <li>Download invoices or receipts</li>
                            </ul>
                        </div>

                        {/* Recent Activity */}
                        {activity && activity.length > 0 && (
                            <div className="mt-10 mb-10">
                                <h2 className="text-xl font-bold mb-4 text-white">Recent Activity</h2>
                                <div className="space-y-2">
                                    {activity.map((item, i) => (
                                        <div key={i} className="bg-gray-100/5 border border-white/10 p-3 rounded-lg text-sm text-gray-200">
                                            {item.message} —{' '}
                                            <span className="text-gray-400">
                                                <TimeAgo datetime={item.date} />
                                            </span>
                                        </div>
                                    ))}

                                </div>
                            </div>
                        )}

                        {/* Empty state message if no bookings */}
                        {bookings.length === 0 && (
                            <div className="mt-6 text-center text-gray-400">
                                You havenot made any bookings yet.{' '}
                                <a href="/apartments" className="text-blue-500 underline">
                                    Browse now
                                </a>
                            </div>
                        )}
                    </section>
                )}

                {active === 'bookings' && (
                    <BookingSection bookings={bookings} setBookings={setBookings} />
                )}

                {active === 'payments' && (
                    <PaymentsSection />
                )}

                {active === 'settings' && (
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
                        <EditProfileForm currentUser={user} onUpdate={fetchProfile} />
                    </section>
                )}
            </main>
        </div>
    );
}
