import {
    faBed, faBath, faUsers, faUtensils, faWifi,
    faTv, faParking, faBroom, faUmbrellaBeach
} from '@fortawesome/free-solid-svg-icons';

export const apartmentPlans = [
    {
        id: 1,
        title: '1 BHK Comfort',
        price: 3000,
        features: [
            { icon: faBed, text: '1 Bedroom' },
            { icon: faBath, text: '1 Bathroom' },
            { icon: faUsers, text: 'Up to 2 guests' },
            { icon: faUtensils, text: 'Kitchen Access' },
            { icon: faWifi, text: 'Free Wi-Fi' },
        ],
    },
    {
        id: 2,
        title: '2 BHK Deluxe',
        price: 6500,
        features: [
            { icon: faBed, text: '2 Bedrooms' },
            { icon: faBath, text: '2 Bathrooms' },
            { icon: faUsers, text: 'Up to 4 guests' },
            { icon: faUtensils, text: 'Full Kitchen' },
            { icon: faTv, text: 'Smart TV + Wi-Fi' },
            { icon: faParking, text: 'Free Parking' },
        ],
    },
    {
        id: 3,
        title: '3 BHK Premium',
        price: 10000,
        features: [
            { icon: faBed, text: '3 Bedrooms' },
            { icon: faBath, text: '3 Bathrooms' },
            { icon: faUsers, text: 'Up to 6 guests' },
            { icon: faUmbrellaBeach, text: 'Balcony View' },
            { icon: faBroom, text: 'Daily Cleaning' },
            { icon: faWifi, text: 'High-Speed Wi-Fi' },
            { icon: faParking, text: 'Private Parking' },
        ],
    },
];
  