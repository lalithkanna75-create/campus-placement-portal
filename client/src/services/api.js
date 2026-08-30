/**
 * NexPlacement API Client Service Layer
 * Centralized Fetch wrapper with Bearer token injection, auto error handling, and demo auto-login helpers.
 */

const API_BASE_URL = "http://localhost:5000/api";
export const BACKEND_URL = "http://localhost:5000";

// Local storage key for JWT
const TOKEN_KEY = "nex_auth_token";
const USER_KEY = "nex_auth_user";

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
};

export const setStoredAuth = (token, user) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearStoredAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Core Request helper with Bearer token injection
 */
async function request(endpoint, options = {}) {
  const token = getStoredToken();
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
    credentials: "include",
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // If file download (e.g. CSV stream)
    if (response.headers.get("content-type")?.includes("text/csv")) {
      const blob = await response.blob();
      return blob;
    }

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.error?.message || data?.message || `Request failed with status ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.details = data?.error?.details;
      throw err;
    }

    return data;
  } catch (err) {
    console.warn(`[API Client Error] [${options.method || "GET"} ${endpoint}]:`, err.message);
    throw err;
  }
}

// -----------------------------------------------------------------------------
// Auth API Endpoints
// -----------------------------------------------------------------------------
export const authApi = {
  login: async (email, password) => {
    const res = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (res.data?.token) {
      setStoredAuth(res.data.token, res.data.user);
    }
    return res.data;
  },

  register: async (userData) => {
    const res = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    if (res.data?.token) {
      setStoredAuth(res.data.token, res.data.user);
    }
    return res.data;
  },

  getMe: async () => {
    const res = await request("/auth/me");
    if (res.data?.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
    }
    return res.data?.user;
  },

  logout: async () => {
    try {
      await request("/auth/logout", { method: "POST" });
    } finally {
      clearStoredAuth();
    }
  },
};

// -----------------------------------------------------------------------------
// Student Resume & Profile API Endpoints
// -----------------------------------------------------------------------------
export const studentsApi = {
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append("resume", file);

    const res = await request("/students/upload-resume", {
      method: "POST",
      body: formData,
    });
    return res.data;
  },

  getProfile: async () => {
    const res = await request("/students/profile");
    return res.data?.profile;
  },
};

// -----------------------------------------------------------------------------
// Job Drives API Endpoints
// -----------------------------------------------------------------------------
export const drivesApi = {
  getDrives: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.branch && params.branch !== "ALL") query.append("branch", params.branch);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const res = await request(`/drives${queryString}`);
    return res.data?.drives || [];
  },

  getDriveById: async (id) => {
    const res = await request(`/drives/${id}`);
    return res.data?.drive;
  },

  createDrive: async (driveData) => {
    const res = await request("/drives", {
      method: "POST",
      body: JSON.stringify(driveData),
    });
    return res.data?.drive;
  },

  exportApplicantsCsv: async (driveId, driveTitle = "drive") => {
    const blob = await request(`/drives/${driveId}/export-csv`);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeTitle = driveTitle.replace(/[^a-zA-Z0-9_-]/g, "_");
    a.download = `applicants-${safeTitle}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};

// -----------------------------------------------------------------------------
// Applications API Endpoints
// -----------------------------------------------------------------------------
export const applicationsApi = {
  apply: async (driveId) => {
    const res = await request(`/applications/apply/${driveId}`, {
      method: "POST",
    });
    return res.data?.application;
  },

  getMyApplications: async () => {
    const res = await request("/applications/my-applications");
    return res.data?.applications || [];
  },

  getDriveApplications: async (driveId) => {
    const res = await request(`/applications/drive/${driveId}`);
    return res.data?.applications || [];
  },

  updateStatus: async (applicationId, status) => {
    const res = await request(`/applications/${applicationId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return res.data?.application;
  },
};

// -----------------------------------------------------------------------------
// Health Check Endpoint
// -----------------------------------------------------------------------------
export const checkHealthApi = async () => {
  return request("/health");
};
