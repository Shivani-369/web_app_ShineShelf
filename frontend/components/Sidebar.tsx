import React from 'react';
import Link from 'next/link';

export default function Sidebar() {
    return (
        <div className="w-64 bg-neutral-900 border-neutral-800 border-r border-gray-100 h-screen fixed left-0 top-0 flex flex-col">
            <div className="p-6 border-b border-gray-100">
                <h1 className="text-xl font-bold text-blue-900">ShineShelf</h1>
            </div>

            <nav className="flex-1 p-4 espacio-y-2">
                <Link href="/" className="flex items-center space-x-3 px-4 py-3 bg-blue-50 text-blue-900 rounded-lg transition-colors">
                    <span className="font-medium">Dashboard</span>
                </Link>
                <Link href="/books" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <span className="font-medium">Books Catalogue</span>
                </Link>

            </nav>

            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">U</div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">User Name</p>
                        <p className="text-xs text-gray-500">Member</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
