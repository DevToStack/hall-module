'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

const images = [
    '/image1.jpg',
    '/image2.jpg',
    '/image3.jpg',
    '/image4.jpg',
    '/image5.jpg',
    '/image6.jpg',
    '/image7.jpg',
    '/image8.jpg',
]

const GallerySection = () => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [groupStart, setGroupStart] = useState(0)
    const [prevGroupStart, setPrevGroupStart] = useState(0)
    const groupSize = 4

    // Auto-slide main image + update group if needed
    useEffect(() => {
        const interval = setInterval(() => {
            const nextIndex = (currentIndex + 1) % images.length
            setCurrentIndex(nextIndex)

            const newGroupStart = Math.floor(nextIndex / groupSize) * groupSize
            if (newGroupStart !== groupStart) {
                setPrevGroupStart(groupStart)
                setGroupStart(newGroupStart)
            }
        }, 4000)

        return () => clearInterval(interval)
    }, [currentIndex, groupStart])

    const handleThumbnailClick = (index) => {
        setCurrentIndex(index)

        const newGroupStart = Math.floor(index / groupSize) * groupSize
        if (newGroupStart !== groupStart) {
            setPrevGroupStart(groupStart)
            setGroupStart(newGroupStart)
        }
    }

    const currentThumbnails = images.slice(groupStart, groupStart + groupSize)
    const isForward = groupStart > prevGroupStart

    return (
        <section className="h-full py-12 px-4 sm:px-8 lg:px-20 flex flex-col lg:flex-row items-center gap-8">
            {/* Left - Main Image */}
            <div className="w-full lg:w-1/2">
                <div className="relative aspect-[10/7] rounded-xl overflow-hidden shadow-lg">
                    <AnimatePresence mode="async">
                        <motion.div
                            key={images[currentIndex]}
                            initial={{ x:'100%' }}
                            animate={{ x:'0%' }}
                            exit={{ x:'-100%' }}
                            transition={{ duration: 1, ease: 'easeInOut' }}
                            className="absolute top-0 left-0 w-full h-full"
                        >
                            <Image
                                src={images[currentIndex]}
                                alt={`Slide ${currentIndex + 1}`}
                                fill
                                className="object-cover"
                                priority
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Right - Thumbnails */}
            <div className="w-full lg:w-1/2 aspect-[10/7.05] overflow-hidden p-2">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={groupStart}
                        initial={{ x: isForward ? '100%' : '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: isForward ? '-100%' : '100%' }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        className="grid grid-cols-2 grid-rows-2 gap-4 h-ful w-full"
                    >
                        {currentThumbnails.map((img, idx) => {
                            const actualIndex = groupStart + idx
                            return (
                                <div
                                    key={img + actualIndex}
                                    onClick={() => handleThumbnailClick(actualIndex)}
                                    className={`relative aspect-[10/7] rounded-xl overflow-hidden cursor-pointer border-3 transition-all duration-200 ${actualIndex === currentIndex
                                            ? 'border-black opacity-65'
                                            : 'border-transparent'
                                        }`}
                                >
                                    <Image
                                        src={img}
                                        alt={`Thumbnail ${actualIndex + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    )
}

export default GallerySection
