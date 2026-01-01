"use client";

import { useEffect, useRef } from "react";

interface SmartTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
    value: string;
    onValueChange: (value: string) => void;
}

export default function SmartTextarea({ value, onValueChange, className, style, ...props }: SmartTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const cursorRef = useRef<number | null>(null);

    // Restore cursor position after render if we tracked it
    useEffect(() => {
        if (cursorRef.current !== null && textareaRef.current) {
            textareaRef.current.setSelectionRange(cursorRef.current, cursorRef.current);
            cursorRef.current = null;
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const rawVal = e.target.value;
        const selectionStart = e.target.selectionStart;

        // Smart replacement: turn "- " at start of line into "• "
        const newVal = rawVal.replace(/(^|\n)- /g, "$1• ");

        if (newVal !== rawVal) {
            // Transformation occurred.
            // Since "- " and "• " are both 2 characters, the cursor position remains valid.
            // We save it to restore after React re-render.
            cursorRef.current = selectionStart;
        }

        onValueChange(newVal);
    };

    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            className={className}
            style={style}
            {...props}
        />
    );
}
