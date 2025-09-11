"use client";
import { useEffect, useState } from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";
import CustomSelect from "./select";

export default function AdminDashboardStats() {
    const [timeRanges, setTimeRanges] = useState({
        users: "day",
        bookings: "day",
        payments: "day",
        revenue: "day",
    });

    const [totals, setTotals] = useState({
        totalUsers: 0,
        totalBookings: 0,
        totalPayments: 0,
        totalRevenue: 0,
    });

    const [graphs, setGraphs] = useState({
        users: [],
        bookings: [],
        payments: [],
        revenue: [],
    });

    const [loadingGraphs, setLoadingGraphs] = useState({
        users: false,
        bookings: false,
        payments: false,
        revenue: false,
    });

    // Initial fetch for totals + default graphs (day)
    useEffect(() => {
        async function fetchInitialData() {
            try {
                const res = await fetch(`/api/admin/stats?range=day`);
                const data = await res.json();
                setTotals(data.totals);
                setGraphs(data.graphs);
            } catch (err) {
                console.error("❌ Stats fetch error:", err);
            }
        }
        fetchInitialData();
    }, []);

    // Handle individual dropdown changes
    const handleRangeChange = async (key, value) => {
        setTimeRanges((prev) => ({ ...prev, [key]: value }));
        setLoadingGraphs((prev) => ({ ...prev, [key]: true }));

        try {
            const res = await fetch(`/api/admin/stats?range=${value}`);
            const data = await res.json();

            // update only this graph
            setGraphs((prev) => ({ ...prev, [key]: data.graphs[key] }));
        } catch (err) {
            console.error("❌ Range change fetch error:", err);
        } finally {
            setLoadingGraphs((prev) => ({ ...prev, [key]: false }));
        }
    };

    const chartOptions = [
        { key: "users", label: "Users", color: "#4ade80" },
        { key: "bookings", label: "Bookings", color: "#60a5fa" },
        { key: "payments", label: "Payments", color: "#fbbf24" },
        { key: "revenue", label: "Revenue (₹)", color: "#f87171" },
    ];

    return (
        <section>
            <h1 className="text-3xl font-bold mb-4">Admin Dashboard Overview</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/10 p-4 rounded-lg shadow">
                    <p className="text-gray-300">Total Users</p>
                    <p className="text-2xl font-bold">{totals.totalUsers}</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg shadow">
                    <p className="text-gray-300">Total Bookings</p>
                    <p className="text-2xl font-bold">{totals.totalBookings}</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg shadow">
                    <p className="text-gray-300">Total Payments</p>
                    <p className="text-2xl font-bold">{totals.totalPayments}</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg shadow">
                    <p className="text-gray-300">Revenue</p>
                    <p className="text-2xl font-bold">
                        ₹{totals.totalRevenue.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Graph Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {chartOptions.map(({ key, label, color }) => (
                    <div
                        key={key}
                        className="bg-white/10 p-6 rounded-lg shadow flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">{label} Trend</h2>

                            <CustomSelect
                                value={timeRanges[key]}
                                onChange={(val) => handleRangeChange(key, val)}
                            />
                        </div>

                        <div className="flex-1">
                            {loadingGraphs[key] ? (
                                <div className="flex justify-center items-center h-[300px]">
                                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={graphs[key]}>
                                        <CartesianGrid stroke="#444" />
                                        <XAxis dataKey="label" stroke="#888" />
                                        <YAxis stroke="#888" allowDecimals={false} />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="value"
                                            stroke={color}
                                            strokeWidth={3}
                                            dot={false}
                                            activeDot={{ r: 2 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
