"use client";
import Sidebar from '@/components/Sidebar';
import BookCover from '@/components/BookCover';
import { useEffect, useState } from 'react';

// Mock Data
const BOOKS = [
  { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Classic", rating: 4.8, available: true, cover: "bg-amber-100" },
  { id: 2, title: "Project Hail Mary", author: "Andy Weir", category: "Sci-Fi", rating: 4.9, available: false, cover: "bg-blue-100" },
  { id: 3, title: "Atomic Habits", author: "James Clear", category: "Self-Help", rating: 4.7, available: true, cover: "bg-emerald-100" },
  { id: 4, title: "Dune", author: "Frank Herbert", category: "Sci-Fi", rating: 4.8, available: true, cover: "bg-orange-100" },
  { id: 5, title: "Educated", author: "Tara Westover", category: "Biography", rating: 4.6, available: true, cover: "bg-stone-100" },
  { id: 6, title: "1984", author: "George Orwell", category: "Classic", rating: 4.9, available: true, cover: "bg-red-100" },
];

const CATEGORIES = ["All", "Classic", "Sci-Fi", "Self-Help", "Biography"];

export default function BooksPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const fetchBooks = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/books');
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
        setError(null);
      } else {
        const data = await res.json();
        setError(data.error || 'The server is running but could not fetch books. Please check your database connection.');
      }
    } catch (err) {
      console.error('Failed to fetch books', err);
      setError('Could not connect to the backend server. Please ensure the backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleBorrow = async (bookId: number) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      alert('Please login to borrow books');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/transactions/borrow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookId }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Book borrowed successfully!');
        fetchBooks(); // Refresh list to update availability
      } else {
        alert(data.error || 'Failed to borrow book');
      }
    } catch (err) {
      console.error('Borrow failed', err);
    }
  };

  const categories = ["All", ...Array.from(new Set(books.map(b => b.category)))];

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="p-8 text-center text-neutral-500">Loading library catalogue...</div>;

  if (error) return (
    <div className="p-8 text-center min-h-screen bg-neutral-950 flex flex-col items-center justify-center">
      <div className="bg-red-900/20 border border-red-900/50 p-6 rounded-xl max-w-md">
        <h2 className="text-xl font-bold text-red-500 mb-2">Connection Issue</h2>
        <p className="text-neutral-400 mb-4">{error}</p>
        <button
          onClick={fetchBooks}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-8 min-h-screen bg-neutral-950">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white/90">Books Catalogue</h1>
          <p className="text-neutral-400 mt-1">Explore our vast collection of knowledge.</p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search books..."
            className="px-4 py-2 bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="px-4 py-2 bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => <option key={cat as string} value={cat as string}>{cat as string}</option>)}
          </select>
        </div>
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBooks.map(book => (
          <div key={book.id} className="bg-neutral-900 rounded-xl shadow-sm border border-neutral-800 overflow-hidden hover:shadow-md transition-shadow group">
            {/* Book Cover */}
            <div className="w-full h-72 mb-4 relative"> {/* Added relative here for absolute positioning of overlay */}
              <BookCover
                src={book.cover_image_url}
                title={book.title}
              />
              {!book.available && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-bold px-3 py-1 bg-red-600 rounded-full text-xs">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
                  {book.category}
                </span>
                <div className="flex items-center text-amber-500 text-sm font-bold">
                  <span>★</span>
                  <span className="ml-1">{book.rating}</span>
                </div>
              </div>

              <h3 className="font-bold text-white text-lg mb-1 leading-tight group-hover:text-blue-400 transition-colors line-clamp-1">
                {book.title}
              </h3>
              <p className="text-neutral-500 text-sm mb-4">{book.author}</p>

              <button
                disabled={!book.available}
                onClick={() => handleBorrow(book.id)}
                className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all ${book.available
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-900/20"
                  : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                  }`}
              >
                {book.available ? "Borrow Now" : "Notify Me"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-20 text-neutral-500">
          <p className="text-xl">No books found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}