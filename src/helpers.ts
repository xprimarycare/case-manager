import { usePaginatedQuery } from "convex/react";
import { useRef } from "react";

export const useStablePaginatedQuery = ((name, ...args) => {
    const result = usePaginatedQuery(name, ...args);
    const stored = useRef(result); // ref objects are stable between rerenders

    // If data is still loading, wait and do nothing
    // If data has finished loading, store the result
    if (
        result.status !== "LoadingMore" &&
        result.status !== "LoadingFirstPage"
    ) {
        stored.current = result;
    }

    return stored.current;
}) as typeof usePaginatedQuery;
