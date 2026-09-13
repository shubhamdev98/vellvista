export function getProductImageUrl(image?: string | null): string {
  if (!image) {
    return 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781544157/vellvista/product/a2dhcmalhjnw4xfrj6df.jpg';
  }
  if (image.startsWith('/') || image.startsWith('\\')) {
    const cleanPath = image.replace(/\\/g, '/');
    const formattedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    if (process.env.NEXT_PUBLIC_BACKEND_URL) {
      return `${process.env.NEXT_PUBLIC_BACKEND_URL}${formattedPath}`;
    }
    if (typeof window !== 'undefined') {
      return formattedPath;
    }
    const backendUrl = process.env.INTERNAL_BACKEND_URL || 'http://localhost:3001';
    return `${backendUrl}${formattedPath}`;
  }
  return image;
}

export const getImageUrl = getProductImageUrl;

export function getInitials(name?: string | null): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

