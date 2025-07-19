
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const images = [
    "/image1.jpg",
    "/image2.jpg",
    "/image3.jpg",
    "/image4.jpg",
    "/image5.jpg",
];

const Gallery = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 700,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        responsive: [
            {
                breakpoint: 1024, // for tablets
                settings: {
                    slidesToShow: 2,
                },
            },
            {
                breakpoint: 640, // for mobile
                settings: {
                    slidesToShow: 1,
                },
            },
        ],
    };

    return (
        <section className="py-16 px-4 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">Gallery</h2>
                <Slider {...settings}>
                    {images.map((src, index) => (
                        <div key={index} className="px-3">
                            <div className="rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300">
                                <img
                                    src={src}
                                    alt={`Hall ${index + 1}`}
                                    className="w-full h-64 object-cover"
                                />
                            </div>
                        </div>
                    ))}
                </Slider>
            </div>
        </section>
    );
};

export default Gallery;
