import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

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

export default ApartmentForm;