import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers,
    faSync,
    faEye,
    faEdit,
    faTrash,
    faTimes,
    faSearch,
    faFilter,
    faUser,
    faUserShield,
    faCalendar,
    faDollarSign,
    faStar,
    faCheck,
    faExclamationTriangle,
    faInfoCircle,
    faClipboardList,
    faSort,
    faShieldAlt,
    faSortUp,
    faSortDown,
    faChevronDown,
    faChevronUp,
    faDownload,
    faCog,
    faPen,
    faCalendarCheck,
    faCreditCard,
    faMoneyBill,
    faEnvelope,
    faPhone,
    faClock,
    faCheckCircle,
    faTimesCircle,
    faBan,
    faSyncAlt,
    faWallet,
    faXmark,
    faCircleDot,
    faIdBadge,
} from '@fortawesome/free-solid-svg-icons';

export default function UsersTable() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserDetails, setShowUserDetails] = useState(false);
    const [userDetails, setUserDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        alternate_email: '',
        phone_number: '',
        alternate_phone: '',
        role: 'guest'
    });

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState(new Set());

    // Modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch users
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/users');

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data.users);
        } catch (err) {
            showError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Filter and sort users
    const filteredUsers = users
        .filter(user => {
            const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === 'all' || user.role === roleFilter;

            const now = new Date();
            const userDate = new Date(user.created_at);
            const timeDiff = now.getTime() - userDate.getTime();
            const daysDiff = timeDiff / (1000 * 3600 * 24);

            let matchesDate = true;
            switch (dateFilter) {
                case 'today':
                    matchesDate = daysDiff < 1;
                    break;
                case 'week':
                    matchesDate = daysDiff < 7;
                    break;
                case 'month':
                    matchesDate = daysDiff < 30;
                    break;
                case 'year':
                    matchesDate = daysDiff < 365;
                    break;
            }

            return matchesSearch && matchesRole && matchesDate;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'oldest':
                    return new Date(a.created_at) - new Date(b.created_at);
                case 'name_asc':
                    return a.name?.localeCompare(b.name);
                case 'name_desc':
                    return b.name?.localeCompare(a.name);
                case 'most_bookings':
                    return b.total_bookings - a.total_bookings;
                case 'most_spent':
                    return (b.statistics?.total_spent || 0) - (a.statistics?.total_spent || 0);
                default:
                    return 0;
            }
        });

    // Fetch user details
    const fetchUserDetails = async (userId) => {
        try {
            setDetailsLoading(true);
            const response = await fetch(`/api/admin/users/${userId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch user details');
            }

            const data = await response.json();
            setUserDetails(data);
            setSelectedUser(userId);
            setShowUserDetails(true);
        } catch (err) {
            showError(err.message);
        } finally {
            setDetailsLoading(false);
        }
    };

    // Show success modal
    const showSuccess = (message) => {
        setSuccessMessage(message);
        setShowSuccessModal(true);
    };

    // Show error modal
    const showError = (message) => {
        setErrorMessage(message);
        setShowErrorModal(true);
    };

    // Delete user confirmation
    const confirmDelete = (userId, userName) => {
        setUserToDelete({ id: userId, name: userName });
        setShowDeleteModal(true);
    };

    // Execute delete after confirmation
    const executeDelete = async () => {
        if (!userToDelete) return;

        try {
            const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete user');
            }

            setUsers(users.filter(user => user.id !== userToDelete.id));
            if (showUserDetails && selectedUser === userToDelete.id) {
                setShowUserDetails(false);
            }
            setShowDeleteModal(false);
            setUserToDelete(null);
            showSuccess(`User "${userToDelete.name}" deleted successfully`);
        } catch (err) {
            showError(err.message);
        }
    };

    // Edit user - open edit modal
    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name || '',
            email: user.email || '',
            alternate_email: user.alternate_email || '',
            phone_number: user.phone_number || '',
            alternate_phone: user.alternate_phone || '',
            role: user.role || 'guest'
        });
        setShowEditModal(true);
    };

    // Update user
    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/admin/users/${editingUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update user');
            }

            // Update user in local state
            setUsers(users.map(user =>
                user.id === editingUser.id
                    ? { ...user, ...formData }
                    : user
            ));

            // Refresh user details if open
            if (showUserDetails && selectedUser === editingUser.id) {
                fetchUserDetails(editingUser.id);
            }

            setShowEditModal(false);
            setEditingUser(null);
            showSuccess(`User "${formData.name}" updated successfully`);
        } catch (err) {
            showError(err.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Select all users
    const toggleSelectAll = () => {
        if (selectedUsers.size === filteredUsers.length) {
            setSelectedUsers(new Set());
        } else {
            setSelectedUsers(new Set(filteredUsers.map(user => user.id)));
        }
    };

    // Toggle single user selection
    const toggleUserSelection = (userId) => {
        const newSelected = new Set(selectedUsers);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedUsers(newSelected);
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchTerm('');
        setRoleFilter('all');
        setDateFilter('all');
        setSortBy('newest');
        setSelectedUsers(new Set());
    };

    // Get filter stats
    const getFilterStats = () => {
        const totalUsers = users.length;
        const filteredCount = filteredUsers.length;
        const selectedCount = selectedUsers.size;

        return { totalUsers, filteredCount, selectedCount };
    };

    const { totalUsers, filteredCount, selectedCount } = getFilterStats();

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
        <div className="h-full max-sm:pb-16 text-white max-sm:p-6">
            <div className="mx-auto">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                    <div>
                        <p className="text-gray-400 mt-2">
                            Manage your platform users and their activities
                        </p>
                    </div>
                    <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                        <button
                            onClick={fetchUsers}
                            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 
                     border border-neutral-800 rounded-lg transition-colors duration-200 text-sm text-gray-300"
                        >
                            <FontAwesomeIcon icon={faSync} className="w-4 h-4 text-gray-400" />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard title="Total Users" value={totalUsers} icon={faUsers} color="blue" />
                    <StatCard title="Admins" value={users.filter(u => u.role === 'admin').length} icon={faUserShield} color="purple" />
                    <StatCard title="Active Today" value={users.filter(u => {
                        const userDate = new Date(u.created_at);
                        const today = new Date();
                        return userDate.toDateString() === today.toDateString();
                    }).length} icon={faUser} color="green" />
                    <StatCard title="Filtered" value={filteredCount} icon={faFilter} color="orange" />
                </div>

                {/* Filters Bar */}
                <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <FontAwesomeIcon
                                icon={faSearch}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4"
                            />
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-white text-gray-300 placeholder-gray-500"
                            />
                        </div>

                        {/* Filter Controls */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 
                       border border-neutral-800 rounded-lg text-sm text-gray-300 transition-colors"
                            >
                                <FontAwesomeIcon icon={faFilter} className="w-4 h-4 text-gray-400" />
                                <span>Filters</span>
                                <FontAwesomeIcon
                                    icon={showFilters ? faChevronUp : faChevronDown}
                                    className="w-3 h-3 text-gray-400"
                                />
                            </button>

                            {(searchTerm || roleFilter !== "all" || dateFilter !== "all") && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white 
                         hover:bg-neutral-800 rounded-lg transition-colors"
                                >
                                    <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                                    <span>Clear</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Expanded Filters */}
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-neutral-800">
                            {/* Role Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-300"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="guest">Guest</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            {/* Date Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Join Date</label>
                                <select
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-300"
                                >
                                    <option value="all">All Time</option>
                                    <option value="today">Today</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                    <option value="year">This Year</option>
                                </select>
                            </div>

                            {/* Sort By */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Sort By</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-300"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="name_asc">Name A-Z</option>
                                    <option value="name_desc">Name Z-A</option>
                                    <option value="most_bookings">Most Bookings</option>
                                    <option value="most_spent">Most Spent</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Users Table */}
                <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
                    {/* Table Header */}
                    <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.size > 0 && selectedUsers.size === filteredUsers.length}
                                    onChange={toggleSelectAll}
                                    className="rounded border-neutral-700 bg-neutral-950"
                                />
                                <span className="text-sm text-gray-400">
                                    {selectedCount > 0 ? `${selectedCount} selected` : `${filteredCount} users`}
                                </span>
                            </div>
                        </div>

                        {selectedCount > 0 && (
                            <div className="flex items-center gap-2">
                                <button className="flex items-center gap-2 px-3 py-1 text-sm text-red-400 hover:text-red-300 transition-colors">
                                    <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                                    <span>Delete Selected</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-neutral-800">
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.size > 0 && selectedUsers.size === filteredUsers.length}
                                            onChange={toggleSelectAll}
                                            className="rounded border-neutral-700 bg-neutral-950"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">User</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Role</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Bookings</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Spent</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Joined</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/40 transition-colors">
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.has(user.id)}
                                                onChange={() => toggleUserSelection(user.id)}
                                                className="rounded border-neutral-700 bg-neutral-950"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                                    <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{user.name}</div>
                                                    <div className="text-sm text-gray-400">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === "admin"
                                                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                                        : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                                                    }`}
                                            >
                                                <FontAwesomeIcon
                                                    icon={user.role === "admin" ? faUserShield : faUser}
                                                    className="w-3 h-3 mr-1"
                                                />
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">{user.total_bookings}</td>
                                        <td className="px-4 py-3 text-gray-300">${user.statistics?.total_spent || 0}</td>
                                        <td className="px-4 py-3 text-sm text-gray-400">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => fetchUserDetails(user.id)}
                                                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                                                    title="Edit User"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(user.id, user.name)}
                                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Delete User"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty State */}
                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12">
                            <FontAwesomeIcon icon={faUsers} className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-400 mb-2">No users found</h3>
                            <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* User Details Modal */}
            {showUserDetails && userDetails && (
                <UserDetailsModal
                    userDetails={userDetails}
                    loading={detailsLoading}
                    onClose={() => setShowUserDetails(false)}
                    onEdit={handleEdit}
                />
            )}

            {/* Edit User Modal */}
            {showEditModal && (
                <EditUserModal
                    formData={formData}
                    onInputChange={handleInputChange}
                    onSubmit={handleUpdate}
                    onClose={() => setShowEditModal(false)}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <ConfirmationModal
                    title="Delete User"
                    message={`Are you sure you want to delete user "${userToDelete?.name}"? This action cannot be undone and will delete all associated data including bookings, payments, and reviews.`}
                    confirmText="Delete User"
                    cancelText="Cancel"
                    onConfirm={executeDelete}
                    onCancel={() => {
                        setShowDeleteModal(false);
                        setUserToDelete(null);
                    }}
                    type="danger"
                />
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <MessageModal
                    title="Success"
                    message={successMessage}
                    type="success"
                    onClose={() => setShowSuccessModal(false)}
                />
            )}

            {/* Error Modal */}
            {showErrorModal && (
                <MessageModal
                    title="Error"
                    message={errorMessage}
                    type="error"
                    onClose={() => setShowErrorModal(false)}
                />
            )}
        </div>
    );
}


