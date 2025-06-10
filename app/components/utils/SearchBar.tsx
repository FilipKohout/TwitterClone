import React, { useCallback, useEffect, useState } from "react";
import debounce from "just-debounce-it";

export default function SearchBar({ setQuery, query, placeholder }: { setQuery: (query: string) => void, query: string, placeholder: string }) {
    const [focused, setFocused] = useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedQuery = useCallback(
        debounce((newQuery: string) => {
            setQuery(newQuery);
        }, 300),
        [setQuery]
    )

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        debouncedQuery(e.target.value);
    };

    useEffect(() => {
        inputRef.current!.value = query;
    }, []);

    return (
        <div className={"flex items-center gap-1 input bg-dark rounded-normal w-full pb-2 pt-2 pl-0.5 pr-3 h-10 transition-all " + (focused ? "primaryBorder" : "")}>
            <input
                type="text"
                onChange={handleChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={placeholder}
                className="noBorder bg-transparent w-full text-white p-0 noFocus pl-1.5"
                ref={inputRef}
            />
            <i className={"fi fi-br-search pt-0.5 transition-all " + (focused ? "primaryColor" : "")} />
        </div>
    );
}