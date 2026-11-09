interface CloudinaryTransform {
  width?: number;
  height?: number;
  quality?: "auto" | number;
}

/** Appends Cloudinary URL-based transform params — see frontend-architecture.md §12. */
export function cloudinaryUrl(
  baseUrl: string,
  transform: CloudinaryTransform = {},
): string {
  const { width, height, quality = "auto" } = transform;
  const params = [
    width && `w_${width}`,
    height && `h_${height}`,
    `q_${quality}`,
    "f_auto",
    "c_fill",
  ]
    .filter(Boolean)
    .join(",");

  if (!baseUrl.includes("/upload/")) {
    if (baseUrl.startsWith("http")) {
      // Proxy external images through weserv.nl because Cloudinary fetch is restricted
      const encodedUrl = encodeURIComponent(baseUrl);
      let proxyUrl = `https://images.weserv.nl/?url=${encodedUrl}`;
      if (width) proxyUrl += `&w=${width}`;
      if (height) proxyUrl += `&h=${height}`;
      proxyUrl += `&output=webp&q=${quality === "auto" ? 80 : quality}`;
      return proxyUrl;
    }
    return baseUrl;
  }

  return baseUrl.replace("/upload/", `/upload/${params}/`);
}
