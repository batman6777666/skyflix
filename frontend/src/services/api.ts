const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${BASE_URL}/api`;

async function request<T = any>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

function normalize(response: any) {
  if (Array.isArray(response)) return { data: response, totalPages: 1 };
  return response || { data: [], totalPages: 0 };
}

export const registerUser = (data: any) =>
  request(`${API_URL}/auth/register`, { method: "POST", body: JSON.stringify(data) });

export const loginUser = (data: any) =>
  request(`${API_URL}/auth/login`, { method: "POST", body: JSON.stringify(data) });

export const logoutUser = () =>
  request(`${API_URL}/auth/logout`, { method: "POST" });

export const getMe = async () => {
  try {
    return await request(`${API_URL}/auth/me`);
  } catch {
    return null;
  }
};

export const updateWatchHistory = async (data: any) => {
  try {
    return await request(`${API_URL}/auth/history`, { method: "PUT", body: JSON.stringify(data) });
  } catch (e) {
    console.error("History update failed", e);
  }
};

export const fetchHomeContent = async () => {
  try {
    return await request(`${API_URL}/content/home`);
  } catch {
    return { banner: [], sections: [] };
  }
};

export const fetchMovies = async (page = 1, limit = 24, sort = "latest") => {
  try {
    const json = await request(`${API_URL}/content/movies?page=${page}&limit=${limit}&sort=${sort}`);
    return normalize(json);
  } catch {
    return { data: [], totalPages: 0 };
  }
};

export const fetchSeries = async (page = 1, limit = 24, sort = "latest") => {
  try {
    const json = await request(`${API_URL}/content/series?page=${page}&limit=${limit}&sort=${sort}`);
    return normalize(json);
  } catch {
    return { data: [], totalPages: 0 };
  }
};

export const fetchSimilar = async (type: string, id: string) => {
  try {
    const json = await request(`${API_URL}/content/similar/${type}/${id}`);
    return json.data || [];
  } catch {
    return [];
  }
};

export const searchContent = async (query: string) => {
  if (!query) return [];
  try {
    return await request(`${API_URL}/content/search?query=${encodeURIComponent(query)}`);
  } catch {
    return [];
  }
};

export const triggerSync = async () => {
  try { return await request(`${API_URL}/sync`); } catch {}
};

export const triggerMetadata = async () => {
  try { return await request(`${API_URL}/metadata/fetch`); } catch {}
};

export const fetchStats = async () => {
  try { return await request(`${API_URL}/admin/stats`); } catch {
    return { totalMovies: 0, totalSeries: 0 };
  }
};

export const fetchMovieDetails = async (id: string) => {
  try { return await request(`${API_URL}/content/movie/${id}`); } catch { return null; }
};

export const fetchTVDetails = async (id: string) => {
  try { return await request(`${API_URL}/content/tv/${id}`); } catch { return null; }
};

export const fetchTVSeasonEpisodes = async (id: string, seasonNum: number) => {
  try { return await request(`${API_URL}/content/tv/${id}/season/${seasonNum}`); } catch { return null; }
};

export const submitRequest = (data: any) =>
  request(`${API_URL}/content/request`, { method: "POST", body: JSON.stringify(data) });

export const fetchRequests = async () => {
  try { return await request(`${API_URL}/admin/requests`); } catch { return []; }
};

export const updateRequestStatus = async (id: string, status: string) =>
  request(`${API_URL}/admin/requests/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
