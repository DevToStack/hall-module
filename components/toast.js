// components/Toast.jsx
"use client";
import { useEffect } from "react";

export default function Toast({ message, type = "error", onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000); // auto-close after 3s
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-5 right-5 z-50">
            <div
                className={`px-4 py-3 rounded-lg shadow-lg text-white text-sm animate-slide-up 
          ${type === "error" ? "bg-red-600" : "bg-green-600"}
        `}
            >
                {message}
            </div>
        </div>
    );
}
