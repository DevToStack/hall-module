'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHome, faUsers, faCalendar, faCreditCard,
    faBars, faRightFromBracket, faBuilding,
    faChevronDown, faChevronUp, faImages
} from '@fortawesome/free-solid-svg-icons';
import AdminDashboardStats from '@/components/adminDashboard';
import ApartmentsManager from '@/components/admin/ApartmentManagement';
import UsersTable from '@/components/admin/UsersTable';
import BookingsManagement from '@/components/admin/BookingsManagement';
import PaymentManagement from '@/components/admin/PaymentManagement';
import ApartmentGallery from '@/components/admin/GalleryManagement';

const navItems = [
    { id: 'overview', label: 'Overview', icon: faHome },
    { id: 'apartments', label: 'Apartments', icon: faBuilding },
    { id: 'users', label: 'Users', icon: faUsers },
    { id: 'bookings', label: 'Bookings', icon: faCalendar },
    { id: 'payments', label: 'Payments', icon: faCreditCard },
    { id: 'gallery', label: 'Gallery', icon: faImages },
];

export default function AdminDashboard() {
    const [active, setActive] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Handle scroll for header shadow
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Auto-collapse sidebar on resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setSidebarCollapsed(true);
                setSidebarOpen(false);
            } else {
                setSidebarCollapsed(false);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch Apartments (used only when active === apartments)
    const fetchApartments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/apartments', { credentials: 'include' });
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
        if (active === 'apartments') fetchApartments();
    }, [active, fetchApartments]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            router.push('/signin');
        }
    };

    const getActiveLabel = () =>
        navItems.find((item) => item.id === active)?.label || 'Dashboard';

    /** ───────────────────────── Sidebar ───────────────────────── */
    const Sidebar = (
        <aside
            className={`bg-neutral-900 border-r border-gray-700 h-full flex flex-col transition-all duration-200 ${sidebarCollapsed ? 'w-16' : 'w-72'
                }`}
        >
            <div className="p-4 flex items-center justify-between border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-neutral-800 text-white flex items-center justify-center font-bold rounded-md">
                        R4
                    </div>
                    {!sidebarCollapsed && (
                        <div>
                            <h2 className="text-lg font-semibold text-white">Rooms4u</h2>
                            <p className="text-xs text-gray-400">Admin Panel</p>
                        </div>
                    )}
                </div>
                {!sidebarCollapsed && (
                    <button
                        onClick={() => setSidebarCollapsed(true)}
                        className="text-gray-300 hover:text-white"
                    >
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                )}
            </div>

            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                {navItems.map(({ id, label, icon }) => (
                    <button
                        key={id}
                        onClick={() => setActive(id)}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${active === id
                                ? 'bg-neutral-800 text-white shadow-sm'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            } ${sidebarCollapsed ? 'justify-center' : ''}`}
                        title={sidebarCollapsed ? label : ''}
                    >
                        <FontAwesomeIcon icon={icon} className="w-4 h-4" />
                        {!sidebarCollapsed && <span className="text-sm">{label}</span>}
                    </button>
                ))}
            </nav>

            <div className="p-2 border-t border-gray-700">
                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg bg-red-700/10 hover:bg-red-700/20 text-red-300 hover:text-red-200 transition-all border border-red-700/20 ${sidebarCollapsed ? 'justify-center' : ''
                        }`}
                    title={sidebarCollapsed ? 'Logout' : ''}
                >
                    <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
                    {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
                </button>
            </div>
        </aside>
    );

    /** ───────────────────────── Mobile Navbar ───────────────────────── */
    const MobileNavbar = (
        <nav
            className={`fixed md:hidden top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-neutral-800' : 'bg-neutral-900'
                }`}
        >
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-300 hover:text-white"
                    >
                        <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                            className="flex items-center gap-2 px-3 py-2 text-white border border-white/10 rounded-lg bg-neutral-700 hover:bg-neutral-600 transition-colors"
                        >
                            <span className="font-medium">{getActiveLabel()}</span>
                            <FontAwesomeIcon
                                icon={mobileDropdownOpen ? faChevronUp : faChevronDown}
                                className="w-3 h-3"
                            />
                        </button>
                        {mobileDropdownOpen && (
                            <div className="absolute top-full left-0 mt-2 w-48 bg-neutral-900 border border-white/10 rounded-lg shadow-xl">
                                {navItems.map(({ id, label, icon }) => (
                                    <button
                                        key={id}
                                        onClick={() => {
                                            setActive(id);
                                            setMobileDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-left ${active === id
                                                ? 'bg-neutral-800 text-white'
                                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                            }`}
                                    >
                                        <FontAwesomeIcon icon={icon} className="w-4 h-4" />
                                        <span>{label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );

    /** ───────────────────────── Layout ───────────────────────── */
    return (
        <div className="bg-neutral-900 text-white">
            {MobileNavbar}

            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div
                className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:translate-x-0`}
            >
                {Sidebar}
            </div>

            <div
                className={`transition-all duration-200 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-72'
                    } max-md:pt-16`}
            >
                <header
                    className={`hidden md:flex items-center h-[96px] justify-between p-6 border-b border-gray-700 fixed top-0 left-0 right-0 z-30 bg-neutral-900 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-72'
                        }`}
                >
                    <div>
                        <h1 className="text-2xl font-bold">{getActiveLabel()}</h1>
                        <p className="text-gray-400 text-sm">
                            Manage your {getActiveLabel().toLowerCase()}
                        </p>
                    </div>
                    <span className="text-gray-300">Welcome, Admin</span>
                </header>

                <main
                    className="h-screen mt-[96px] p-4 sm:p-6 overflow-hidden"
                    style={{ maxHeight: 'calc(100vh - 96px)' }}
                >
                    <div className="mx-auto overflow-hidden">
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
                        {active === 'payments' && <PaymentManagement />}
                        {active === 'gallery' && <ApartmentGallery />}
                    </div>
                </main>
            </div>

            {mobileDropdownOpen && (
                <div
                    className="fixed inset-0 z-40 md:hidden"
                    onClick={() => setMobileDropdownOpen(false)}
                />
            )}
        </div>
    );
}
