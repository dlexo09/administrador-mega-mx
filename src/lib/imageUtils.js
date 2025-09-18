// Utilidad para construir URLs de imágenes desde S3 a través de CloudFront/reverse proxy

/**
 * URL base para acceder a las imágenes a través del reverse proxy/CloudFront
 * Esta URL funciona correctamente para acceder a las imágenes
 */
const S3_PUBLIC_URL = "https://mega-pruebas.mx/";

/**
 * Construye la URL completa para una imagen almacenada en S3
 * @param {string} imageKey - La key de la imagen en S3 (ej: "uploads/cuponera/filename.jpg")
 * @returns {string} - URL completa de la imagen accesible públicamente
 */
export const getImageUrl = (imageKey) => {
  if (!imageKey) return '';
  
  // Si la key ya es una URL completa, devolverla tal como está
  if (imageKey.startsWith('http://') || imageKey.startsWith('https://')) {
    return imageKey;
  }
  
  // Construir la URL completa usando la base de CloudFront/reverse proxy
  return `${S3_PUBLIC_URL}${imageKey}`;
};

/**
 * Valida si una imagen existe y es accesible
 * @param {string} imageKey - Key de la imagen en S3
 * @returns {Promise<boolean>} - true si la imagen es accesible
 */
export const validateImageExists = async (imageKey) => {
  try {
    const imageUrl = getImageUrl(imageKey);
    const response = await fetch(imageUrl, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error validating image:', error);
    return false;
  }
};

/**
 * Obtiene información de una imagen
 * @param {string} imageKey - Key de la imagen en S3
 * @returns {Promise<Object>} - Información de la imagen
 */
export const getImageInfo = async (imageKey) => {
  try {
    const imageUrl = getImageUrl(imageKey);
    const response = await fetch(imageUrl, { method: 'HEAD' });
    
    if (!response.ok) {
      throw new Error('Image not accessible');
    }
    
    return {
      url: imageUrl,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length'),
      lastModified: response.headers.get('last-modified'),
      exists: true
    };
  } catch (error) {
    return {
      url: getImageUrl(imageKey),
      exists: false,
      error: error.message
    };
  }
};