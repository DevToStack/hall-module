import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

const PaymentsTable = ({ payments, loading, filters, onViewDetails }) => {
    return (
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead>
                    <tr className="bg-neutral-700 text-left text-neutral-300">
                        <th className="px-4 py-2">ID</th>
                        <th className="px-4 py-2">User</th>
                        <th className="px-4 py-2">Apartment</th>
                        <th className="px-4 py-2">Amount</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-700">
                    {loading ? (
                        <tr>
                            <td colSpan="7" className="text-center p-4 text-neutral-400">Loading payments...</td>
                        </tr>
                    ) : payments.length ? (
                        payments.map((payment) => (
                            <TableRow key={payment.id} payment={payment} onViewDetails={onViewDetails} />
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-center p-4 text-neutral-400">
                                {filters.search ? 'No payments match your search' : 'No payments found'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const TableRow = ({ payment, onViewDetails }) => (
    <tr className="hover:bg-neutral-700 text-neutral-200">
        <td className="px-4 py-2 font-medium">#{payment.id}</td>
        <td className="px-4 py-2">{payment.user_name}</td>
        <td className="px-4 py-2">{payment.apartment_title}</td>
        <td className="px-4 py-2">{formatCurrency(payment.amount)}</td>
        <td className="px-4 py-2 capitalize">{payment.status}</td>
        <td className="px-4 py-2">{formatDate(payment.paid_at)}</td>
        <td className="px-4 py-2">
            <button
                onClick={() => onViewDetails({ open: true, payment })}
                className="text-neutral-300 hover:text-white"
                title="View Details"
            >
                <FontAwesomeIcon icon={faEye} />
            </button>
        </td>
    </tr>
);

export default PaymentsTable;