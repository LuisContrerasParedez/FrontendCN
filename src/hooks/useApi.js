import { useCallback, useEffect, useRef, useState } from 'react';

export default function useApi(fetcher, deps = []) {
  const dependencyKey = JSON.stringify(deps);
  const fetcherRef = useRef(fetcher);
  const dataRef = useRef(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const execute = useCallback(async () => {
    const hasCachedData = dataRef.current !== null;

    if (hasCachedData) {
      setRefreshing(true);
    } else {
      setLoading(true);
      setError('');
    }

    try {
      const result = await fetcherRef.current();
      dataRef.current = result;
      setData(result);
      setError('');
    } catch (err) {
      // Una actualizacion en segundo plano no debe ocultar contenido valido.
      if (!hasCachedData) {
        setError(err.message || 'Ocurrio un error inesperado.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  useEffect(() => {
    if (dependencyKey === null) return;
    execute();
  }, [execute, dependencyKey]);

  return { data, loading, refreshing, error, refetch: execute };
}
