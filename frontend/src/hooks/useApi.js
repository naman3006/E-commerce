import { useState, useCallback, useEffect } from 'react';
import api from '../store/api/api';

/**
 * Custom hook for making API calls with built-in error handling and loading states
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(
    async (method, url, data = null, config = {}) => {
      setLoading(true);
      setError(null);

      try {
        const response = await api({
          method,
          url,
          data,
          ...config,
        });

        setLoading(false);
        return response.data;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'An error occurred';

        setError({
          message: errorMessage,
          status: err.response?.status,
          data: err.response?.data,
        });

        setLoading(false);
        throw err;
      }
    },
    []
  );

  const get = useCallback(
    (url, config = {}) => request('GET', url, null, config),
    [request]
  );

  const post = useCallback(
    (url, data, config = {}) => request('POST', url, data, config),
    [request]
  );

  const put = useCallback(
    (url, data, config = {}) => request('PUT', url, data, config),
    [request]
  );

  const patch = useCallback(
    (url, data, config = {}) => request('PATCH', url, data, config),
    [request]
  );

  const delete_ = useCallback(
    (url, config = {}) => request('DELETE', url, null, config),
    [request]
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    loading,
    error,
    clearError,
    request,
    get,
    post,
    put,
    patch,
    delete: delete_,
  };
};

/**
 * Custom hook for paginated API calls
 */
export const usePaginatedApi = (url, initialParams = {}) => {
  const { get, loading, error, clearError } = useApi();
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(
    async (pageNumber = 1, size = pageSize) => {
      try {
        const response = await get(url, {
          params: {
            page: pageNumber,
            limit: size,
            ...initialParams,
          },
        });
        setData(response);
        setPage(pageNumber);
        setPageSize(size);
        return response;
      } catch (err) {
        console.error('Failed to fetch paginated data:', err);
        throw err;
      }
    },
    [get, url, pageSize, initialParams]
  );

  return {
    data,
    loading,
    error,
    clearError,
    page,
    pageSize,
    fetchData,
    goToPage: (pageNumber) => fetchData(pageNumber, pageSize),
    changePageSize: (size) => fetchData(1, size),
  };
};
