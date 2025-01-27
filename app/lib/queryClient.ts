import { QueryClient } from '@tanstack/react-query';
import { defaultQueryStaleTime } from "@/app/lib/consts";

let globalQueryClient: QueryClient | null = null;

export function getServerQueryClient() {
    if (!globalQueryClient) {
        globalQueryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    staleTime: defaultQueryStaleTime,
                },
            },
        });
    }
    return globalQueryClient;
}