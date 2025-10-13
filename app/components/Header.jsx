// components/Header.jsx
'use client'

import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faTimes, faBuilding, faStar, faCrown } from '@fortawesome/free-solid-svg-icons'
import dynamic from 'next/dynamic'

// Import Framer Motion normally for now to avoid build issues
import { motion, AnimatePresence } from 'framer-motion';

export default function Header({
    navItems = ['Features', 'Apartments', 'How It Works', 'For Hosts'],
    authButtons = true,
    logo = { name: 'LuxStay', showStar: true },
    transparentOnScroll = true,
    className = ''
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        if (!transparentOnScroll) {
            setIsScrolled(true)
            return
        }

        const handleScroll = () => setIsScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [transparentOnScroll])

    return (
        <header
            className={`fixed top-0 w-screen z-50 transition-all duration-300 ${className} ${transparentOnScroll
                ? (isScrolled
                    ? 'bg-neutral-900 backdrop-blur-2xl border-b border-neutral-800 shadow-2xl'
                    : 'bg-transparent border-b border-white/10 backdrop-blur-sm')
                : 'bg-neutral-900 backdrop-blur-2xl border-b border-neutral-800 shadow-2xl'
                }`}
        >
            <nav className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-14">
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center group cursor-pointer"
                    >
                        <div className="relative">
                            <FontAwesomeIcon
                                icon={faBuilding}
                                className="h-8 w-8 text-teal-400 transform group-hover:scale-110 transition-transform duration-300"
                            />
                            <motion.div
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.5 }}
                                className="absolute -top-1 -right-1"
                            >
                                <FontAwesomeIcon icon={faCrown} className="h-3 w-3 text-teal-300" />
                            </motion.div>
                        </div>
                        <span
                            className={`ml-3 text-2xl font-bold transition-colors duration-300 ${isScrolled ? 'text-white' : 'text-white'
                                }`}
                        >
                            {logo.name}
                        </span>
                        {logo.showStar && (
                            <div className="ml-2 hidden sm:block">
                                <FontAwesomeIcon icon={faStar} className="h-3 w-3 text-teal-400 animate-pulse" />
                            </div>
                        )}
                    </motion.div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navItems.map((item, index) => (
                            <motion.a
                                key={item}
                                href={`#${item.toLowerCase().replace(' ', '-')}`}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative font-medium text-gray-200 hover:text-teal-400 transition-all duration-100 group"
                            >
                                {item}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-400 group-hover:w-full transition-all duration-100"></span>
                            </motion.a>
                        ))}
                    </div>

                    {/* Auth Buttons */}
                    {authButtons && (
                        <div className="hidden md:flex items-center space-x-4">
                            <motion.button
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="px-6 py-2 rounded-xl font-medium text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-300"
                            >
                                Login
                            </motion.button>
                            <motion.button
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                whileHover={{ scale: 1.05, boxShadow: '0 10px 30px -10px rgba(14,203,199,0.5)' }}
                                className="bg-teal-400 text-neutral-900 font-semibold px-6 py-2 rounded-xl hover:shadow-2xl transition-all duration-300"
                            >
                                Sign Up
                            </motion.button>
                        </div>
                    )}

                    {/* Mobile menu button */}
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="md:hidden p-2 rounded-lg backdrop-blur-sm text-white"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} className="h-6 w-6" />
                    </motion.button>
                </div>

                {/* Mobile Navigation */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.1 }}
                            className="md:hidden overflow-hidden"
                        >
                            <div className="py-6 border-t border-white/20 bg-neutral-900/80 backdrop-blur-2xl mt-2">
                                <div className="flex flex-col space-y-6">
                                    {navItems.map((item, index) => (
                                        <motion.a
                                            key={item}
                                            href={`#${item.toLowerCase().replace(' ', '-')}`}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="text-white hover:text-teal-400 transition-colors duration-100 font-medium text-lg"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {item}
                                        </motion.a>
                                    ))}
                                    {authButtons && (
                                        <div className="flex flex-col space-y-4 pt-6 border-t border-white/20">
                                            <motion.button
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.4 }}
                                                className="text-white hover:text-teal-400 transition-colors duration-100 font-medium text-left py-2"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                Login
                                            </motion.button>
                                            <motion.button
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.5 }}
                                                whileHover={{ scale: 1.02 }}
                                                className="bg-teal-400 text-neutral-900 font-semibold py-3 rounded-xl text-center"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                Sign Up
                                            </motion.button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Decorative floating elements */}
            {!isScrolled && transparentOnScroll && (
                <>
                    <div className="absolute top-0 left-0 w-32 h-32 bg-teal-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                </>
            )}
        </header>
    )
}