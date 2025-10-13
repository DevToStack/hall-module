import Link from "next/link";

function NavBar({ username = "Guest" }) {
    const trimmed = username.length > 10 ? username.slice(0, 10) + "…" : username;

    return (
        <nav className="fixed top-0 left-0 w-full bg-black/90 backdrop-blur-sm shadow-lg z-50">
            <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center text-white">
                <div className="flex gap-6">
                    <Link href="/" className="hover:text-teal-400 transition flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>
                        Home
                    </Link>

                    <Link href="/profile" className="hover:text-teal-400 transition flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        Profile
                    </Link>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-teal-500 to-teal-700 text-white flex items-center justify-center font-bold shadow-md">
                        {username[0]}
                    </div>
                    <span className="hidden sm:block font-medium">{trimmed}</span>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;