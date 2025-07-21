'use client';

import { useState } from "react";
import { faBook, faHome, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Sidebar from "./SideBar";

const NavBar = () => {
    const [activeTab, setActiveTab] = useState("home");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const tabs = [
        { id: "home", label: "Home", icon: faHome },
        { id: "book", label: "Book", icon: faBook },
        { id: "login", label: "Login", icon: faUser },
    ];

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <>
            <nav className="fixed top-0 left-0 w-full z-50 bg-black border-b border-white/20 shadow-lg">
                <div className="w-full mx-auto px-4 py-3 flex justify-between items-center">
                    {/* Hamburger + Logo */}
                    <div className="flex items-center gap-3">
                        <div
                            onClick={toggleSidebar}
                            className="flex flex-col justify-center gap-[5px] cursor-pointer group"
                        >
                            <span className="w-7 h-[3px] bg-white rounded-full group-hover:scale-x-125 transition-transform duration-300"></span>
                            <span className="w-5 h-[3px] bg-white rounded-full group-hover:scale-x-110 transition-transform duration-300"></span>
                            <span className="w-6 h-[3px] bg-white rounded-full group-hover:scale-x-125 transition-transform duration-300"></span>
                        </div>
                        <h1 className="text-white text-2xl font-extrabold tracking-tight">MyHall</h1>
                    </div>

                    {/* Nav Tabs */}
                    <div className="flex gap-6 max-sm:gap-3">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300
                    ${isActive
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

            {/* Sidebar Component */}
            <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />
        </>
    );
};

export default NavBar;
