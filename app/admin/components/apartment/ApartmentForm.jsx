'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faPlus, faTrash, faSearch, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';

const ApartmentForm = ({ editingApartment, formData, setFormData, loading, onSubmit, onCancel }) => {
    const [activeTab, setActiveTab] = useState('basic');
    const [iconPickerOpen, setIconPickerOpen] = useState(false);
    const [currentIconField, setCurrentIconField] = useState(null);
    const [currentIconIndex, setCurrentIconIndex] = useState(null);
    const [iconSearch, setIconSearch] = useState('');

    const allIcons = Object.keys(solidIcons)
        .filter(key => key.startsWith('fa') && key !== 'fas' && key !== 'prefix')
        .map(key => ({ name: key, icon: solidIcons[key] }));

    const filteredIcons = allIcons.filter(icon =>
        icon.name.toLowerCase().includes(iconSearch.toLowerCase())
    );

    const addArrayItem = (field) => {
        setFormData({
            ...formData,
            [field]: [...(formData[field] || []), { icon: '', text: '' }]
        });
    };

    const updateArrayItem = (field, index, key, value) => {
        const updatedArray = [...(formData[field] || [])];
        updatedArray[index][key] = value;
        setFormData({ ...formData, [field]: updatedArray });
    };

    const removeArrayItem = (field, index) => {
        const updatedArray = [...(formData[field] || [])];
        updatedArray.splice(index, 1);
        setFormData({ ...formData, [field]: updatedArray });
    };

    const openIconPicker = (field, index) => {
        setCurrentIconField(field);
        setCurrentIconIndex(index);
        setIconPickerOpen(true);
        setIconSearch('');
    };
    const closeIconPicker = () => setIconPickerOpen(false);
    const selectIcon = (iconName) => {
        if (currentIconField && currentIconIndex !== null) {
            updateArrayItem(currentIconField, currentIconIndex, 'icon', iconName);
        }
        closeIconPicker();
    };

    const tabs = [
        { id: 'basic', label: 'Basic Info' },
        { id: 'features', label: 'Features' },
        { id: 'inclusions', label: 'What\'s Included' },
        { id: 'rules', label: 'House Rules' },
        { id: 'whyBook', label: 'Why Book' },
        { id: 'policies', label: 'Policies' },
    ];

    const renderArrayField = (field, title, placeholderIcon, placeholderText) => (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-neutral-50">{title}</h4>
                <button
                    type="button"
                    onClick={() => addArrayItem(field)}
                    className="flex items-center space-x-2 bg-neutral-700 hover:bg-neutral-600 px-3 py-1 rounded text-sm text-neutral-50"
                >
                    <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                    <span>Add</span>
                </button>
            </div>

            <div className="space-y-2 max-h-125 overflow-y-auto">
                {(formData[field] || []).map((item, index) => (
                    <div key={index} className="flex space-x-2 items-start p-3 border border-neutral-700 rounded-lg">
                        <div className="flex-1 space-y-2">
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => openIconPicker(field, index)}
                                    className="bg-neutral-700 hover:bg-neutral-600 px-3 py-2 rounded text-sm text-neutral-50 flex items-center justify-center min-w-28"
                                >
                                    {item.icon ? (
                                        <FontAwesomeIcon icon={solidIcons[item.icon]} className="w-5 h-5" />
                                    ) : (
                                        <span>Choose Icon</span>
                                    )}
                                </button>
                                <input
                                    type="text"
                                    readOnly
                                    placeholder={placeholderIcon}
                                    value={item.icon || ''}
                                    className="flex-1 p-2 rounded border border-neutral-700 bg-neutral-800 text-neutral-50 text-sm"
                                />
                            </div>
                            <input
                                type="text"
                                placeholder={placeholderText}
                                value={item.text || ''}
                                onChange={(e) => updateArrayItem(field, index, 'text', e.target.value)}
                                className="w-full p-2 rounded border border-neutral-700 bg-neutral-800 text-neutral-50 text-sm"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => removeArrayItem(field, index)}
                            className="text-red-400 hover:text-red-300 p-2"
                        >
                            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderPreviewSection = (field, title) => {
        const items = formData[field] || [];
        if (items.length === 0) return null;

        return (
            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-neutral-50 mb-3">{title}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                    {items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 bg-neutral-900 rounded-lg px-3 py-2">
                            <FontAwesomeIcon
                                icon={solidIcons[item.icon] || faCircleCheck}
                                className="text-emerald-400 w-4 h-4"
                            />
                            <span className="text-neutral-300 text-sm">{item.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderPolicyPreview = () => (
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-neutral-50 mb-3">Policies</h3>
            <p className="text-neutral-300 text-sm mb-2">
                <strong>Cancellation:</strong> {formData.policies?.cancellation || '—'}
            </p>
            <p className="text-neutral-300 text-sm">
                <strong>Booking:</strong> {formData.policies?.booking || '—'}
            </p>
        </div>
    );

    const renderIconPicker = () => iconPickerOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 p-6 rounded-xl border border-white/10 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-neutral-50">Choose an Icon</h3>
                    <button onClick={closeIconPicker} className="text-neutral-400 hover:text-neutral-50">
                        <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
                    </button>
                </div>

                <div className="relative mb-4">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search icons..."
                        value={iconSearch}
                        onChange={(e) => setIconSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-50"
                    />
                </div>

                <div className="flex-1 overflow-y-auto grid grid-cols-8 gap-3">
                    {filteredIcons.map(({ name, icon }) => (
                        <button key={name} type="button" onClick={() => selectIcon(name)}
                            className="flex flex-col items-center p-2 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 transition-colors group">
                            <FontAwesomeIcon icon={icon} className="text-neutral-300 group-hover:text-white w-5 h-5 mb-1" />
                            <span className="text-[10px] text-neutral-400 truncate w-full text-center">{name.replace('fa', '')}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
                <div className="bg-neutral-900 p-6 rounded-xl border border-white/10 w-full max-w-6xl min-h-[80vh] flex flex-col shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-neutral-50">
                            {editingApartment ? 'Edit Apartment' : 'Add New Apartment'}
                        </h3>
                        <button onClick={onCancel} className="text-neutral-400 hover:text-neutral-50">
                            <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-neutral-700 mb-4">
                        <div className="flex space-x-1 overflow-x-auto">
                            {tabs.map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tab.id
                                        ? 'bg-neutral-800 text-neutral-50 border-b-2 border-neutral-50'
                                        : 'text-neutral-400 hover:text-neutral-300 hover:bg-neutral-800'
                                        }`}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content with Preview */}
                    <div className="flex-1 flex gap-6 overflow-y-auto">
                        {/* Left Form */}
                        <div className="flex-1 overflow-y-auto pr-4">
                            <form onSubmit={onSubmit} className="space-y-4">
                                {activeTab === 'basic' && (
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            placeholder="Title"
                                            value={formData.title || ''}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full p-2 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                                            required
                                        />
                                        <textarea
                                            placeholder="Description"
                                            value={formData.description || ''}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full p-2 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-50 h-24 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Location"
                                            value={formData.location || ''}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full p-2 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                                            required
                                        />
                                        <input
                                            type="number"
                                            placeholder="Price per night"
                                            value={formData.price_per_night || ''}
                                            onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                                            className="w-full p-2 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                                            required
                                            min="0"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max Guests"
                                            value={formData.max_guests || ''}
                                            onChange={(e) => setFormData({ ...formData, max_guests: e.target.value })}
                                            className="w-full p-2 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                                            required
                                            min="1"
                                        />
                                        <input
                                            type="url"
                                            placeholder="Image URL"
                                            value={formData.image_url || ''}
                                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                            className="w-full p-2 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                                        />
                                        <label className="flex items-center space-x-2 text-neutral-50">
                                            <input
                                                type="checkbox"
                                                checked={formData.available || false}
                                                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                                                className="rounded"
                                            />
                                            <span>Available</span>
                                        </label>
                                    </div>
                                )}
                                {activeTab === 'features' &&
                                    renderArrayField('features', 'Apartment Features', 'wifi', 'Free WiFi')}
                                {activeTab === 'inclusions' &&
                                    renderArrayField('inclusions', "What's Included", 'car', 'Free Parking')}
                                {activeTab === 'rules' &&
                                    renderArrayField('rules', 'House Rules', 'ban', 'No smoking')}
                                {activeTab === 'whyBook' &&
                                    renderArrayField('whyBook', 'Why Book With Us', 'star', 'Best Price')}
                                {activeTab === 'policies' && (
                                    <div className="space-y-4">
                                        <textarea
                                            placeholder="Cancellation Policy"
                                            value={formData.policies?.cancellation || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                policies: { ...formData.policies, cancellation: e.target.value }
                                            })}
                                            className="w-full p-2 rounded border border-neutral-700 bg-neutral-800 text-neutral-50 h-20"
                                        />
                                        <textarea
                                            placeholder="Booking Policy"
                                            value={formData.policies?.booking || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                policies: { ...formData.policies, booking: e.target.value }
                                            })}
                                            className="w-full p-2 rounded border border-neutral-700 bg-neutral-800 text-neutral-50 h-20"
                                        />
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Right Preview */}
                        <div className="w-[45%] bg-neutral-900 border border-neutral-800 rounded-lg p-4 overflow-y-auto">
                            {activeTab !== 'basic' ? (
                                <>
                                    {activeTab === 'features' && renderPreviewSection('features', 'Features & Amenities')}
                                    {activeTab === 'inclusions' && renderPreviewSection('inclusions', "What's Included")}
                                    {activeTab === 'rules' && renderPreviewSection('rules', 'House Rules')}
                                    {activeTab === 'whyBook' && renderPreviewSection('whyBook', 'Why Book With Us')}
                                    {activeTab === 'policies' && renderPolicyPreview()}
                                </>
                            ) : (
                                <div className="text-neutral-500 text-center italic py-20">

                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex space-x-2 pt-4 border-t border-neutral-700 mt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            onClick={onSubmit}
                            className="flex-1 bg-neutral-700 hover:bg-neutral-600 px-4 py-2 rounded text-neutral-50 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : editingApartment ? 'Update Apartment' : 'Create Apartment'}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 bg-neutral-700 hover:bg-neutral-600 px-4 py-2 rounded text-neutral-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>

            {renderIconPicker()}
        </>
    );
};

export default ApartmentForm;