export const getOptimizedImageUrl = (src) => {
    if (!src) return '';

    let imageSrc = src;

    // 1. Handle legacy localhost absolute URLs (host replacement)
    // If the backend sends http://localhost:3000/uploads/..., 
    // we want to replace the origin with the current API URL logic.
    const localhostPattern = /^http:\/\/localhost:3000/;
    if (localhostPattern.test(imageSrc)) {
        const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
        return imageSrc.replace(localhostPattern, baseUrl);
    }

    // 2. Absolute URLs (external), Data URIs, or Blob URIs -> return as is
    if (imageSrc.startsWith('http') || imageSrc.startsWith('data:') || imageSrc.startsWith('blob:')) {
        return imageSrc;
    }

    // 3. Handle simple relative paths (e.g. "uploads/products/..." or "/uploads/...")
    // If it DOES NOT start with http/https/data/blob, assume it's relative to API
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
    // Ensure we handle leading slash correctly
    const cleanPath = imageSrc.startsWith('/') ? imageSrc : `/${imageSrc}`;
    return `${baseUrl}${cleanPath}`;
};
