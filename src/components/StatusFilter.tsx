"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";

interface StatusFilterProps {
    options: { label: string; value: string }[];
}

export default function StatusFilter({ options }: StatusFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Parse current selected statuses from URL (comma separated)
    const currentStatuses = searchParams.get("status")?.split(",").filter(Boolean) || [];
    const [selected, setSelected] = useState<string[]>(currentStatuses);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleChange = (value: string, checked: boolean) => {
        const newSelected = checked
            ? [...selected, value]
            : selected.filter(s => s !== value);

        setSelected(newSelected);

        const params = new URLSearchParams(searchParams);
        if (newSelected.length > 0) {
            params.set("status", newSelected.join(","));
        } else {
            params.delete("status");
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div style={{ position: "relative", display: "inline-block", marginLeft: "0.5rem" }} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    color: selected.length > 0 ? "var(--primary)" : "#9ca3af",
                    fontWeight: selected.length > 0 ? "bold" : "normal"
                }}
            >
                ▼ {selected.length > 0 && `(${selected.length})`}
            </button>

            {isOpen && (
                <div style={{
                    position: "absolute",
                    left: 0,
                    top: "100%",
                    marginTop: "0.25rem",
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.375rem",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    zIndex: 20,
                    minWidth: "150px",
                    padding: "0.5rem"
                }}>
                    {options.map(option => (
                        <div key={option.value} style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
                            <input
                                type="checkbox"
                                id={`status-${option.value}`}
                                checked={selected.includes(option.value)}
                                onChange={(e) => handleChange(option.value, e.target.checked)}
                                style={{ marginRight: "0.5rem" }}
                            />
                            <label htmlFor={`status-${option.value}`} style={{ fontSize: "0.9rem", cursor: "pointer", whiteSpace: "nowrap" }}>
                                {option.label}
                            </label>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
