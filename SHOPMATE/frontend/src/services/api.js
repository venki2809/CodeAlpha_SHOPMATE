// Real HTTP client for SHOPMATE Express backend. Vite proxies /api to port 5000.
// Only the session token and cart are stored in the browser; users, stock and orders
// are read and written via the backend.
const API_ROOT = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

async function request(method, route, body, options = {}) {
  const query = new URLSearchParams();
  Object.entries(options.params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
  });
  const suffix = query.size ? `?${query.toString()}` : '';
  const token = localStorage.getItem('shopmate_token');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(`${API_ROOT}${route}${suffix}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data.message || `Request failed (${response.status}).`;
      const error = new Error(message);
      error.response = { status: response.status, data };
      if (response.status === 401 && token && route !== '/auth/login') {
        localStorage.removeItem('shopmate_token');
        window.dispatchEvent(new Event('shopmate-session-expired'));
      }
      throw error;
    }
    return { data, status: response.status };
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Request timed out. Check that the SHOPMATE backend has started.');
    if (error instanceof TypeError) throw new Error('Cannot reach the SHOPMATE backend. Start the project from its main folder using npm run dev.');
    throw error;
  } finally { clearTimeout(timeout); }
}
export const get = (route, options) => request('GET', route, undefined, options);
export const post = (route, payload) => request('POST', route, payload);
export const put = (route, payload) => request('PUT', route, payload);
export const getError = error => error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.';
export default { get, post, put };
