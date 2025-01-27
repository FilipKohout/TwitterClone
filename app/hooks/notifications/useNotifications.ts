import { getNotificationsAction } from "@/app/actions/notifications";
import { Notification } from "@/app/lib/database/notifications";
import { useQuery } from "@tanstack/react-query";
import { defaultQueryStaleTime } from "@/app/lib/consts";

export default function useNotifications() {
    const { data, isError, isLoading, isFetching } = useQuery<Notification[]>({
        queryKey: ["notifications"],
        queryFn: () => new Promise((resolve, reject) => {
            getNotificationsAction()
                .then(result => {
                    if (!result.success || !result.notifications)
                        reject(result.error || "Failed to fetch notifications");

                    resolve(result.notifications || []);
                })
                .catch(reject);
        }),
        staleTime: defaultQueryStaleTime,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });

    return { data, isError, isLoading, isFetching };
}