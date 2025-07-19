const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-10 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

                    {/* Branding */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">MyHall</h2>
                        <p className="text-gray-400">Your trusted place for seamless hall booking and event management.</p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#" className="hover:text-white transition">Home</a></li>
                            <li><a href="#" className="hover:text-white transition">Book Now</a></li>
                            <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                            <li><a href="#" className="hover:text-white transition">FAQs</a></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li>Email: contact@myhall.com</li>
                            <li>Phone: +1 (234) 567-8901</li>
                            <li>Location: 123 Main St, City, Country</li>
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Follow Us</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="hover:text-blue-400 transition">Facebook</a>
                            <a href="#" className="hover:text-pink-400 transition">Instagram</a>
                            <a href="#" className="hover:text-blue-300 transition">Twitter</a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} MyHall. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
  