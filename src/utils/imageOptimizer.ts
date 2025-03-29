export const getOptimizedImageUrl = (url: string, width: number = 800) => {
  // If it's a Firebase Storage URL, add size parameters
  if (url.includes('firebasestorage.googleapis.com')) {
    return `${url}?width=${width}`;
  }
  
  // If it's a local image, use the original
  return url;
};

export const generateBlurDataUrl = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error('Error generating blur data URL:', error);
    return '';
  }
};

export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

export const preloadImages = async (urls: string[]): Promise<void> => {
  try {
    await Promise.all(urls.map(preloadImage));
  } catch (error) {
    console.error('Error preloading images:', error);
  }
}; 