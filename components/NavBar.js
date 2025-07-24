// components/NavBar.jsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    faBook,
    faHome,
    faUser,
    faCalendarAlt,
    faBuilding,
    faStar,
    faUserCog,
    faUserPen,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function NavBar({ activeTab, setActiveTab, onBookClick }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { data: session, status } = useSession();
    const router = useRouter();

    const toggleSidebar = () => setSidebarOpen((prev) => !prev);

    const handleTabClick = (tabId) => {
        if (tabId === "book") onBookClick?.();
        else if (tabId === "login") router.push("/auth");
        else if (tabId === "profile") router.push("/profile");
        setActiveTab(tabId);
    };

    const tabs = [
        { id: "home", label: "Home", icon: faHome },
        { id: "book", label: "Book", icon: faBook },
        { id: "support", label: "Support", icon: faUserPen },
        status === "authenticated"
            ? { id: "profile", label: "Profile", icon: faUser }
            : { id: "login", label: "Login", icon: faUser },
    ];

    const sidebarMenu = [
        { icon: faHome, label: "Home" },
        { icon: faCalendarAlt, label: "Bookings" },
        { icon: faBuilding, label: "Halls" },
        { icon: faStar, label: "Reviews" },
        { icon: faUserCog, label: "Account" },
    ];

    return (
        <>
            {/* Top Nav */}
            <nav className="fixed top-0 left-0 w-full z-50 bg-black border-b border-white/20 shadow-lg">
                <div className="w-full mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        {/* Hamburger for small screens */}
                        <div
                            onClick={toggleSidebar}
                            className="flex flex-col justify-center gap-[5px] cursor-pointer group lg:hidden"
                        >
                            <span className="w-7 h-[3px] bg-white rounded-full group-hover:scale-x-125 transition-transform duration-300"></span>
                            <span className="w-5 h-[3px] bg-white rounded-full group-hover:scale-x-110 transition-transform duration-300"></span>
                            <span className="w-6 h-[3px] bg-white rounded-full group-hover:scale-x-125 transition-transform duration-300"></span>
                        </div>
                        <h1 className="text-white text-2xl font-extrabold tracking-tight">MyHall</h1>
                    </div>

                    <div className="flex gap-6 max-sm:gap-2">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;                       
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabClick(tab.id)}
                                    className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${isActive
                                            ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg scale-105"
                                            : "text-white/80 hover:bg-white/10 hover:text-white"
                                        }`}
                                >
                                    <FontAwesomeIcon icon={tab.icon} className="w-4 h-4" />
                                    <span className="hidden sm:inline font-semibold">{tab.label}</span>
                                </button>
                            );
                        })}                       
                    </div>
                </div>
            </nav>

            {/* Sidebar (conditional for screen size) */}
            <div
                className={`fixed top-0 left-0 h-full bg-black text-white z-50 shadow transition-transform duration-300
          w-80 lg:w-90 lg:shadow-white rounded-r-xl p-3
          ${sidebarOpen ? "translate-x-0 shadow-white" : "-translate-x-full"} lg:translate-x-0`}
            >
                <div className="flex justify-between items-center p-4">
                    <h2 className="text-2xl font-extrabold">MyHall</h2>
                    <button
                        onClick={toggleSidebar}
                        className="text-3xl focus:outline-none lg:hidden"
                    >
                        &times;
                    </button>
                </div>

                <ul className="mt-1 space-y-2 p-2">
                    {sidebarMenu.map((item, idx) => (
                        <li
                            key={idx}
                            className="flex items-center gap-3 p-3 hover:bg-gray-700 cursor-pointer bg-white/20 rounded-lg"
                        >
                            <FontAwesomeIcon icon={item.icon} />
                            <span className="font-medium">{item.label}</span>
                        </li>
                    ))}
                </ul>
            </div>

        </>
    );
}
