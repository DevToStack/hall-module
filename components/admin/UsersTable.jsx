import { useState, useEffect } from 'react';
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
    faSort,
    faSortUp,
    faSortDown,
    faChevronDown,
    faChevronUp,
    faDownload,
    faCog
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
            <div className="min-h-screen bg-black text-white p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            User Management
                        </h1>
                        <p className="text-gray-400 mt-2">
                            Manage your platform users and their activities
                        </p>
                    </div>
                    <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                        <button
                            onClick={fetchUsers}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors duration-200"
                        >
                            <FontAwesomeIcon icon={faSync} className="w-4 h-4" />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        title="Total Users"
                        value={totalUsers}
                        icon={faUsers}
                        color="blue"
                    />
                    <StatCard
                        title="Admins"
                        value={users.filter(u => u.role === 'admin').length}
                        icon={faUserShield}
                        color="purple"
                    />
                    <StatCard
                        title="Active Today"
                        value={users.filter(u => {
                            const userDate = new Date(u.created_at);
                            const today = new Date();
                            return userDate.toDateString() === today.toDateString();
                        }).length}
                        icon={faUser}
                        color="green"
                    />
                    <StatCard
                        title="Filtered"
                        value={filteredCount}
                        icon={faFilter}
                        color="orange"
                    />
                </div>

                {/* Filters Bar */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <FontAwesomeIcon
                                icon={faSearch}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                            />
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        {/* Filter Controls */}
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors duration-200"
                            >
                                <FontAwesomeIcon icon={faFilter} className="w-4 h-4" />
                                <span>Filters</span>
                                <FontAwesomeIcon
                                    icon={showFilters ? faChevronUp : faChevronDown}
                                    className="w-3 h-3"
                                />
                            </button>

                            {(searchTerm || roleFilter !== 'all' || dateFilter !== 'all') && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white transition-colors duration-200"
                                >
                                    <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                                    <span>Clear</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Expanded Filters */}
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-800">
                            {/* Role Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Role
                                </label>
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="guest">Guest</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            {/* Date Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Join Date
                                </label>
                                <select
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
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
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Sort By
                                </label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
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
                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                    {/* Table Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-800">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.size > 0 && selectedUsers.size === filteredUsers.length}
                                    onChange={toggleSelectAll}
                                    className="rounded border-gray-600 bg-gray-800"
                                />
                                <span className="text-sm text-gray-400">
                                    {selectedCount > 0 ? `${selectedCount} selected` : `${filteredCount} users`}
                                </span>
                            </div>
                        </div>

                        {selectedCount > 0 && (
                            <div className="flex items-center space-x-2">
                                <button className="flex items-center space-x-2 px-3 py-1 text-sm text-red-400 hover:text-red-300 transition-colors">
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
                                <tr className="border-b border-gray-800">
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.size > 0 && selectedUsers.size === filteredUsers.length}
                                            onChange={toggleSelectAll}
                                            className="rounded border-gray-600 bg-gray-800"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">User</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Role</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                                        <div className="flex items-center space-x-1">
                                            <FontAwesomeIcon icon={faCalendar} className="w-4 h-4" />
                                            <span>Bookings</span>
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                                        <div className="flex items-center space-x-1">
                                            <FontAwesomeIcon icon={faDollarSign} className="w-4 h-4" />
                                            <span>Spent</span>
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Joined</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.has(user.id)}
                                                onChange={() => toggleUserSelection(user.id)}
                                                className="rounded border-gray-600 bg-gray-800"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center space-x-3">
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
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin'
                                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                                }`}>
                                                <FontAwesomeIcon
                                                    icon={user.role === 'admin' ? faUserShield : faUser}
                                                    className="w-3 h-3 mr-1"
                                                />
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center space-x-2">
                                                <FontAwesomeIcon icon={faCalendar} className="w-4 h-4 text-gray-400" />
                                                <span>{user.total_bookings}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center space-x-2">
                                                <FontAwesomeIcon icon={faDollarSign} className="w-4 h-4 text-gray-400" />
                                                <span>${user.statistics?.total_spent || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-400">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => fetchUserDetails(user.id)}
                                                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors duration-200"
                                                    title="View Details"
                                                >
                                                    <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors duration-200"
                                                    title="Edit User"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(user.id, user.name)}
                                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
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
                                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors duration-200"
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

// Stat Card Component
function StatCard({ title, value, icon, color }) {
    const colorClasses = {
        blue: 'from-blue-500 to-cyan-500',
        purple: 'from-purple-500 to-pink-500',
        green: 'from-green-500 to-emerald-500',
        orange: 'from-orange-500 to-red-500'
    };

    return (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-400">{title}</p>
                    <p className="text-2xl font-bold mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]} bg-opacity-10`}>
                    <FontAwesomeIcon
                        icon={icon}
                        className={`w-6 h-6 bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}
                    />
                </div>
            </div>
        </div>
    );
}

// Reusable Component: Section
function Section({ title, children, action }) {
    return (
        <div className="bg-gray-700 p-4 rounded-xl border border-gray-600">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-lg">{title}</h4>
                {action}
            </div>
            {children}
        </div>
    );
}

// Reusable Component: Info Field
function InfoField({ label, value, important = false, badge = false, badgeColor = "gray", mono = false }) {
    const badgeColors = {
        gray: "bg-gray-600",
        green: "bg-green-600",
        blue: "bg-blue-600",
        purple: "bg-purple-600",
        red: "bg-red-600",
        yellow: "bg-yellow-600"
    };

    return (
        <div>
            <label className="text-sm text-gray-400 block mb-1">{label}</label>
            {badge ? (
                <span className={`px-2 py-1 rounded text-xs ${badgeColors[badgeColor]} text-white`}>
                    {value}
                </span>
            ) : (
                <p className={`${important ? 'font-semibold' : ''} ${mono ? 'font-mono text-sm' : ''}`}>
                    {value || 'Not provided'}
                </p>
            )}
        </div>
    );
}


// Reusable Component: Data Table
function DataTable({ data, columns, emptyMessage }) {
    if (data.length === 0) {
        return <EmptyState message={emptyMessage} />;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-600">
                        {columns.map(column => (
                            <th
                                key={column.key}
                                className={`p-2 text-left ${column.center ? 'text-center' : ''}`}
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={item.id || index} className="border-b border-gray-600/50 hover:bg-gray-600/20 transition-colors">
                            {columns.map(column => (
                                <td
                                    key={column.key}
                                    className={`p-2 ${column.center ? 'text-center' : ''}`}
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

// Reusable Component: Status Badge
function StatusBadge({ status, variants }) {
    const colorClasses = {
        green: "bg-green-600 text-white",
        blue: "bg-blue-600 text-white",
        yellow: "bg-yellow-600 text-white",
        red: "bg-red-600 text-white",
        gray: "bg-gray-600 text-white",
        purple: "bg-purple-600 text-white"
    };

    return (
        <span className={`px-2 py-1 rounded text-xs ${colorClasses[variants[status]] || colorClasses.gray}`}>
            {status}
        </span>
    );
}

// Reusable Component: Review Card
function ReviewCard({ review }) {
    return (
        <div className="border-b border-gray-600 pb-4 last:border-b-0">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p className="font-semibold">{review.apartment_title}</p>
                    <div className="flex items-center space-x-2 mt-1">
                        <span className="text-yellow-400 text-lg">
                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                        </span>
                        <span className="text-sm text-gray-400">({review.rating}/5)</span>
                    </div>
                    {review.comment && (
                        <p className="text-gray-300 mt-2 bg-gray-600/30 p-3 rounded-lg">{review.comment}</p>
                    )}
                </div>
                <span className="text-sm text-gray-400 whitespace-nowrap ml-4">
                    {new Date(review.review_date).toLocaleDateString()}
                </span>
            </div>
        </div>
    );
}

// Reusable Component: Activity Item
function ActivityItem({ activity }) {
    return (
        <div className="flex justify-between items-center border-b border-gray-600 pb-3 last:border-b-0">
            <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p>{activity.message}</p>
            </div>
            <span className="text-sm text-gray-400 whitespace-nowrap">
                {new Date(activity.date).toLocaleString()}
            </span>
        </div>
    );
}

// Reusable Component: Empty State
function EmptyState({ message }) {
    return (
        <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">📭</div>
            <p>{message}</p>
        </div>
    );
}

// User Details Modal Component
function UserDetailsModal({ userDetails, loading, onClose, onEdit }) {
    const { user, bookings, payments, reviews, sessions, activities } = userDetails;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-6 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        User Details: {user.name}
                    </h3>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => onEdit(user)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                        >
                            <span>✏️</span>
                            <span>Edit User</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors duration-200"
                        >
                            <span className="text-xl">×</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* User Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                title="Total Bookings"
                                value={user.statistics.total_bookings}
                                color="green"
                                icon="📅"
                            />
                            <StatCard
                                title="Total Payments"
                                value={user.statistics.total_payments}
                                color="blue"
                                icon="💰"
                            />
                            <StatCard
                                title="Total Reviews"
                                value={user.statistics.total_reviews}
                                color="yellow"
                                icon="⭐"
                            />
                            <StatCard
                                title="Total Spent"
                                value={`$${user.statistics.total_spent || 0}`}
                                color="purple"
                                icon="💳"
                            />
                        </div>

                        {/* Personal Information */}
                        <Section title="Personal Information" action={
                            <button
                                onClick={() => onEdit(user)}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                            >
                                Edit
                            </button>
                        }>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoField label="Name" value={user.name} important />
                                <InfoField label="Email" value={user.email} />
                                <InfoField label="Alternate Email" value={user.alternate_email} />
                                <InfoField label="Phone" value={user.phone_number} />
                                <InfoField label="Alternate Phone" value={user.alternate_phone} />
                                <InfoField
                                    label="Role"
                                    value={user.role}
                                    badge
                                    badgeColor={user.role === 'admin' ? 'purple' : 'gray'}
                                />
                                <InfoField label="Member Since" value={new Date(user.created_at).toLocaleDateString()} />
                                <InfoField label="User ID" value={user.id} mono />
                            </div>
                        </Section>

                        {/* Bookings */}
                        <Section title={`Booking History (${bookings.length})`}>
                            <DataTable
                                data={bookings}
                                columns={[
                                    { key: 'id', label: 'Booking ID' },
                                    { key: 'apartment_title', label: 'Apartment' },
                                    {
                                        key: 'dates',
                                        label: 'Dates',
                                        render: (booking) =>
                                            `${new Date(booking.start_date).toLocaleDateString()} - ${new Date(booking.end_date).toLocaleDateString()}`
                                    },
                                    { key: 'nights', label: 'Nights', center: true },
                                    { key: 'total_amount', label: 'Amount', render: (booking) => `$${booking.total_amount}` },
                                    {
                                        key: 'status',
                                        label: 'Status',
                                        render: (booking) => (
                                            <StatusBadge
                                                status={booking.status}
                                                variants={{
                                                    confirmed: 'green',
                                                    pending: 'yellow',
                                                    cancelled: 'red',
                                                    expired: 'gray'
                                                }}
                                            />
                                        )
                                    }
                                ]}
                                emptyMessage="No bookings found"
                            />
                        </Section>

                        {/* Payments */}
                        <Section title={`Payment History (${payments.length})`}>
                            <DataTable
                                data={payments}
                                columns={[
                                    { key: 'id', label: 'Payment ID' },
                                    { key: 'booking_id', label: 'Booking ID' },
                                    { key: 'apartment_title', label: 'Apartment' },
                                    { key: 'amount', label: 'Amount', render: (payment) => `$${payment.amount}` },
                                    { key: 'method', label: 'Method' },
                                    {
                                        key: 'status',
                                        label: 'Status',
                                        render: (payment) => (
                                            <StatusBadge
                                                status={payment.status}
                                                variants={{
                                                    paid: 'green',
                                                    refunded: 'blue',
                                                    failed: 'red',
                                                    cancelled: 'gray'
                                                }}
                                            />
                                        )
                                    },
                                    {
                                        key: 'paid_at',
                                        label: 'Date',
                                        render: (payment) => new Date(payment.paid_at).toLocaleDateString()
                                    }
                                ]}
                                emptyMessage="No payments found"
                            />
                        </Section>

                        {/* Reviews */}
                        <Section title={`Reviews (${reviews.length})`}>
                            {reviews.length > 0 ? (
                                <div className="space-y-4">
                                    {reviews.map(review => (
                                        <ReviewCard key={review.id} review={review} />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState message="No reviews found" />
                            )}
                        </Section>

                        {/* Recent Activity */}
                        <Section title="Recent Activity">
                            {activities.length > 0 ? (
                                <div className="space-y-3">
                                    {activities.map(activity => (
                                        <ActivityItem key={activity.id} activity={activity} />
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

// Edit User Modal Component
function EditUserModal({ formData, onInputChange, onSubmit, onClose }) {
    return (
        <Modal title="Edit User" onClose={onClose}>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={onInputChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={onInputChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={onInputChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    >
                        <option value="guest">Guest</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                        Update User
                    </button>
                </div>
            </form>
        </Modal>
    );
}

// Reusable Modal Component
function Modal({ title, children, onClose, size = "md" }) {
    const sizeClasses = {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl"
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`bg-gray-900 rounded-xl border border-gray-800 w-full ${sizeClasses[size]} shadow-2xl animate-scale-in`}>
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
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