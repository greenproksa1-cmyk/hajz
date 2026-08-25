// Simple hardcoded admin credentials
const ADMIN_USERNAME = 'green';
const ADMIN_PASSWORD = 'green 2026';

export function verifyAdmin(username: string, password: string): boolean {
  return username?.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase() && password?.trim() === ADMIN_PASSWORD;
}
