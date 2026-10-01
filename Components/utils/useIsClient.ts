import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** False during SSR and hydration, so client-only state can render safely. */
export default function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
