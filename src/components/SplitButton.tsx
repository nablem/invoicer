"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface SplitButtonProps {
    mainAction?: (formData: FormData) => void | Promise<void>;
    mainHref?: string;
    mainLabel: string;
    dropdownItems: {
        action?: (formData: FormData) => void | Promise<void>;
        href?: string; // Add support for href
        label: string;
    }[];
    color: "blue" | "green" | "yellow" | "default";
}

export default function SplitButton({ mainAction, mainHref, mainLabel, dropdownItems, color, mainActionDisabled }: SplitButtonProps & { mainActionDisabled?: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Color configurations
    const theme = {
        blue: {
            bg: "#e0f2fe",
            text: "#0284c7",
            border: "#bbb",
            hover: "#bae6fd"
        },
        green: {
            bg: "#dcfce7",
            text: "#16a34a",
            border: "#bbb",
            hover: "#bbf7d0"
        },
        yellow: {
            bg: "#fef9c3",
            text: "#854d0e",
            border: "#bbb",
            hover: "#fef08a"
        },
        default: {
            bg: "var(--background)",
            text: "var(--primary)",
            border: "var(--border)",
            hover: "var(--muted)"
        }
    }[color];

    const hasDropdown = dropdownItems && dropdownItems.length > 0;

    const buttonStyle = {
        padding: "0.5rem 1rem",
        borderRadius: hasDropdown ? "4px 0 0 4px" : "4px",
        border: `1px solid ${theme.border}`,
        borderRight: hasDropdown ? "none" : `1px solid ${theme.border}`,
        background: theme.bg,
        color: theme.text,
        fontWeight: 500,
        cursor: mainActionDisabled ? "not-allowed" : "pointer",
        fontSize: "0.875rem",
        display: "flex",
        alignItems: "center",
        textDecoration: "none",
        opacity: mainActionDisabled ? 0.5 : 1,
        pointerEvents: mainActionDisabled ? "none" : "auto",
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropdown = () => setIsOpen(!isOpen);

    return (
        <div style={{ display: "inline-flex", position: "relative", verticalAlign: "middle" }} ref={dropdownRef}>
            {mainHref ? (
                mainActionDisabled ? (
                    <span style={buttonStyle as any}>{mainLabel}</span>
                ) : (
                    <Link href={mainHref} style={buttonStyle as any}>
                        {mainLabel}
                    </Link>
                )
            ) : (
                <form action={mainAction} style={{ display: "flex" }}>
                    <button type="submit" style={buttonStyle as any} disabled={Boolean(mainActionDisabled)}>
                        {mainLabel}
                    </button>
                </form>
            )}

            {hasDropdown && (
                <button
                    type="button"
                    onClick={toggleDropdown}
                    style={{
                        padding: "0.5rem 0.5rem",
                        borderRadius: "0 4px 4px 0",
                        border: `1px solid ${theme.border}`,
                        background: theme.bg,
                        color: theme.text,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                    aria-label="More options"
                >
                    <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.18179 6.18181C4.35753 6.00608 4.64245 6.00608 4.81819 6.18181L7.49999 8.86362L10.1818 6.18181C10.3575 6.00608 10.6425 6.00608 10.8182 6.18181C10.9939 6.35755 10.9939 6.64247 10.8182 6.81821L7.81819 9.81821C7.73379 9.9026 7.61934 9.95001 7.49999 9.95001C7.38064 9.95001 7.26618 9.9026 7.18179 9.81821L4.18179 6.81821C4.00605 6.64247 4.00605 6.35755 4.18179 6.18181Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                    </svg>
                </button>
            )}

            {isOpen && (
                <div style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    zIndex: 10,
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "4px",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                    minWidth: "160px",
                    overflow: "hidden",
                    marginTop: "4px"
                }}>
                    {dropdownItems.map((item, index) => (
                        <div key={index}>
                            {item.href ? (
                                <Link
                                    href={item.href}
                                    style={{
                                        display: "block",
                                        width: "100%",
                                        padding: "0.5rem 1rem",
                                        textAlign: "left",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: "0.875rem",
                                        color: "var(--foreground)",
                                        textDecoration: "none"
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = "var(--muted)"}
                                    onMouseOut={(e) => e.currentTarget.style.background = "none"}
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <form action={item.action}>
                                    <button
                                        type="submit"
                                        style={{
                                            display: "block",
                                            width: "100%",
                                            padding: "0.5rem 1rem",
                                            textAlign: "left",
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            fontSize: "0.875rem",
                                            color: "var(--foreground)"
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = "var(--muted)"}
                                        onMouseOut={(e) => e.currentTarget.style.background = "none"}
                                    >
                                        {item.label}
                                    </button>
                                </form>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
