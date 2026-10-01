import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { trpc } from "@/utils/trpc";

/**
 * Drops cached data that belongs to the signed-in user and refetches what is
 * on screen. Call it whenever the session changes (login or logout).
 */
export function useResetAccountQueries() {
  const queryClient = useQueryClient();

  return async () => {
    const accountRouters = [trpc.user, trpc.order, trpc.shipping, trpc.payment];
    await Promise.all(
      accountRouters.map((router) =>
        queryClient.resetQueries({ queryKey: getQueryKey(router) })
      )
    );
  };
}
