import { useState, useEffect, useRef } from 'react';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

type CustomError = {
  errCode: number;
};

interface UseFetchOptions extends RequestInit {
  method?: RequestMethod;
  headers?: HeadersInit;
  body?: BodyInit | null;
  immediate?: boolean;
}

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | CustomError | null;
  execute: (body?: BodyInit | null) => Promise<void>;
  abort: () => void;
}

export function isServerError(err: Error | CustomError | null): err is { errCode: number } {
  return !!err && 'errCode' in err && err?.errCode === 500;
}

const useFetch = <T = unknown>(url: string, options: UseFetchOptions = {}): UseFetchResult<T> => {
  const { immediate = true, ...fetchOptions } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | CustomError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = async (body?: BodyInit | null) => {
    try {
      // cancel previous fetch
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      setLoading(true);
      setError(null);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        body: body ?? fetchOptions.body,
      });

      if (response.status !== 200) {
        throw {
          errCode: response.status,
        };
      }

      const jsonData = (await response.json()) as T;
      setData(jsonData);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const abort = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }

    return () => {
      abort();
    };
  }, [url]);

  return { data, loading, error, execute, abort };
};

export default useFetch;
