'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    faBook,
    faHome,
    faUser,
    faCalendarAlt,
    faBuilding,
    faStar,
    faUserCog,
    faShield,
    faCircleInfo,
    faPeopleGroup,
    faInfo,
    faBookJournalWhills,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export default function NavBar({ activeTab, setActiveTab }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [profile, setProfile] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsAuthenticated(!!token);

        router.prefetch("/signin");
        router.prefetch("/profile");

        if (token) {
            fetch("/api/profile", {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => {
                    if (data.user) {
                        setProfile(data.user); // ✅ only store the user object
                        console.log("Profile loaded:", data.user);
                    } else {
                        router.push("/signin");
                    }
                })
                .catch(() => router.push("/signin"));
        } else {
            router.push("/signin");
        }
    }, [router]);

    const toggleSidebar = () => {
        setSidebarOpen(prev => !prev);
    };

    const tabRouteMap = {
        home: "/",
        learn: "/#how-it-works",
        choice: "/#features",
        contact: "/#contact",
        about: "/#about",
        review: "/#reviews",
        book: "/terms",
        profile: "/profile",
        login: "/signin",
    };

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);

        const route = tabRouteMap[tabId] || "/";
        router.push(route); // works for both normal pages and hash routes
    };
    

    const tabs = [
        { id: "home", label: "Home" },
        { id: "learn", label: "How It Works" },
        { id: "choice", label: "Why Choose Us" },
        { id: "contact", label: "Contact Us" },
        { id: "about", label: "About Us" },
        { id: "review", label: "Reviews" },
        { id: "book", label: "Privacy Policy" },
    ];

    const sidebarMenu = [
        { href: '/#', icon: faBookJournalWhills, label: "How It Works" },
        { href: '/#features', icon: faStar, label: "Why Choose Us" },
        { href: '/#', icon: faBuilding, label: "Contact Us" },
        { href: '/#', icon: faPeopleGroup, label: "About Us" },
        { href: '/#reviews', icon: faStar, label: "Reviews" },
        { href: '/terms', icon: faShield, label: "Privacy Policy" },
    ];

    return (
        <>
            {/* Top Nav */}
            <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-[#1E675E] via-gray-500 to-indigo-900 border-b border-white/20 shadow-lg">
                <div className="w-full max-w-[1500px] mx-auto px-3 py-2 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        {/* Hamburger */}
                        <div
                            onClick={toggleSidebar}
                            className="flex flex-col justify-center gap-[5px] cursor-pointer group lg:hidden"
                        >
                            <span className="w-7 h-[3px] bg-white rounded-full group-hover:scale-x-125 transition-transform duration-300"></span>
                            <span className="w-5 h-[3px] bg-white rounded-full group-hover:scale-x-110 transition-transform duration-300"></span>
                            <span className="w-6 h-[3px] bg-white rounded-full group-hover:scale-x-125 transition-transform duration-300"></span>
                        </div>
                        <h1 className="text-white text-2xl font-bold tracking-tight">Rooms4u</h1>
                    </div>

                    <div className="flex gap-4 max-lg:hidden">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabClick(tab.id)}
                                    className={`flex items-center transition-all duration-300 ${isActive
                                        ? "text-green-300 underline"
                                        : "text-white hover:text-green-300"
                                        }`}
                                >
                                    <span className="text-sm">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {!isAuthenticated && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => router.push('/register')}
                                className="rounded-full px-5 py-2 text-orange-300 hover:text-orange-100 bg-black/30 hover:bg-white/10"
                            >
                                Sign Up
                            </button>
                            <button
                                onClick={() => router.push('/signin')}
                                className="rounded-full px-5 py-2 text-blue-300 hover:text-blue-100 bg-black/30 hover:bg-white/10"
                            >
                                Login
                            </button>
                        </div>
                    )}

                    {isAuthenticated && profile && (
                        <div className="text-whhite flex items-center gap-2 bg-white/20 p-2 rounded-full" onClick={() => router.push("/profile") }>
                            <div className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center text-xl font-bold text-whhite">
                                {profile?.name?.charAt(0)}
                            </div>
                            <div>
                                <p
                                    className="text-lg font-semibold truncate max-w-[100px] text-whhite min-lg:max-w-full"
                                    title={profile?.name}
                                >
                                    {profile?.name}
                                </p>

                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full bg-gradient-to-r from-[#1E675E] to-gray-700 text-white z-50 transition-transform duration-500
                w-80 p-3
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="flex justify-between items-center p-1">
                    <h2 className="text-2xl font-extrabold">Rooms4u</h2>
                    <button onClick={toggleSidebar} className="text-3xl focus:outline-none">
                        &times;
                    </button>
                </div>

                <ul className="mt-1 space-y-2 p-2">
                    {sidebarMenu.map((item, idx) => (
                        <li key={idx} className="p-3 rounded-lg bg-white/20 hover:bg-white/30">
                            <Link href={item.href} className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
                                <FontAwesomeIcon icon={item.icon} className="mr-2 ml-2" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}
