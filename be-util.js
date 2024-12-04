import { fileURLToPath } from 'url';
import path from 'node:path';

/**
 * Path Helpers
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const join = (str) => path.join(__dirname, str);
export const resolve = (str) => path.resolve(__dirname, str);