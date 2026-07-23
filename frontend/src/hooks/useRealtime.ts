import { useEffect, useCallback, useRef } from 'react'
import pb from '../lib/pocketbase'

/**
 * Subscribe to PocketBase realtime events for a collection.
 * Auto-unsubscribes on unmount.
 */
export function useRealtime(
  collection: string,
  onEvent: (action: string, record: any) => void,
  filter?: string,
) {
  const callbackRef = useRef(onEvent)
  callbackRef.current = onEvent

  useEffect(() => {
    const unsub = pb.collection(collection).subscribe('*', (e) => {
      callbackRef.current(e.action, e.record)
    }, filter ? { filter } : undefined)

    return () => {
      unsub.then((unsubFn) => unsubFn())
    }
  }, [collection, filter])
}
