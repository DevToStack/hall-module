import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSort, faXmark, faEdit, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';

// Initial form state
const initialFormState = {
    title: '',
    description: '',
    location: '',
    price_per_night: '',
    image_url: '',
    available: true,
};

const ApartmentsManager = ({ apartments, loading, onRefresh }) => {
    const [showForm, setShowForm] = useState(false);
    const [editingApartment, setEditingApartment] = useState(null);
    const [formData, setFormData] = useState(initialFormState);
    const [loadingAction, setLoadingAction] = useState(false);

    const [filters, setFilters] = useState({
        search: '',
        location: '',
        availability: 'all',
        minPrice: '',
        maxPrice: '',
    });
    const [sortBy, setSortBy] = useState('id');
    const [sortOrder, setSortOrder] = useState('asc');

    const filteredAndSortedApartments = useMemo(() => {
        let filtered = apartments.filter((apartment) => {
            const matchesSearch =
                apartment.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                apartment.description.toLowerCase().includes(filters.search.toLowerCase());
            const matchesLocation =
                !filters.location || apartment.location.toLowerCase().includes(filters.location.toLowerCase());
            const matchesAvailability =
                filters.availability === 'all' ||
                (filters.availability === 'available' && apartment.available) ||
                (filters.availability === 'unavailable' && !apartment.available);
            const matchesMinPrice = !filters.minPrice || apartment.price_per_night >= Number(filters.minPrice);
            const matchesMaxPrice = !filters.maxPrice || apartment.price_per_night <= Number(filters.maxPrice);

            return matchesSearch && matchesLocation && matchesAvailability && matchesMinPrice && matchesMaxPrice;
        });

        filtered.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            if (sortBy === 'price_per_night') {
                aValue = Number(aValue);
                bValue = Number(bValue);
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [apartments, filters, sortBy, sortOrder]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingAction(true);
        try {
            const method = editingApartment ? 'PUT' : 'POST';
            const response = await fetch('/api/admin/apartments', {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(editingApartment ? { ...formData, id: editingApartment.id } : formData),
            });
            if (response.ok) {
                resetForm();
                onRefresh();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save apartment');
            }
        } catch (error) {
            console.error('Error saving apartment:', error);
            alert(error.message || 'Error saving apartment. Please try again.');
        } finally {
            setLoadingAction(false);
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
            available: apartment.available,
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this apartment?')) return;
        setLoadingAction(true);
        try {
            const response = await fetch(`/api/admin/apartments?id=${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (response.ok) onRefresh();
            else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete apartment');
            }
        } catch (error) {
            console.error('Error deleting apartment:', error);
            alert(error.message || 'Error deleting apartment. Please try again.');
        } finally {
            setLoadingAction(false);
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingApartment(null);
        setFormData(initialFormState);
    };

    const handleSort = (field) => {
        if (sortBy === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const clearFilters = () => {
        setFilters({ search: '', location: '', availability: 'all', minPrice: '', maxPrice: '' });
    };

    const getImageUrl = (apartment) => apartment.image_url || '';

    return (
        <section className="p-6 pb-16 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <p className="text-neutral-400">
                        {filteredAndSortedApartments.length} of {apartments.length} apartments
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 px-4 py-2 rounded-lg flex items-center space-x-2 text-neutral-50 font-medium"
                    disabled={loadingAction}
                >
                    <FontAwesomeIcon icon={faPlus} />
                    <span className='text-xs sm:text-sm'>Add Apartment</span>
                </button>
            </div>

            {/* Filters Section */}
            <div className="bg-neutral-800 rounded-xl p-4 mb-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="relative">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search apartments..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full pl-10 p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                        />
                    </div>
                    <input
                        type="text"
                        placeholder="Filter by location..."
                        value={filters.location}
                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                        className="w-full p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                    />
                    <select
                        value={filters.availability}
                        onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                        className="w-full p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                    >
                        <option value="all">All Status</option>
                        <option value="available">Available</option>
                        <option value="unavailable">Unavailable</option>
                    </select>
                    <div className="flex space-x-2">
                        <input
                            type="number"
                            placeholder="Min price"
                            value={filters.minPrice}
                            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                            className="w-1/2 p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                        />
                        <input
                            type="number"
                            placeholder="Max price"
                            value={filters.maxPrice}
                            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                            className="w-1/2 p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <button className="text-neutral-400 hover:text-neutral-50 text-sm flex items-center space-x-1" onClick={clearFilters}>
                        <FontAwesomeIcon icon={faXmark} />
                        <span>Clear filters</span>
                    </button>
                </div>
            </div>

            {/* Apartments Table */}
            {loading ? (
                <div className="text-center py-8 text-neutral-400">Loading apartments...</div>
            ) : (
                <div className="bg-neutral-800 rounded-xl overflow-x-auto shadow-sm">
                    <table className="w-full text-left border-collapse text-neutral-50">
                        <thead className="bg-neutral-700">
                            <tr>
                                <th className="p-4 cursor-pointer" onClick={() => handleSort('id')}>
                                    ID
                                </th>
                                <th className="p-4">Apartment</th>
                                <th className="p-4 cursor-pointer" onClick={() => handleSort('location')}>
                                    Location
                                </th>
                                <th className="p-4 cursor-pointer" onClick={() => handleSort('price_per_night')}>
                                    Price/Night
                                </th>
                                <th className="p-4">Available</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedApartments.map((apartment) => (
                                <ApartmentRow
                                    key={apartment.id}
                                    apartment={apartment}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    loadingAction={loadingAction}
                                    getImageUrl={getImageUrl}
                                />
                            ))}
                        </tbody>
                    </table>
                    {filteredAndSortedApartments.length === 0 && (
                        <div className="text-center py-8 text-neutral-400">
                            {apartments.length === 0
                                ? 'No apartments found. Create your first apartment!'
                                : 'No apartments match your filters.'}
                        </div>
                    )}
                </div>
            )}

            {/* Apartment Form Modal */}
            {showForm && (
                <ApartmentForm
                    showForm={showForm}
                    editingApartment={editingApartment}
                    formData={formData}
                    setFormData={setFormData}
                    loading={loadingAction}
                    onSubmit={handleSubmit}
                    onCancel={resetForm}
                />
            )}
        </section>
    );
};

// ------------------ Sub-components ------------------

const ApartmentForm = ({ editingApartment, formData, setFormData, loading, onSubmit, onCancel }) => (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
        <div className="bg-neutral-900 p-6 rounded-xl border border-white/10 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-neutral-50">{editingApartment ? 'Edit Apartment' : 'Add New Apartment'}</h3>
                <button onClick={onCancel} className="text-neutral-400 hover:text-neutral-50">
                    <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
                </button>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
                <input
                    type="text"
                    placeholder="Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                    required
                />
                <textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-50 h-24 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                    required
                />
                <input
                    type="text"
                    placeholder="Location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full p-2 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                    required
                />
                <input
                    type="number"
                    placeholder="Price per night"
                    value={formData.price_per_night}
                    onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                    className="w-full p-2 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                    required
                    min="0"
                />
                <input
                    type="url"
                    placeholder="Image URL"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full p-2 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                />
                <label className="flex items-center space-x-2 text-neutral-50">
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
                        className="flex-1 bg-neutral-700 hover:bg-neutral-600 px-4 py-2 rounded text-neutral-50 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : editingApartment ? 'Update' : 'Create'}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 bg-neutral-700 hover:bg-neutral-600 px-4 py-2 rounded text-neutral-50"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
);

const ApartmentRow = ({ apartment, onEdit, onDelete, loadingAction, getImageUrl }) => (
    <tr className="border-b border-neutral-700 hover:bg-neutral-800 transition duration-150">
        <td className="p-4">{apartment.id}</td>
        <td className="p-4">
            <div className="flex items-center space-x-3">
                <img src={getImageUrl(apartment)} alt={apartment.title} className="w-12 h-12 rounded object-cover border border-neutral-700" />
                <div className="min-w-0 flex-1">
                    <div className="font-medium truncate text-neutral-50">{apartment.title}</div>
                    <div className="text-sm text-neutral-400 truncate">{apartment.description}</div>
                </div>
            </div>
        </td>
        <td className="p-4 text-neutral-50">{apartment.location}</td>
        <td className="p-4 text-neutral-50">₹{apartment.price_per_night?.toLocaleString()}</td>
        <td className="p-4">
            <span
                className={`px-2 py-1 rounded text-xs ${apartment.available ? 'bg-neutral-700 text-green-400' : 'bg-neutral-700 text-red-400'
                    }`}
            >
                {apartment.available ? 'Yes' : 'No'}
            </span>
        </td>
        <td className="p-4">
            <div className="flex space-x-2">
                <button
                    onClick={() => onEdit(apartment)}
                    disabled={loadingAction}
                    className="bg-neutral-700 hover:bg-neutral-600 px-3 py-1 rounded text-sm flex items-center space-x-1 text-yellow-400 disabled:opacity-50"
                >
                    <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
                    <span>Edit</span>
                </button>
                <button
                    onClick={() => onDelete(apartment.id)}
                    disabled={loadingAction}
                    className="bg-neutral-700 hover:bg-neutral-600 px-3 py-1 rounded text-sm flex items-center space-x-1 text-red-400 disabled:opacity-50"
                >
                    <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                    <span>Delete</span>
                </button>
            </div>
        </td>
    </tr>
);

export default ApartmentsManager;
