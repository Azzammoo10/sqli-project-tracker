// @ts-nocheck
import { useState } from "react";
import { Link } from "react-router";
import NavItems from "./NavItems";
import { cn } from "~/lib/utils";

const MobileSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => setIsOpen((prev) => !prev);
    const closeSidebar = () => setIsOpen(false);

    return (
        <div className="mobile-sidebar wrapper">
            {/* Header */}
            <header className="flex items-center justify-between p-4 bg-white shadow">
                <Link to="/" onClick={closeSidebar}>
                    <img
                        src="/assets/images/SQLI-LOGO.png"
                        alt="Logo"
                        className="h-5 w-auto object-contain"
                    />
                </Link>
                <button onClick={toggleSidebar} aria-label="Menu">
                    <img src="/assets/icons/menu.svg" alt="" className="size-7" aria-hidden />
                </button>
            </header>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={closeSidebar}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="p-4">
                    <NavItems handleClick={closeSidebar} />
                </div>
            </aside>
        </div>
    );
};

export default MobileSidebar;
