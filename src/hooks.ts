import { liveQuery } from 'dexie';
import { useEffect, useState } from 'preact/hooks';

/* Re-renders whenever the Dexie query's underlying data changes — no manual refresh calls. */
export function useLive<T>(query: () => Promise<T>, deps: unknown[], initial: T): T {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    const sub = liveQuery(query).subscribe({ next: setValue, error: console.error });
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return value;
}
