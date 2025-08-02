'use client';

import React from 'react';

export default function LegalPage() {
    return (
        <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 text-gray-800">
            <div className="max-w-7xl mx-auto bg-white shadow-md rounded-2xl p-8 space-y-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Legal Information</h1>

                {/* In-page Navigation */}
                <nav className="text-sm border-b pb-4 flex flex-wrap gap-4 text-blue-600 font-medium">
                    <a href="#terms" className="hover:underline">Terms & Conditions</a>
                    <a href="#privacy" className="hover:underline">Privacy Policy</a>
                    <a href="#refund" className="hover:underline">Refund Policy</a>
                    <a href="#rules" className="hover:underline">Guest Rules</a>
                </nav>

                {/* === Terms & Conditions === */}
                <Section id="terms" title="Terms & Conditions">
                    <p>
                        These Terms & Conditions govern your access to and use of our apartment booking services. By using our platform, you accept and agree to comply with these terms.
                    </p>
                    <ul>
                        <li><strong>Booking Confirmation:</strong> Bookings are confirmed only after full or partial payment is received and verified. A confirmation email will be sent.</li>
                        <li><strong>Eligibility:</strong> You must be at least 18 years old to make a reservation.</li>
                        <li><strong>Identification:</strong> Valid government ID is required at check-in. The name must match the booking details.</li>
                        <li><strong>Check-In/Out:</strong> Check-in is usually from 2 PM; check-out is by 11 AM. Early check-in/late check-out is subject to availability and fees.</li>
                        <li><strong>Right to Refuse:</strong> We reserve the right to cancel or refuse any booking that violates our policies or seems fraudulent.</li>
                        <li><strong>Disruptive Behavior:</strong> Any illegal activity or abuse toward staff, guests, or property will result in immediate cancellation without refund.</li>
                    </ul>
                </Section>

                {/* === Privacy Policy === */}
                <Section id="privacy" title="Privacy Policy">
                    <p>
                        We value your privacy. This Privacy Policy explains how we collect, use, and protect your personal information.
                    </p>
                    <ul>
                        <li><strong>Data Collection:</strong> We collect information when you register, book a room, or contact support. This includes name, email, phone, ID, and booking details.</li>
                        <li><strong>Usage:</strong> Your data is used to manage bookings, send confirmations, respond to inquiries, and improve services.</li>
                        <li><strong>Cookies:</strong> We use cookies to personalize your experience and analyze traffic. You can disable them in your browser settings.</li>
                        <li><strong>Data Sharing:</strong> We do not sell your data. We may share it only with trusted providers (e.g., payment gateways, hosting platforms) as necessary.</li>
                        <li><strong>Security:</strong> All sensitive information is encrypted and stored securely.</li>
                        <li><strong>Your Rights:</strong> You may request access, correction, or deletion of your data by contacting us at [support@example.com].</li>
                    </ul>
                </Section>

                {/* === Refund Policy === */}
                <Section id="refund" title="Refund Policy">
                    <p>
                        Our refund policy ensures clarity for guests and hosts. Refund eligibility depends on the cancellation time and the listing’s cancellation terms.
                    </p>
                    <ul>
                        <li><strong>Flexible:</strong> Full refund for cancellations made more than 7 days before check-in. 50% refund if canceled 3–6 days before. No refund within 48 hours of check-in.</li>
                        <li><strong>Moderate:</strong> 50% refund if canceled at least 5 days before check-in. No refund thereafter.</li>
                        <li><strong>Strict:</strong> No refund after booking confirmation except in verified emergency cases (e.g. natural disaster, hospitalization).</li>
                        <li><strong>Processing:</strong> Refunds are processed within 7–10 business days to your original payment method.</li>
                        <li><strong>Non-Refundable Fees:</strong> Platform service fees, cleaning charges, or third-party transaction costs may not be refundable.</li>
                    </ul>
                </Section>

                {/* === Guest Rules === */}
                <Section id="rules" title="Guest Rules">
                    <p>
                        To ensure a safe and respectful environment for all, guests are expected to follow these rules during their stay.
                    </p>
                    <ul>
                        <li><strong>No Smoking:</strong> Smoking is strictly prohibited inside the apartment unless stated otherwise.</li>
                        <li><strong>No Parties:</strong> Loud music, parties, or events that disturb neighbors are not allowed.</li>
                        <li><strong>Occupancy Limit:</strong> Do not exceed the maximum number of guests listed on your booking.</li>
                        <li><strong>Cleanliness:</strong> Please maintain basic cleanliness. Excessive mess may result in cleaning charges.</li>
                        <li><strong>Damage:</strong> Any damage or theft must be reported. Repair or replacement costs may be charged to the guest.</li>
                        <li><strong>Pets:</strong> Only allowed in listings that explicitly mention pet-friendliness.</li>
                        <li><strong>Emergency Contact:</strong> In case of emergency, call 112 or contact local authorities.</li>
                    </ul>
                </Section>

                <p className="text-xs text-gray-400 pt-8 border-t">
                    Last updated: July 30, 2025
                </p>
            </div>
        </div>
    );
}

function Section({ id, title, children }) {
    return (
        <section id={id} className="scroll-mt-20 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
            <div className="text-sm text-gray-700 space-y-3">
                {children}
            </div>
        </section>
    );
}
