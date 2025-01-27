"use client";

import React, { useEffect, useState } from "react";
import SearchBar from "@/app/components/utils/SearchBar";
import PostsList from "@/app/components/posts/PostsList";

export default function DiscoverPage() {
    const params = new URLSearchParams(window.location.search);
    const [query, setQuery] = useState(params.get("q") || "");

    useEffect(() => {
        if (query.length > 0)
            window.history.replaceState({}, "", `/discover?q=${encodeURIComponent(query)}`);
        else
            window.history.replaceState({}, "", "/discover");
    }, [query]);

    return (
        <div className="flex flex-col content-center items-center">
            <div className="w-main">
                <SearchBar query={query} setQuery={setQuery} placeholder={"Search..."} />
            </div>
            <PostsList filter={{ query: query, useAlgorithm: true }} />
        </div>
    );
}