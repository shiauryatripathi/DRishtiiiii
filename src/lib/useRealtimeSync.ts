import { useEffect, useState } from 'react';
import { RealtimeEvent } from '../types';

interface UseRealtimeSyncOptions {
  onPatientAdded?: (patient: any) => void;
  onPatientUpdated?: (patient: any) => void;
  onScanCompleted?: (scan: any) => void;
}

export function useRealtimeSync(options?: UseRealtimeSyncOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [activeDevices, setActiveDevices] = useState(1);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    function connect() {
      try {
        eventSource = new EventSource('/api/realtime/events');

        eventSource.onopen = () => {
          setIsConnected(true);
        };

        eventSource.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            setLastEvent(parsed);

            if (parsed.type === 'CONNECTED') {
              setIsConnected(true);
              if (parsed.devices) {
                setActiveDevices(parsed.devices);
              }
            } else if (parsed.type === 'PATIENT_ADDED') {
              options?.onPatientAdded?.(parsed.data);
              // Dispatch global event for components
              window.dispatchEvent(new CustomEvent('drishti:patient_added', { detail: parsed.data }));
            } else if (parsed.type === 'PATIENT_UPDATED') {
              options?.onPatientUpdated?.(parsed.data);
              window.dispatchEvent(new CustomEvent('drishti:patient_updated', { detail: parsed.data }));
            } else if (parsed.type === 'SCAN_COMPLETED') {
              options?.onScanCompleted?.(parsed.data);
              window.dispatchEvent(new CustomEvent('drishti:scan_completed', { detail: parsed.data }));
            }
          } catch (e) {
            console.error('[RealtimeSync] Error parsing SSE event', e);
          }
        };

        eventSource.onerror = () => {
          setIsConnected(false);
          eventSource?.close();
          // Auto-reconnect after 3 seconds
          reconnectTimeout = setTimeout(connect, 3000);
        };
      } catch (err) {
        setIsConnected(false);
        reconnectTimeout = setTimeout(connect, 3000);
      }
    }

    connect();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  return { isConnected, activeDevices, lastEvent };
}
