"use client";
import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Toast({ message, type = "error", onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, []); // ✅ no [onClose]

    // ✅ Portal renders the toast directly into <body>
    return createPortal(
        <div className="fixed bottom-5 min-sm:right-5 max-sm:top-5 z-[9999] pointer-events-none">
            <div
                className={`px-4 py-3 rounded-xl shadow-lg text-sm text-black animate-slide-up pointer-events-auto border
      ${type === "error"
                        ? "bg-[#FF6B6B]/90 border-[#FF4C4C] text-[#2B0A0A]"   /* Coral red with dark maroon text */
                        : "bg-[#6BFF95]/90 border-[#4CFF6B] text-[#0A2B0A]"       /* Minty green with dark forest text */
                    }`}
            >
                {message}
            </div>
        </div>
,
        document.body
    );
}
