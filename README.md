# 🏡 Apartment Booking Platform

A full-stack **Apartment Booking Website** built with **Next.js**, **Node.js**, and **MySQL**.  
The platform allows users to register/login (with OTP & Google support), browse apartments, make bookings, complete payments, and manage their reservations through a **profile dashboard**.

---

## 🚀 Features

### 🔐 Authentication
- Email + password login and registration
- OTP verification via Gmail
- Google authentication (OAuth2)
- JWT-based session management
- Device tracking (verified devices list in profile)

### 🏠 Home Page
- Apartment listing with availability status
- Interactive booking form with date-range selector
- Calendar showing booked and available dates
- Dynamic pricing and availability check
- Razorpay payment integration

### 📊 Dashboard / Profile
- User details & verified devices
- Active, pending, and cancelled bookings
- Transaction & payment history (Paid, Pending, Refunded)
- Refund status and receipts (PDF with Puppeteer)
- Quick links and account settings
- Danger zone for account deletion / device logout

---

## 🛠️ Tech Stack

- **Frontend:** [Next.js 14](https://nextjs.org/), React, Tailwind CSS  
- **Backend:** Node.js, Express.js, REST APIs  
- **Database:** MySQL  
- **Payments:** Razorpay  
- **Auth:** JWT, Google OAuth, Email OTP  
- **PDF Generation:** Puppeteer  

---

## 📂 Project Structure

