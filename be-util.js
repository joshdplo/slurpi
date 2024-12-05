import { fileURLToPath } from 'url';
import path from 'node:path';
import fs from 'node:fs';
import { format } from 'path';

/**
 * Path Helpers
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const join = (str) => path.join(__dirname, str);
export const resolve = (str) => path.resolve(__dirname, str);

/**
 * Formatting
 */
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatNumber(num) {
  return num.toLocaleString("en-US");
}

/**
 * Meta
 */
export async function getDBSize() {
  try {
    const stats = fs.statSync(process.env.DB_URL);
    let formatted = formatBytes(stats.size);
    formatted = formatted.replace(' ', '');
    return formatted;
  } catch (error) {
    console.error('Error getting DB File Size', error);
    return '0b';
  }
}