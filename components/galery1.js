
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const images = [
    '/image1.jpg',
    '/image2.jpg',
    '/image3.jpg',
    '/image4.jpg',
    '/image5.jpg',
    '/image6.jpg',
    '/image7.jpg',
    '/image8.jpg',
];

const GallerySection = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [groupStart, setGroupStart] = useState(0);
    const groupSize = 4;

    // Auto-rotate images every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            const nextIndex = (currentIndex + 1) % images.length;
            setCurrentIndex(nextIndex);

            // Slide thumbnail group if needed
            if (nextIndex >= groupStart + groupSize || nextIndex < groupStart) {
                setGroupStart(Math.floor(nextIndex / groupSize) * groupSize);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [currentIndex, groupStart]);

    const handleThumbnailClick = (index) => {
        setCurrentIndex(index);
        if (index >= groupStart + groupSize || index < groupStart) {
            setGroupStart(Math.floor(index / groupSize) * groupSize);
        }
    };

    const currentThumbnails = images.slice(groupStart, groupStart + groupSize);

    return (
        <section className="h-md py-12 px-4 sm:px-8 lg:px-20 flex flex-col lg:flex-row items-center gap-8">
            {/* Left - Main Image */}
            <div className="w-full h-full lg:w-1/2">
                <div className="relative aspect-[10/7] rounded-xl overflow-hidden shadow-lg border-2 border-blue-300">
                    <AnimatePresence mode="sync">
                        <motion.div
                            key={images[currentIndex]}
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ duration: 0.8, ease: 'easeInOut' }}
                            className="absolute top-0 left-0 w-full h-full"
                        >
                            <img
                                src={images[currentIndex]}
                                alt={`Slide ${currentIndex + 1}`}
                                className="object-cover w-full h-full"
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Right - Thumbnails */}
            <div className="aspect=[8/5] lg:w-1/2 overflow-hidden">
                <AnimatePresence mode="sync">
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ duration: 0.8, ease: 'easeInOut' }}
                        className="grid grid-cols-2 grid-rows-2 gap-4"
                    >
                        {currentThumbnails.map((img, idx) => {
                            const actualIndex = groupStart + idx;
                            return (
                                <div
                                    key={img}
                                    onClick={() => handleThumbnailClick(actualIndex)}
                                    className={`rounded-xl overflow-hidden cursor-pointer border-3 transition-all duration-100 ${actualIndex === currentIndex ? 'border-blue-400' : 'border-transparent'
                                        }`}
                                >
                                    <img
                                        src={img}
                                        alt={`Thumbnail ${actualIndex + 1}`}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
                
            </div>
        </section>
    );
};

export default GallerySection;
