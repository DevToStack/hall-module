'use client'
import { useState } from "react";
import { faBook, faHome, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const NavBar = () => {
    const [activeTab, setActiveTab] = useState("home");

    const tabs = [
        { id: "home", label: "Home", icon: faHome },
        { id: "book", label: "Book", icon: faBook },
        { id: "login", label: "Login", icon: faUser },
    ];

    return (
        <nav className="flex fixed top-0 bg-white text-black w-full p-2 justify-between shadow-sm items-center z-50">
            {/* Left: Logo and Menu */}
            <div className="flex justify-center items-center ml-1">
                <div className="flex flex-col mr-4">
                    <span className="w-8 h-1 bg-black rounded-full"></span>
                    <span className="w-6 h-1 bg-black mt-1 mb-1 rounded-full"></span>
                    <span className="w-6 h-1 bg-black rounded-full"></span>
                </div>
                <h1 className="font-extrabold text-3xl">MyHall</h1>
            </div>

            {/* Right: Navigation Tabs */}
            <div className="flex">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <a
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`group flex items-center justify-center gap-1 p-2 max-sm:rounded-full bg-transparent relative overflow-hidden cursor-pointer transition-colors duration-300 ${isActive ? "text-blue-500" : "text-gray-800"
                                }`}
                        >
                            <span className="flex items-center gap-1 relative z-10">
                                <FontAwesomeIcon icon={tab.icon} className="w-5 h-5" />
                                <span className="max-sm:hidden font-bold">{tab.label}</span>
                            </span>
                            <span
                                className={`absolute bottom-0 left-0 h-[2px] transition-all duration-600 ease-in-out ${isActive
                                        ? "w-md bg-blue-500"
                                        : "w-0 group-hover:w-full bg-blue-500"
                                    }`}
                            ></span>
                        </a>
                    );
                })}
            </div>
        </nav>
    );
};

export default NavBar;
