import { useEffect, useState } from 'react';

export default function useRefreshInterval(intervalMs = 60000) {
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    const refresh = () => {
      if (!document.hidden && navigator.onLine) {
        setRefreshToken((current) => current + 1);
      }
    };

    const timer = window.setInterval(refresh, intervalMs);
    window.addEventListener('online', refresh);
    document.addEventListener('visibilitychange', refresh);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('online', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [intervalMs]);

  return refreshToken;
}
