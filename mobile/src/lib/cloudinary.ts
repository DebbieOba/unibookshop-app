interface CloudinaryTransform {
  width?: number;
  height?: number;
  quality?: 'auto' | number;
}

/** Appends Cloudinary URL-based transform params — see frontend-architecture.md §12. */
export function cloudinaryUrl(baseUrl: string, transform: CloudinaryTransform = {}): string {
  const { width, height, quality = 'auto' } = transform;
  const params = [
    width && `w_${width}`,
    height && `h_${height}`,
    `q_${quality}`,
    'f_auto',
    'c_fill',
  ]
    .filter(Boolean)
    .join(',');

  return baseUrl.replace('/upload/', `/upload/${params}/`);
}
