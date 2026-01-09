// frontend/src/admin/hooks/useAdminData.js
import { useState, useCallback } from 'react';

export const useAdminData = (fetchFunction, initialData = null) => {
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async (...args) => {
        setLoading(true);
        setError(null);

        try {
            const result = await fetchFunction(...args);
            setData(result.data || result);
            return result;
        } catch (err) {
            setError(err.message || 'Failed to fetch data');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchFunction]);

    const refresh = useCallback((...args) => fetchData(...args), [fetchData]);

    return {
        data,
        loading,
        error,
        fetchData,
        refresh
    };
};