// ✅ Section (Vercel-like)
function Section({ title, children, action }) {
    return (
        <div className="bg-neutral-900 rounded-2xl shadow-sm border border-neutral-800 p-5">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-base text-white flex items-center gap-2">
                    <FontAwesomeIcon icon={faCircleDot} className="text-blue-400" />
                    {title}
                </h4>
                {action}
            </div>
            {children}
        </div>
    );
}

// ✅ Info Field
function InfoField({ label, value, important = false, badge = false, badgeColor = "gray", mono = false }) {
    const badgeColors = {
        gray: "bg-neutral-700 text-gray-200",
        green: "bg-emerald-600 text-white",
        blue: "bg-blue-600 text-white",
        purple: "bg-purple-600 text-white",
        red: "bg-red-600 text-white",
        yellow: "bg-yellow-500 text-black",
    };

    return (
        <div>
            <label className="text-xs text-neutral-500 block mb-1">{label}</label>
            {badge ? (
                <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${badgeColors[badgeColor]}`}>
                    <FontAwesomeIcon
                        icon={value === "admin" ? faUserShield : faUser}
                        className="mr-1"
                    />
                    {value}
                </span>
            ) : (
                <p
                    className={`${important ? "font-medium text-white" : "text-neutral-300"} ${mono ? "font-mono text-sm" : ""
                        }`}
                >
                    {value || "—"}
                </p>
            )}
        </div>
    );
}

// ✅ Status Badge
function StatusBadge({ status, variants }) {
    const colorClasses = {
        green: "bg-emerald-600 text-white",
        blue: "bg-blue-600 text-white",
        yellow: "bg-yellow-500 text-black",
        red: "bg-red-600 text-white",
        gray: "bg-neutral-700 text-gray-200",
        purple: "bg-purple-600 text-white",
    };

    const icons = {
        confirmed: faCheckCircle,
        pending: faClock,
        cancelled: faTimesCircle,
        expired: faBan,
        refunded: faSyncAlt,
        paid: faWallet,
        failed: faExclamationTriangle,
    };

    return (
        <span
            className={`px-2 py-0.5 rounded-md text-xs font-medium flex items-center gap-1 ${colorClasses[variants[status]] || colorClasses.gray
                }`}
        >
            <FontAwesomeIcon icon={icons[status] || faCircleDot} />
            {status}
        </span>
    );
}

// ✅ Review Card
function ReviewCard({ review }) {
    return (
        <div className="border-b border-neutral-800 pb-4 last:border-b-0">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p className="font-medium text-white">{review.apartment_title}</p>
                    <div className="flex items-center space-x-2 mt-1">
                        <span className="text-yellow-400">
                            {Array.from({ length: review.rating }, (_, i) => (
                                <FontAwesomeIcon key={i} icon={faStar} />
                            ))}
                            {Array.from({ length: 5 - review.rating }, (_, i) => (
                                <FontAwesomeIcon key={i} icon={faStar} className="text-neutral-600" />
                            ))}
                        </span>
                        <span className="text-sm text-neutral-500">({review.rating}/5)</span>
                    </div>
                    {review.comment && (
                        <p className="text-neutral-300 mt-2 bg-neutral-800/50 p-3 rounded-lg">
                            {review.comment}
                        </p>
                    )}
                </div>
                <span className="text-sm text-neutral-500 whitespace-nowrap ml-4">
                    {new Date(review.review_date).toLocaleDateString()}
                </span>
            </div>
        </div>
    );
}

// ✅ Activity Item
function ActivityItem({ activity }) {
    return (
        <div className="flex justify-between items-center border-b border-neutral-800 pb-3 last:border-b-0">
            <div className="flex items-center space-x-3">
                <FontAwesomeIcon icon={faCircleDot} className="text-blue-400" />
                <p className="text-neutral-300">{activity.message}</p>
            </div>
            <span className="text-sm text-neutral-500 whitespace-nowrap">
                {new Date(activity.date).toLocaleString()}
            </span>
        </div>
    );
}

// ✅ Empty State
function EmptyState({ message }) {
    return (
        <div className="text-center py-10 text-neutral-500">
            <FontAwesomeIcon icon={faEnvelope} className="text-3xl mb-2" />
            <p>{message}</p>
        </div>
    );
}

// ✅ User Details Modal (Vercel style) with Font Awesome
function UserDetailsModal({ userDetails, loading, onClose, onEdit }) {
    const { user, bookings, payments, reviews, activities } = userDetails;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-md">
            <div className="bg-[#0a0a0a] p-6 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-800">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
                        <FontAwesomeIcon icon={faUser} className="mr-2" />
                        {user.name}
                    </h3>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => onEdit(user)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition flex items-center"
                        >
                            <FontAwesomeIcon icon={faPen} className="mr-2" /> Edit
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-gray-700 hover:bg-gray-800 text-white p-2 rounded-lg transition"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                </div>

                {/* Loader */}
                {loading ? (
                    <div className="flex justify-center items-center py-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                title="Bookings"
                                value={user.statistics.total_bookings}
                                color="from-green-400 to-emerald-600"
                                icon={faClipboardList}
                            />
                            <StatCard
                                title="Payments"
                                value={user.statistics.total_payments}
                                color="from-blue-400 to-indigo-600"
                                icon={faMoneyBill}
                            />
                            <StatCard
                                title="Reviews"
                                value={user.statistics.total_reviews}
                                color="from-yellow-400 to-orange-500"
                                icon={faStar}
                            />
                            <StatCard
                                title="Total Spent"
                                value={`$${user.statistics.total_spent || 0}`}
                                color="from-purple-400 to-pink-500"
                                icon={faCreditCard}
                            />
                        </div>

                        {/* Personal Info */}
                        <Section title="Personal Information">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoField icon={faUser} label="Name" value={user.name} />
                                <InfoField icon={faEnvelope} label="Email" value={user.email} />
                                <InfoField icon={faPhone} label="Phone" value={user.phone_number} />
                                <InfoField
                                    icon={faCalendar}
                                    label="Member Since"
                                    value={new Date(user.created_at).toLocaleDateString()}
                                />
                                <InfoField icon={faIdBadge} label="User ID" value={user.id} mono />
                            </div>
                        </Section>

                        {/* Bookings */}
                        <Section title={`Bookings (${bookings.length})`}>
                            <DataTable
                                data={bookings}
                                columns={[
                                    { key: "id", label: "Booking ID" },
                                    { key: "apartment_title", label: "Apartment" },
                                    {
                                        key: "dates",
                                        label: "Dates",
                                        render: (b) =>
                                            `${new Date(b.start_date).toLocaleDateString()} - ${new Date(
                                                b.end_date
                                            ).toLocaleDateString()}`,
                                    },
                                    { key: "nights", label: "Nights", center: true },
                                    {
                                        key: "status",
                                        label: "Status",
                                        render: (b) => (
                                            <StatusBadge
                                                status={b.status}
                                                variants={{
                                                    confirmed: "green",
                                                    pending: "yellow",
                                                    cancelled: "red",
                                                    expired: "gray",
                                                }}
                                            />
                                        ),
                                    },
                                ]}
                                emptyMessage="No bookings found"
                            />
                        </Section>

                        {/* Payments */}
                        <Section title={`Payments (${payments.length})`}>
                            <DataTable
                                data={payments}
                                columns={[
                                    { key: "id", label: "Payment ID" },
                                    { key: "booking_id", label: "Booking ID" },
                                    { key: "amount", label: "Amount", render: (p) => `$${p.amount}` },
                                    {
                                        key: "status",
                                        label: "Status",
                                        render: (p) => (
                                            <StatusBadge
                                                status={p.status}
                                                variants={{
                                                    paid: "green",
                                                    refunded: "blue",
                                                    failed: "red",
                                                    cancelled: "gray",
                                                }}
                                            />
                                        ),
                                    },
                                    {
                                        key: "paid_at",
                                        label: "Date",
                                        render: (p) => new Date(p.paid_at).toLocaleDateString(),
                                    },
                                ]}
                                emptyMessage="No payments found"
                            />
                        </Section>

                        {/* Reviews */}
                        <Section title={`Reviews (${reviews.length})`}>
                            {reviews.length > 0 ? (
                                <div className="space-y-4">
                                    {reviews.map((r) => (
                                        <ReviewCard key={r.id} review={r} />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState message="No reviews yet" />
                            )}
                        </Section>

                        {/* Activity */}
                        <Section title="Recent Activity">
                            {activities.length > 0 ? (
                                <div className="space-y-3">
                                    {activities.map((a) => (
                                        <ActivityItem key={a.id} activity={a} />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState message="No recent activity" />
                            )}
                        </Section>
                    </div>
                )}
            </div>
        </div>
    );
}

// ✅ StatCard with Font Awesome
function StatCard({ title, value, color, icon }) {
    const colors = {
        green: "text-emerald-400",
        blue: "text-blue-400",
        yellow: "text-yellow-400",
        purple: "text-purple-400",
    };

    return (
        <div className="bg-neutral-800 rounded-xl p-4 flex flex-col items-center justify-center">
            <FontAwesomeIcon icon={icon} className={`text-2xl mb-2 ${colors[color]}`} />
            <h4 className="text-neutral-400 text-sm">{title}</h4>
            <p className="text-white text-lg font-semibold">{value}</p>
        </div>
    );
}

function DataTable({ data, columns, emptyMessage }) {
    if (!data || data.length === 0) {
        return <EmptyState message={emptyMessage} />;
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm shadow-lg">
            <table className="w-full text-sm text-gray-300">
                {/* Table Head */}
                <thead>
                    <tr className="border-b border-neutral-800 bg-neutral-900/80">
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={`px-4 py-3 text-left font-medium text-gray-400 tracking-wide ${column.center ? "text-center" : ""
                                    }`}
                            >
                                {column.icon && (
                                    <FontAwesomeIcon
                                        icon={column.icon}
                                        className="mr-2 text-gray-500"
                                    />
                                )}
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                    {data.map((item, index) => (
                        <tr
                            key={item.id || index}
                            className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors"
                        >
                            {columns.map((column) => (
                                <td
                                    key={column.key}
                                    className={`px-4 py-3 ${column.center ? "text-center" : "text-left"
                                        }`}
                                >
                                    {column.render ? column.render(item) : item[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}


function EditUserModal({ formData, onInputChange, onSubmit, onClose }) {
    return (
        <Modal title="Edit User" onClose={onClose}>
            <form
                onSubmit={onSubmit}
                className="space-y-6 text-sm text-gray-300"
            >
                {/* Name */}
                <div>
                    <label className="block mb-2 text-gray-400 font-medium flex items-center gap-2">
                        <FontAwesomeIcon icon={faUser} className="text-gray-500" />
                        <span>Name</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={onInputChange}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent
                       transition-all placeholder-gray-500"
                        placeholder="Enter user name"
                        required
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block mb-2 text-gray-400 font-medium flex items-center gap-2">
                        <FontAwesomeIcon icon={faEnvelope} className="text-gray-500" />
                        <span>Email</span>
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={onInputChange}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg 
                       focus:outline-none focus:ring-2 focus:white focus:border-transparent
                       transition-all placeholder-gray-500"
                        placeholder="user@example.com"
                        required
                    />
                </div>

                {/* Role */}
                <RoleDropdown value={formData.role} onChange={onInputChange} />

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-400 hover:text-white hover:bg-neutral-800 
                       rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 
                       hover:from-blue-500 hover:to-purple-500 rounded-lg 
                       text-white font-medium shadow-md transition-all"
                    >
                        Update User
                    </button>
                </div>
            </form>
        </Modal>
    );
}

const roleOptions = [
    { label: "Guest", value: "guest", icon: faUser },
    { label: "Admin", value: "admin", icon: faUserShield },
  ];

function RoleDropdown({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selected = roleOptions.find((r) => r.value === value);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex justify-between items-center px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-white transition-colors"
            >
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={selected.icon} className="w-4 h-4 text-gray-400" />
                    <span>{selected.label}</span>
                </div>
                <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3 text-gray-400" />
            </button>

            {open && (
                <ul className="absolute mt-1 w-full bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg z-10">
                    {roleOptions.map((role) => (
                        <li
                            key={role.value}
                            onClick={() => {
                                onChange({ target: { name: "role", value: role.value } });
                                setOpen(false);
                            }}
                            className={`cursor-pointer flex items-center gap-2 px-3 py-2 text-gray-300 hover:bg-neutral-800 transition-colors ${role.value === value ? "bg-neutral-800 text-blue-400" : ""
                                }`}
                        >
                            <FontAwesomeIcon icon={role.icon} className="w-4 h-4" />
                            <span>{role.label}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
  }

function Modal({ title, children, onClose, size = "md" }) {
    const sizeClasses = {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
                className={`bg-neutral-900 rounded-xl border border-neutral-800 w-full ${sizeClasses[size]} 
                      shadow-2xl animate-scale-in transition-transform duration-200`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-800">
                    <h3 className="text-xl font-semibold text-gray-100">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
                        aria-label="Close Modal"
                    >
                        <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 text-gray-300">{children}</div>
            </div>
        </div>
    );
  }

// Confirmation Modal Component
function ConfirmationModal({ title, message, confirmText, cancelText, onConfirm, onCancel, type = "danger" }) {
    const buttonColors = {
        danger: "bg-red-600 hover:bg-red-700",
        warning: "bg-yellow-600 hover:bg-yellow-700",
        primary: "bg-blue-600 hover:bg-blue-700"
    };

    return (
        <Modal title={title} size="sm">
            <div className="text-center">
                <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="w-12 h-12 text-yellow-500 mx-auto mb-4"
                />
                <p className="text-gray-300 mb-6 leading-relaxed">{message}</p>
                <div className="flex justify-center space-x-3">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-6 py-2 text-white rounded-lg transition-colors ${buttonColors[type]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

// Message Modal Component
function MessageModal({ title, message, type = "info", onClose }) {
    const icons = {
        success: faCheck,
        error: faTimes,
        warning: faExclamationTriangle,
        info: faInfoCircle
    };

    const colors = {
        success: "text-green-500",
        error: "text-red-500",
        warning: "text-yellow-500",
        info: "text-blue-500"
    };

    return (
        <Modal title={title} size="sm">
            <div className="text-center">
                <FontAwesomeIcon
                    icon={icons[type]}
                    className={`w-12 h-12 mx-auto mb-4 ${colors[type]}`}
                />
                <p className="text-gray-300 mb-6 leading-relaxed">{message}</p>
                <button
                    onClick={onClose}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                    OK
                </button>
            </div>
        </Modal>
    );
}