// app/admin/dashboard/page.jsx
'use client';
import BookingsManagement from '@/components/admin/BookingsManagement';
import AdminDashboardStats from '@/components/adminDashboard';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHome, faUsers, faCalendar, faCreditCard, faChartLine,
    faBars, faXmark, faRightFromBracket, faBuilding
} from '@fortawesome/free-solid-svg-icons';

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
    const [editingApartment, setEditingApartment] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        price_per_night: '',
        image_url: '',
        available: true
    });
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = editingApartment ? '/api/admin/apartments' : '/api/admin/apartments';
            const method = editingApartment ? 'PUT' : 'POST';

            const payload = editingApartment
                ? { ...formData, id: editingApartment.id }
                : formData;

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setShowForm(false);
                setEditingApartment(null);
                setFormData({
                    title: '',
                    description: '',
                    location: '',
                    price_per_night: '',
                    image_url: '',
                    available: true
                });
                fetchApartments();
            } else {
                alert('Failed to save apartment');
            }
        } catch (err) {
            console.error('Error saving apartment:', err);
            alert('Error saving apartment');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (apartment) => {
        setEditingApartment(apartment);
        setFormData({
            title: apartment.title,
            description: apartment.description,
            location: apartment.location,
            price_per_night: apartment.price_per_night,
            image_url: apartment.image_url,
            available: apartment.available
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this apartment?')) return;

        try {
            const res = await fetch(`/api/admin/apartments?id=${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (res.ok) {
                fetchApartments();
            } else {
                alert('Failed to delete apartment');
            }
        } catch (err) {
            console.error('Error deleting apartment:', err);
            alert('Error deleting apartment');
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingApartment(null);
        setFormData({
            title: '',
            description: '',
            location: '',
            price_per_night: '',
            image_url: '',
            available: true
        });
    };

    if (!dashboardData) return <div className="h-screen flex items-center justify-center">Loading...</div>;

    const { users, bookings, payments } = dashboardData;

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
            <main className="flex-1 overflow-y-auto max-md:mt-[50px] mb-[50px] h-full">
                {active === 'overview' && (
                    <AdminDashboardStats />
                )}

                {active === 'apartments' && (
                    <section className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Apartments Management</h2>
                            <button
                                onClick={() => setShowForm(true)}
                                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition duration-300"
                            >
                                + Add Apartment
                            </button>
                        </div>

                        {/* Apartment Form Modal */}
                        {showForm && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-bold">
                                            {editingApartment ? 'Edit Apartment' : 'Add New Apartment'}
                                        </h3>
                                        <button onClick={resetForm} className="text-gray-400 hover:text-white">
                                            <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <input
                                            type="text"
                                            placeholder="Title"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full p-2 bg-gray-800 rounded border border-gray-700"
                                            required
                                        />
                                        <textarea
                                            placeholder="Description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full p-2 bg-gray-800 rounded border border-gray-700 h-24"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Location"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full p-2 bg-gray-800 rounded border border-gray-700"
                                            required
                                        />
                                        <input
                                            type="number"
                                            placeholder="Price per night"
                                            value={formData.price_per_night}
                                            onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                                            className="w-full p-2 bg-gray-800 rounded border border-gray-700"
                                            required
                                        />
                                        <input
                                            type="url"
                                            placeholder="Image URL"
                                            value={formData.image_url}
                                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                            className="w-full p-2 bg-gray-800 rounded border border-gray-700"
                                            required
                                        />
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.available}
                                                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                                                className="rounded"
                                            />
                                            <span>Available</span>
                                        </label>
                                        <div className="flex space-x-2">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded disabled:opacity-50"
                                            >
                                                {loading ? 'Saving...' : (editingApartment ? 'Update' : 'Create')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={resetForm}
                                                className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Apartments Table */}
                        {loading ? (
                            <div className="text-center py-8">Loading apartments...</div>
                        ) : (
                            <div className="bg-white/5 rounded-lg overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/10">
                                            <th className="p-4">ID</th>
                                            <th className="p-4">Title</th>
                                            <th className="p-4">Location</th>
                                            <th className="p-4">Price/Night</th>
                                            <th className="p-4">Available</th>
                                            <th className="p-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {apartments.map((apartment) => (
                                            <tr key={apartment.id} className="border-b border-white/10 hover:bg-white/5">
                                                <td className="p-4">{apartment.id}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center space-x-3">
                                                        <img
                                                            src={apartment.image_url}
                                                            alt={apartment.title}
                                                            className="w-10 h-10 rounded object-cover"
                                                        />
                                                        <div>
                                                            <div className="font-medium">{apartment.title}</div>
                                                            <div className="text-sm text-gray-400 truncate max-w-xs">
                                                                {apartment.description}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">{apartment.location}</td>
                                                <td className="p-4">₹{apartment.price_per_night}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs ${apartment.available
                                                            ? 'bg-green-600 text-green-100'
                                                            : 'bg-red-600 text-red-100'
                                                        }`}>
                                                        {apartment.available ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleEdit(apartment)}
                                                            className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(apartment.id)}
                                                            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {apartments.length === 0 && (
                                    <div className="text-center py-8 text-gray-400">
                                        No apartments found. Create your first apartment!
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                )}

                {active === 'users' && (
                    <section className="p-6">
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
                    <BookingsManagement />
                )}

                {active === 'payments' && (
                    <section className="p-6">
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