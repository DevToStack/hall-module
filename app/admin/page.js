'use client';
import BookingsManagement from '@/components/admin/BookingsManagement';
import AdminDashboardStats from '@/components/adminDashboard';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHome, faUsers, faCalendar, faCreditCard,
    faBars, faXmark, faRightFromBracket, faBuilding,
    faChevronDown, faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import UsersTable from '@/components/admin/UsersTable';
import ApartmentsManager from '@/components/admin/ApartmentManagement';

const navItems = [
    { id: 'overview', label: 'Overview', icon: faHome },
    { id: 'apartments', label: 'Apartments', icon: faBuilding },
    { id: 'users', label: 'Users', icon: faUsers },
    { id: 'bookings', label: 'Bookings', icon: faCalendar },
    { id: 'payments', label: 'Payments', icon: faCreditCard },
];

export default function AdminDashboard() {
    const [active, setActive] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
    const router = useRouter();

    // Handle scroll for navbar shadow
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close sidebar when route changes
    useEffect(() => {
        setSidebarOpen(false);
        setMobileDropdownOpen(false);
    }, [active]);

    // Close sidebar on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setSidebarOpen(false);
                setMobileDropdownOpen(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

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

    const fetchApartments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/apartments', {
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                setApartments(data.apartments || []);
            }
        } catch (err) {
            console.error('Failed to fetch apartments:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
        if (active === 'apartments') {
            fetchApartments();
        }
    }, [fetchDashboardData, active, fetchApartments]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            router.push('/signin');
        }
    };

    const getActiveLabel = () => {
        return navItems.find(item => item.id === active)?.label || 'Dashboard';
    };

    if (!dashboardData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    const { users, bookings, payments } = dashboardData;

    const Sidebar = (
        <aside className="w-80 b bg-neutral-900 border-r border-gray-700 h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            Admin Panel
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">Management Dashboard</p>
                    </div>
                    <button
                        className="md:hidden text-gray-400 hover:text-white transition-colors p-2"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map(({ id, label, icon }) => (
                    <button
                        key={id}
                        onClick={() => setActive(id)}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${active === id
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`}
                    >
                        <FontAwesomeIcon
                            icon={icon}
                            className={`w-5 h-5 transition-transform duration-200 ${active === id ? 'scale-110' : 'group-hover:scale-105'
                                }`}
                        />
                        <span className="font-medium">{label}</span>
                    </button>
                ))}
            </nav>

            {/* Logout Section */}
            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 transition-all duration-200 border border-red-600/30 hover:border-red-600/50"
                >
                    <FontAwesomeIcon icon={faRightFromBracket} className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );

    const MobileNavbar = (
        <nav className={`fixed md:hidden top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? ' bg-neutral-900' : 'bg-gray-900'
            }`}>
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-gray-300 hover:text-white transition-colors"
                    >
                        <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
                    </button>

                    {/* Mobile dropdown for quick navigation */}
                    <div className="relative">
                        <button
                            onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                            className="flex items-center gap-2 px-3 py-2 text-white border border-white/10 bg-neutral-900 rounded-lg hover: bg-neutral-700 transition-colors"
                        >
                            <span className="font-medium">{getActiveLabel()}</span>
                            <FontAwesomeIcon
                                icon={mobileDropdownOpen ? faChevronUp : faChevronDown}
                                className="w-3 h-3"
                            />
                        </button>

                        {mobileDropdownOpen && (
                            <div className="absolute top-full left-0 mt-2 w-48  bg-neutral-900 border border-white/10 rounded-lg shadow-xl z-50">
                                {navItems.map(({ id, label, icon }) => (
                                    <button
                                        key={id}
                                        onClick={() => {
                                            setActive(id);
                                            setMobileDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${active === id
                                            ? ' bg-neutral-800 text-white'
                                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                            } first:rounded-t-lg last:rounded-b-lg`}
                                    >
                                        <FontAwesomeIcon icon={icon} className="w-4 h-4" />
                                        <span>{label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400 hidden xs:inline">
                        Welcome, Admin
                    </span>
                </div>
            </div>
        </nav>
    );

    return (
        <div className="min-h-screen  bg-neutral-900 text-white">
            {/* Mobile Navbar */}
            {MobileNavbar}

            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                {Sidebar}
            </div>

            {/* Main Content */}
            <div className="md:ml-80 transition-all duration-300">
                {/* Desktop Header */}
                <header className="hidden md:block p-6 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white">{getActiveLabel()}</h1>
                            <p className="text-gray-400 mt-1">
                                Manage your {getActiveLabel().toLowerCase()} and monitor activities
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-300">Welcome back, Admin</span>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="min-h-screen">
                    <div className="max-w-7xl mx-auto">
                        {active === 'overview' && <AdminDashboardStats />}
                        {active === 'apartments' && (
                            <ApartmentsManager
                                apartments={apartments}
                                loading={loading}
                                onRefresh={fetchApartments}
                            />
                        )}
                        {active === 'users' && <UsersTable />}
                        {active === 'bookings' && <BookingsManagement />}
                        {active === 'payments' && (
                            <section className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold">Payment History</h2>
                                    <span className="text-gray-400">
                                        {payments.length} total payments
                                    </span>
                                </div>
                                <div className="overflow-x-auto rounded-lg border border-gray-700">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-700/50">
                                                <th className="p-4 text-left font-semibold">ID</th>
                                                <th className="p-4 text-left font-semibold">User</th>
                                                <th className="p-4 text-left font-semibold">Booking</th>
                                                <th className="p-4 text-left font-semibold">Amount</th>
                                                <th className="p-4 text-left font-semibold">Status</th>
                                                <th className="p-4 text-left font-semibold">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-700">
                                            {payments.map((p) => (
                                                <tr key={p.id} className="hover:bg-gray-700/30 transition-colors">
                                                    <td className="p-4">{p.id}</td>
                                                    <td className="p-4">{p.user_name}</td>
                                                    <td className="p-4">#{p.booking_id}</td>
                                                    <td className="p-4 font-semibold">₹{p.amount}</td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${p.status === 'completed'
                                                                ? 'bg-green-500/20 text-green-400'
                                                                : p.status === 'pending'
                                                                    ? 'bg-yellow-500/20 text-yellow-400'
                                                                    : 'bg-red-500/20 text-red-400'
                                                            }`}>
                                                            {p.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-gray-400">
                                                        {new Date(p.paid_at).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}
                    </div>
                </main>
            </div>

            {/* Close dropdown when clicking outside */}
            {mobileDropdownOpen && (
                <div
                    className="fixed inset-0 z-40 min-md:hidden"
                    onClick={() => setMobileDropdownOpen(false)}
                />
            )}
        </div>
    );
}