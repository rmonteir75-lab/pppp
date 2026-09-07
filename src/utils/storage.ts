/**
 * Safe local storage utility with automatic quota exceeded handling,
 * data sanitization, and image compression for client-side persistence.
 */

/**
 * Compresses an image File or Data URL to a lightweight JPEG Data URL (typically 15KB - 40KB)
 * to prevent localStorage QuotaExceededError.
 */
export async function compressImage(
  source: File | string,
  maxWidth = 400,
  maxHeight = 400,
  quality = 0.65
): Promise<string> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      const handleImageLoad = () => {
        try {
          let width = img.width || maxWidth;
          let height = img.height || maxHeight;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(width, 1);
          canvas.height = Math.max(height, 1);

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(typeof source === 'string' ? source.slice(0, 1000) : '');
            return;
          }

          // Draw with white background for transparency
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch {
          resolve(typeof source === 'string' ? source.slice(0, 5000) : '');
        }
      };

      img.onload = handleImageLoad;
      img.onerror = () => {
        resolve(typeof source === 'string' ? source.slice(0, 5000) : '');
      };

      if (typeof source === 'string') {
        img.src = source;
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            img.src = e.target.result as string;
          } else {
            resolve('');
          }
        };
        reader.onerror = () => resolve('');
        reader.readAsDataURL(source);
      }
    } catch {
      resolve('');
    }
  });
}

/**
 * Cleans up non-critical localStorage entries when storage quota is tight.
 */
export function purgeNonCriticalStorage(): void {
  try {
    const keysToPurge = [
      'smexpress_services_cache',
      'smexpress_temp_upload',
      'smexpress_debug',
      'smexpress_analytics',
      'smexpress_draft_photos'
    ];
    for (const k of keysToPurge) {
      localStorage.removeItem(k);
    }
  } catch {
    // silent fallback
  }
}

/**
 * Strips oversized base64 strings from object collections to keep payload < 500KB.
 */
function sanitizeDataForStorage<T>(data: T): T {
  if (!data) return data;
  try {
    const str = JSON.stringify(data);
    // If the data is reasonably small (< 500KB), return as is
    if (str.length < 500000) return data;

    // Deep clone and prune oversized base64 fields (> 20KB per field)
    const cloned = JSON.parse(str);

    const pruneItem = (item: any) => {
      if (item && typeof item === 'object') {
        for (const key in item) {
          if (typeof item[key] === 'string' && item[key].startsWith('data:image')) {
            if (item[key].length > 40000) {
              // Replace oversized raw base64 with a tiny 1x1 placeholder or empty
              item[key] = '';
            }
          } else if (typeof item[key] === 'object') {
            pruneItem(item[key]);
          }
        }
      }
    };

    if (Array.isArray(cloned)) {
      cloned.forEach(pruneItem);
    } else {
      pruneItem(cloned);
    }

    return cloned;
  } catch {
    return data;
  }
}

/**
 * Safely saves data to localStorage without throwing QuotaExceededError or crashing React.
 */
export function safeSetItem(key: string, value: any): boolean {
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch {
    try {
      // 1. Purge non-critical items
      purgeNonCriticalStorage();

      // 2. Sanitize and strip oversized base64 properties
      const sanitized = sanitizeDataForStorage(value);
      const sanitizedStr = typeof sanitized === 'string' ? sanitized : JSON.stringify(sanitized);

      localStorage.setItem(key, sanitizedStr);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Safely reads and parses data from localStorage with fallback.
 */
export function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  } catch {
    return fallback;
  }
}

/**
 * Safely removes an item from localStorage.
 */
export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // silent fallback
  }
}
