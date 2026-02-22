"use client";
import React from 'react';
import Sidebar from '@/components/Sidebar';
import DashboardStatCard from '@/components/DashboardStatCard';
import ActiveLoansTable from '@/components/ActiveLoansTable';
import Recommendations from '@/components/Recommendations';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-app-shineshelf.onrender.com';

export default function Home() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({ activeLoans: 0, totalFines: 0 });
    const [loans, setLoans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(true);

    const fetchData = async (currentUser: any) => {
        if (!currentUser?.id) return;

        try {
            const token = localStorage.getItem('token');
            const [statsRes, loansRes] = await Promise.all([
                fetch(`${API_URL}/api/dashboard/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_URL}/api/dashboard/loans`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }

            if (loansRes.ok) {
                const data = await loansRes.json();
                setLoans(Array.isArray(data) ? data : []);
            } else {
                setLoans([]);
            }
        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

        if (token && storedUser.id) {
            setUser(storedUser);
            fetchData(storedUser);
            setVerifying(false);
        } else {
            router.replace('/login');
        }
    }, [router]);

    if (verifying) return null; // Silent redirect, no loading screen as requested.

    const handleReturn = async (transactionId: number) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/transactions/return/${transactionId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchData(user); // Refresh data
            }
        } catch (err) {
            console.error('Failed to return book', err);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 flex">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <header className="mb-8">
                    <h1 className="text-2xl text-white/90 font-bold text-white">Dashboard</h1>
                    <p className="text-neutral-400">Welcome back, happy reading!</p>
                </header>

                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <DashboardStatCard
                        title="Active Loans"
                        value={stats.activeLoans}
                        icon={<span className="text-2xl text-white/90">📚</span>}
                        color="bg-blue-600 text-white shadow-lg border-blue-500"
                    />
                    <DashboardStatCard
                        title="Total Fines"
                        value={`₹${(stats.totalFines ?? 0).toFixed(2)}`}
                        icon={<span className="text-2xl text-white/90">⚠️</span>}
                        trend="+ ₹2.50 this week"
                        color="bg-red-600 text-white shadow-lg border-red-500"
                    />
                    <DashboardStatCard
                        title="Books Read"
                        value="12"
                        icon={<span className="text-2xl text-white/90">✅</span>}
                        color="bg-sky-500 text-white shadow-lg border-sky-400"
                    />
                    <DashboardStatCard
                        title="Badges Earned"
                        value="5"
                        icon={<span className="text-2xl text-white/90">🏆</span>}
                        color="bg-neutral-800 text-white shadow-lg border-neutral-700"
                    />
                </section>

                <section>
                    <ActiveLoansTable loans={loans} onReturn={handleReturn} />
                    {user && <Recommendations userId={user.id} />}
                </section>
            </main>
        </div>
    );
}
