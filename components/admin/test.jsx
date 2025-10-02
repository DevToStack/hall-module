import { useState, useEffect } from 'react';

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

    // New state for confirmation modals
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

    if (loading) return <div className="p-6">Loading users...</div>;

    return (
        <section className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">All Users</h2>
                <button
                    onClick={fetchUsers}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                    Refresh
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/10">
                            <th className="p-2">ID</th>
                            <th className="p-2">Name</th>
                            <th className="p-2">Email</th>
                            <th className="p-2">Role</th>
                            <th className="p-2">Bookings</th>
                            <th className="p-2">Payments</th>
                            <th className="p-2">Reviews</th>
                            <th className="p-2">Joined</th>
                            <th className="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                <td className="p-2">{user.id}</td>
                                <td className="p-2">{user.name}</td>
                                <td className="p-2">{user.email}</td>
                                <td className="p-2">
                                    <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin'
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-600 text-white'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-2 text-center">{user.total_bookings}</td>
                                <td className="p-2 text-center">{user.total_payments}</td>
                                <td className="p-2 text-center">{user.total_reviews}</td>
                                <td className="p-2">{new Date(user.created_at).toLocaleDateString()}</td>
                                <td className="p-2">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => fetchUserDetails(user.id)}
                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                                        >
                                            View Details
                                        </button>
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(user.id, user.name)}
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
        </section>
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
                    <label className="block text-sm font-medium mb-2">Name *</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={onInputChange}
                        className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={onInputChange}
                        className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Alternate Email</label>
                    <input
                        type="email"
                        name="alternate_email"
                        value={formData.alternate_email}
                        onChange={onInputChange}
                        className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                        placeholder="Optional alternate email"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <input
                        type="tel"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={onInputChange}
                        className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                        placeholder="Optional phone number"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Alternate Phone</label>
                    <input
                        type="tel"
                        name="alternate_phone"
                        value={formData.alternate_phone}
                        onChange={onInputChange}
                        className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                        placeholder="Optional alternate phone"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Role *</label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={onInputChange}
                        className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    >
                        <option value="guest">Guest</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
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
            <div className={`bg-gray-800 p-6 rounded-xl w-full ${sizeClasses[size]} shadow-2xl animate-scale-in`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                        <span className="text-2xl">×</span>
                    </button>
                </div>
                {children}
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
                <div className="text-6xl mb-4">⚠️</div>
                <p className="text-gray-300 mb-6 leading-relaxed">{message}</p>
                <div className="flex justify-center space-x-3">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-6 py-2 text-white rounded-lg transition-colors duration-200 ${buttonColors[type]}`}
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
        success: "✅",
        error: "❌",
        warning: "⚠️",
        info: "ℹ️"
    };

    const borderColors = {
        success: "border-green-500",
        error: "border-red-500",
        warning: "border-yellow-500",
        info: "border-blue-500"
    };

    return (
        <Modal title={title} size="sm">
            <div className="text-center">
                <div className="text-6xl mb-4">{icons[type]}</div>
                <p className="text-gray-300 mb-6 leading-relaxed">{message}</p>
                <button
                    onClick={onClose}
                    className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                    OK
                </button>
            </div>
        </Modal>
    );
}

// Reusable Component: Stat Card
function StatCard({ title, value, color, icon }) {
    const colorClasses = {
        green: "from-green-500 to-emerald-500",
        blue: "from-blue-500 to-cyan-500",
        yellow: "from-yellow-500 to-orange-500",
        purple: "from-purple-500 to-pink-500"
    };

    return (
        <div className="bg-gray-700 p-4 rounded-xl border border-gray-600">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-400">{title}</p>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
                <div className={`text-2xl bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}>
                    {icon}
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