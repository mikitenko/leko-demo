const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export function uploadsUrl(filename) {
  return `${BACKEND_URL}/uploads/${filename}`;
}
