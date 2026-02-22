'use client';

import React, { useState, useEffect } from 'react';
import BookCover from './BookCover';

interface Book {
    id: number;
    title: string;
    author: string;
    cover_image_url?: string;
}

export default function Recommendations({ userId }: { userId: number }) {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-app-shineshelf.onrender.com';

    useEffect(() => {
        const fetchRecs = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/api/recommendations/user`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setBooks(Array.isArray(data) ? data : []);
                } else {
                    setBooks([]);
                }
            } catch (err) {
                console.error('Failed to fetch recommendations', err);
                setBooks([]);
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchRecs();
    }, [userId]);

    if (loading) return <div className="text-neutral-500 mt-8">Loading suggestions...</div>;
    if (!Array.isArray(books) || books.length === 0) return null;

    return (
        <div className="bg-neutral-900 border-neutral-800 rounded-xl p-6 border border-gray-100 shadow-sm mt-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <span className="mr-2">✨</span> Recommended For You
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {books.map((book: any) => (
                    <div key={book.id} className="group cursor-pointer">
                        <div className="w-full h-48 mb-3 relative overflow-hidden rounded-lg">
                            <BookCover
                                src={book.cover_image_url}
                                title={book.title}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                <button className="w-full bg-white text-black text-xs font-bold py-1.5 rounded shadow">
                                    View Detail
                                </button>
                            </div>
                        </div>
                        <h3 className="text-white font-semibold text-sm line-clamp-1">{book.title}</h3>
                        <p className="text-gray-500 text-xs">{book.author}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
