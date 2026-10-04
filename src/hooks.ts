import { liveQuery } from 'dexie';
import { useEffect, useState } from 'preact/hooks';
import { db } from './db';

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

/* An object URL for a stored file blob, created and revoked as fileId changes so nothing
   leaks. Returns undefined while loading or when there is no file. */
export function usePhotoUrl(fileId: string | undefined): string | undefined {
  const [url, setUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (!fileId) {
      setUrl(undefined);
      return;
    }
    let current: string | undefined;
    db.files.get(fileId).then((rec) => {
      if (rec) {
        current = URL.createObjectURL(rec.blob);
        setUrl(current);
      }
    });
    return () => {
      if (current) URL.revokeObjectURL(current);
    };
  }, [fileId]);
  return url;
}
