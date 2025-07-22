import { useState } from 'react';
import halls from './halls';

export default function BookingModalForm({ hall, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        date: '',
        guests: '',
        contact: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // In real app: validate and store booking data
        window.location.href = '/payment'; // redirect
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white text-black rounded-xl shadow-xl p-6 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-2 right-4 text-lg font-bold">×</button>
                <h2 className="text-2xl font-bold mb-4">Book {halls.name}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" type="text" placeholder="Your Name" required className="w-full border p-2 rounded" onChange={handleChange} />
                    <input name="contact" type="tel" placeholder="Contact Number" required className="w-full border p-2 rounded" onChange={handleChange} />
                    <input name="date" type="date" required className="w-full border p-2 rounded" onChange={handleChange} />
                    <input name="guests" type="number" min="1" placeholder="Guests" required className="w-full border p-2 rounded" onChange={handleChange} />
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Confirm & Pay</button>
                </form>
            </div>
        </div>
    );
}
