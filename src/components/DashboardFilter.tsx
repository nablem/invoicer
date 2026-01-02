"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function DashboardFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const [selectedYear, setSelectedYear] = useState(searchParams.get("year") || "");
    const [selectedMonth, setSelectedMonth] = useState(searchParams.get("month") || "");

    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        if (selectedYear) {
            params.set("year", selectedYear);
        } else {
            params.delete("year");
        }

        if (selectedMonth) {
            params.set("month", selectedMonth);
        } else {
            params.delete("month");
        }

        router.push(`?${params.toString()}`);
    }, [selectedYear, selectedMonth, router, searchParams]);

    return (
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
            <select
                value={selectedYear}
                onChange={(e) => {
                    setSelectedYear(e.target.value);
                    if (!e.target.value) setSelectedMonth(""); // Clear month if year cleared
                }}
                style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
            >
                <option value="">All Years</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>

            {selectedYear && (
                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
                >
                    <option value="">All Months</option>
                    {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
            )}
        </div>
    );
}
