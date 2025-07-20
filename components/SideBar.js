
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHome,
    faCalendarAlt,
    faBuilding,
    faStar,
    faUserCog,
    faTimes,
} from '@fortawesome/free-solid-svg-icons';

export default function Sidebar({ isOpen, onClose }) {
    const menuItems = [
        { icon: faHome, label: 'Home' },
        { icon: faCalendarAlt, label: 'Bookings' },
        { icon: faBuilding, label: 'Halls' },
        { icon: faStar, label: 'Reviews' },
        { icon: faUserCog, label: 'Account' },
    ];

    return (
        <div
            className={`fixed top-0 left-0 h-full w-75 bg-black text-white shadow-lg z-60 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
        >
            <div className="flex justify-between items-center p-4">
                <h2 className="text-2xl font-extrabold">MyHall</h2>
                <button onClick={onClose} className="text-3xl focus:outline-none">
                    ×
                </button>
            </div>

            <ul className="mt-1 space-y-2 p-2">
                {menuItems.map((item, idx) => (
                    <li
                        key={idx}
                        className="flex items-center gap-3 p-2 hover:bg-gray-700 cursor-pointer bg-white/20 rounded-lg"
                    >
                        <FontAwesomeIcon icon={item.icon} />
                        <span className="font-medium">{item.label}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
