"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import debounce from "lodash.debounce";

export default function SearchInput({ placeholder }: { placeholder: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [value, setValue] = useState(searchParams.get("search") || "");

    const debouncedSearch = useMemo(() =>
        debounce((val: string) => {
            const params = new URLSearchParams(searchParams);
            if (val) {
                params.set("search", val);
            } else {
                params.delete("search");
            }
            router.push(`?${params.toString()}`);
        }, 500),
        [router, searchParams]);

    useEffect(() => {
        return () => {
            if (debouncedSearch.cancel) debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    return (
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => {
                setValue(e.target.value);
                debouncedSearch(e.target.value);
            }}
            style={{
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                fontSize: "1rem",
                width: "300px"
            }}
        />
    );
}
