export const handleApiCall = async (fn, ...args) => {
    try {
        const response = await fn(...args);
        return response;
    } catch (error) {
        console.error('Error:', error?.response?.data || error);
        return {
            success: false,
            message: error?.response?.data?.message || error?.message
        }
    }
}