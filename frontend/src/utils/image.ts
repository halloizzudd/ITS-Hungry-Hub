/**
 * Generates a full URL for an image.
 * @param path - The path to the image (e.g., "/uploads/image.png" or "uploads/image.png").
 * @returns The full URL (e.g., "http://localhost:4000/uploads/image.png") or a placeholder if no path is provided.
 */
export const getImageUrl = (path: string | null | undefined): string => {
    if (!path) {
        // Return a placeholder or empty string if no image
        return '';
    }

    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // Hardcode fallback to localhost:4000 if env is missing or empty
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const baseUrl = apiUrl.replace(/\/$/, '');

    // Ensure path has leading slash
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${baseUrl}${cleanPath}`;
};
