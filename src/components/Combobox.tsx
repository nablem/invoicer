"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./Combobox.module.css";

interface Item {
    id: string;
    label: string;
}

interface ComboboxProps {
    name: string;
    label: string;
    initialItems: Item[]; // The "last 15 records"
    searchAction: (query: string) => Promise<any[]>; // Returns {id, name/number}
    onSelect?: (id: string) => void;
    defaultValue?: string;
    placeholder?: string;
    minSearchLength?: number;
    valueKey?: string; // key in result to use as label (name or number)
    allowClear?: boolean;
}

export default function Combobox({
    name,
    label,
    initialItems,
    searchAction,
    onSelect,
    defaultValue,
    placeholder,
    minSearchLength = 2,
    valueKey = "name",
    allowClear = false,
    disabled = false
}: ComboboxProps & { disabled?: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [items, setItems] = useState<Item[]>(initialItems);
    const [selectedItem, setSelectedItem] = useState<Item | null>(
        initialItems.find(i => i.id === defaultValue) || null
    );
    const wrapperRef = useRef<HTMLDivElement>(null);

    // If defaultValue is provided but not in initialItems (e.g. older record), we might want to fetch it or rely on parent passing it in initialItems?
    // For now, assume parent ensures defaultValue is in initialItems or we just show ID if missing (fallback).
    // Better: If selectedItem is null but defaultValue exists, we might show "Loading..." or just defaultValue until interaction?
    // Actually, parent pages usually fetch all relevant data. But if we limit to 15, we might miss the selected one if it's old.
    // Solution: The parent should ensure the *current* value is in the passed `initialItems` OR we handle it.
    // I'll stick to a simple implementation: If selectItem is null, show placeholder.

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSearch = async (val: string) => {
        setQuery(val);
        if (val.length >= minSearchLength) {
            const results = await searchAction(val);
            setItems(results.map(r => ({ id: r.id, label: r[valueKey] })));
        } else {
            setItems(initialItems);
        }
    };

    const handleSelect = (item: Item) => {
        setSelectedItem(item);
        setQuery("");
        setIsOpen(false);
        if (onSelect) onSelect(item.id);
    };

    return (
        <div className={styles.wrapper} ref={wrapperRef} style={disabled ? { pointerEvents: 'none' } : {}}>
            <label className={styles.label}>{label}</label>
            <input type="hidden" name={name} value={selectedItem?.id || ""} />

            <div className={styles.control}>
                <input
                    type="text"
                    className={styles.input}
                    placeholder={selectedItem ? selectedItem.label : placeholder}
                    value={isOpen ? query : (selectedItem?.label || "")}
                    onChange={(e) => {
                        setIsOpen(true);
                        handleSearch(e.target.value);
                    }}
                    onFocus={() => {
                        setIsOpen(true);
                        setItems(initialItems);
                    }}
                    disabled={disabled}
                />
                {allowClear && selectedItem && !disabled && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(null);
                            setQuery("");
                            if (onSelect) onSelect("");
                        }}
                        style={{
                            position: 'absolute',
                            right: '30px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            color: '#999',
                            zIndex: 10
                        }}
                    >
                        ×
                    </button>
                )}
                <div className={styles.arrow} onClick={() => !disabled && setIsOpen(!isOpen)}>▼</div>
            </div>

            {isOpen && (
                <div className={styles.dropdown}>
                    {items.length === 0 ? (
                        <div className={styles.noResults}>No results found</div>
                    ) : (
                        items.map((item) => (
                            <div
                                key={item.id}
                                className={styles.option}
                                onClick={() => handleSelect(item)}
                            >
                                {item.label}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
