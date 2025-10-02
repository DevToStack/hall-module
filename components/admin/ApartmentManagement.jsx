import { useState, useMemo, lazy, Suspense } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faXmark, faEdit, faTrash, faPlus, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

// Lazy load components that are only used conditionally
const ApartmentForm = lazy(() => import('./ApartmentForm'));
const ApartmentRow = lazy(() => import('./ApartmentRow'));
const ConfirmModal = lazy(() => import('./ConfirmModal'));

// Initial form state
const initialFormState = {
    title: '',
    description: '',
    location: '',
    price_per_night: '',
    image_url: '',
    available: true,
};

const ApartmentsManager = ({ apartments = [], loading, onRefresh }) => {
    const [showForm, setShowForm] = useState(false);
    const [editingApartment, setEditingApartment] = useState(null);
    const [formData, setFormData] = useState(initialFormState);
    const [loadingAction, setLoadingAction] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, apartmentId: null, apartmentTitle: '' });

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
        if (!apartments || apartments.length === 0) return [];

        let filtered = apartments.filter((apartment) => {
            const matchesSearch =
                apartment.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
                apartment.description?.toLowerCase().includes(filters.search.toLowerCase());

            const matchesLocation =
                !filters.location || apartment.location?.toLowerCase().includes(filters.location.toLowerCase());

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

    const handleDeleteClick = (apartment) => {
        setDeleteModal({
            isOpen: true,
            apartmentId: apartment.id,
            apartmentTitle: apartment.title
        });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.apartmentId) return;

        setLoadingAction(true);
        try {
            const response = await fetch(`/api/admin/apartments?id=${deleteModal.apartmentId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (response.ok) {
                onRefresh();
                setDeleteModal({ isOpen: false, apartmentId: null, apartmentTitle: '' });
            } else {
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

    const handleDeleteCancel = () => {
        setDeleteModal({ isOpen: false, apartmentId: null, apartmentTitle: '' });
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

    if (loading) {
        return (
            <div className="h-screen text-white p-6 flex items-center justify-center"
                style={{ maxHeight: 'calc(100vh - 96px)' }}
            >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <section className="max-sm:p-6 max-sm:pb-16 h-full">
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
                            <Suspense key={apartment.id} fallback={<TableRowSkeleton />}>
                                <ApartmentRow
                                    apartment={apartment}
                                    onEdit={handleEdit}
                                    onDelete={handleDeleteClick}
                                    loadingAction={loadingAction}
                                    getImageUrl={getImageUrl}
                                />
                            </Suspense>
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

            {/* Apartment Form Modal - Only loads when needed */}
            {showForm && (
                <Suspense fallback={<FormSkeleton />}>
                    <ApartmentForm
                        editingApartment={editingApartment}
                        formData={formData}
                        setFormData={setFormData}
                        loading={loadingAction}
                        onSubmit={handleSubmit}
                        onCancel={resetForm}
                    />
                </Suspense>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <Suspense fallback={<ConfirmModalSkeleton />}>
                    <ConfirmModal
                        isOpen={deleteModal.isOpen}
                        title="Delete Apartment"
                        message={`Are you sure you want to delete "${deleteModal.apartmentTitle}"? This action cannot be undone.`}
                        onConfirm={handleDeleteConfirm}
                        onCancel={handleDeleteCancel}
                        confirmText="Delete"
                        cancelText="Cancel"
                        variant="danger"
                        loading={loadingAction}
                    />
                </Suspense>
            )}
        </section>
    );
};

// Loading components
const TableRowSkeleton = () => (
    <tr className="border-b border-neutral-700 animate-pulse">
        <td className="p-4"><div className="h-4 bg-neutral-700 rounded w-8"></div></td>
        <td className="p-4">
            <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-neutral-700 rounded"></div>
                <div className="flex-1">
                    <div className="h-4 bg-neutral-700 rounded mb-2"></div>
                    <div className="h-3 bg-neutral-700 rounded w-3/4"></div>
                </div>
            </div>
        </td>
        <td className="p-4"><div className="h-4 bg-neutral-700 rounded w-20"></div></td>
        <td className="p-4"><div className="h-4 bg-neutral-700 rounded w-16"></div></td>
        <td className="p-4"><div className="h-6 bg-neutral-700 rounded w-12"></div></td>
        <td className="p-4">
            <div className="flex space-x-2">
                <div className="h-8 bg-neutral-700 rounded w-12"></div>
                <div className="h-8 bg-neutral-700 rounded w-12"></div>
            </div>
        </td>
    </tr>
);

const FormSkeleton = () => (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
        <div className="bg-neutral-900 p-6 rounded-xl border border-white/10 w-full max-w-md">
            <div className="animate-pulse space-y-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="h-6 bg-neutral-700 rounded w-32"></div>
                    <div className="h-5 bg-neutral-700 rounded w-5"></div>
                </div>
                <div className="h-10 bg-neutral-700 rounded"></div>
                <div className="h-24 bg-neutral-700 rounded"></div>
                <div className="h-10 bg-neutral-700 rounded"></div>
                <div className="h-10 bg-neutral-700 rounded"></div>
                <div className="h-10 bg-neutral-700 rounded"></div>
                <div className="flex space-x-2">
                    <div className="flex-1 h-10 bg-neutral-700 rounded"></div>
                    <div className="flex-1 h-10 bg-neutral-700 rounded"></div>
                </div>
            </div>
        </div>
    </div>
);

const ConfirmModalSkeleton = () => (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
        <div className="bg-neutral-900 p-6 rounded-xl border border-white/10 w-full max-w-md">
            <div className="animate-pulse space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="h-6 bg-neutral-700 rounded w-6"></div>
                    <div className="h-6 bg-neutral-700 rounded w-32"></div>
                </div>
                <div className="h-16 bg-neutral-700 rounded"></div>
                <div className="flex space-x-2">
                    <div className="flex-1 h-10 bg-neutral-700 rounded"></div>
                    <div className="flex-1 h-10 bg-neutral-700 rounded"></div>
                </div>
            </div>
        </div>
    </div>
);

export default ApartmentsManager;