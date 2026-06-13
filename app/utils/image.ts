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

