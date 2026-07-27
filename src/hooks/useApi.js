import { useCallback, useEffect, useRef, useState } from 'react';

export default function useApi(fetcher, deps = []) {
  const dependencyKey = JSON.stringify(deps);
  const fetcherRef = useRef(fetcher);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const execute = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const result = await fetcherRef.current();
      setData(result);
    } catch (err) {
      setError(err.message || 'Ocurrio un error inesperado.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  useEffect(() => {
    if (dependencyKey === null) return;
    execute();
  }, [execute, dependencyKey]);

  return { data, loading, error, refetch: execute };
}
