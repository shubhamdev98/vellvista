export function getProductImageUrl(image?: string | null): string {
  if (!image) {
    return '/product/beautinow-niche-perfume-k1X05CSCybE-unsplash.jpg';
  }
  if (image.startsWith('/') || image.startsWith('\\')) {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://172.29.214.47:3001';
    const cleanPath = image.replace(/\\/g, '/');
    return `${backendUrl}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
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

