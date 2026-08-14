import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

/**
 * true solo después de la hidratación en el cliente. Se usa para evitar
 * mismatches de SSR con estado persistido en localStorage (carrito).
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
