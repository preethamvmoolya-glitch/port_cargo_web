// Central API configuration
// When deployed, point to the hosted Render backend.
// When running locally, point to localhost:5000.
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default API_BASE;
