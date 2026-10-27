/* =========================================================
   PHOTOJUDGE — BACKEND API CLIENT
   Use this file to connect your Frontend to the Express/MongoDB Backend.
   Replace API_BASE_URL with your deployed backend URL when deploying.
========================================================= */
const API_BASE_URL = "https://photo-contest-backend-5zxl.onrender.com/api";

// Helper function to send HTTP requests with JSON and JWT Authorization
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem("token");

    const defaultHeaders = {
        "Content-Type": "application/json"
    };

    if (token) {
        defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...(options.headers || {})
        }
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();
        return { ok: response.ok, status: response.status, data };
    } catch (error) {
        console.error(`API Error on ${endpoint}:`, error);
        return { ok: false, status: 0, data: { message: "Could not connect to backend server. Make sure it is running on " + API_BASE_URL } };
    }
}

// ==========================================
// AUTHENTICATION API
// ==========================================
const AuthAPI = {
    async register(userData) {
        return await apiRequest("/auth/register", {
            method: "POST",
            body: JSON.stringify(userData)
        });
    },

    async login(email, password) {
        return await apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });
    },

    async getMe() {
        return await apiRequest("/auth/me", {
            method: "GET"
        });
    },

    logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
    }
};

// ==========================================
// CONTESTS API
// ==========================================
const ContestsAPI = {
    async getAll(status = "") {
        const query = status ? `?status=${encodeURIComponent(status)}` : "";
        return await apiRequest(`/contests${query}`, { method: "GET" });
    },

    async getById(id) {
        return await apiRequest(`/contests/${id}`, { method: "GET" });
    }
};

// ==========================================
// ENTRIES API
// ==========================================
const EntriesAPI = {
    async create(entryData) {
        return await apiRequest("/entries", {
            method: "POST",
            body: JSON.stringify(entryData)
        });
    },

    async getAll(contestId = "") {
        const query = contestId ? `?contestId=${encodeURIComponent(contestId)}` : "";
        return await apiRequest(`/entries${query}`, { method: "GET" });
    },

    async getMyEntries() {
        return await apiRequest("/entries/my", { method: "GET" });
    },

    async getById(id) {
        return await apiRequest(`/entries/${id}`, { method: "GET" });
    },

    async update(id, data) {
        return await apiRequest(`/entries/${id}`, {
            method: "PUT",
            body: JSON.stringify(data)
        });
    },

    async delete(id) {
        return await apiRequest(`/entries/${id}`, {
            method: "DELETE"
        });
    }
};

// ==========================================
// SCORES API
// ==========================================
const ScoresAPI = {
    async submit(scoreData) {
        return await apiRequest("/scores", {
            method: "POST",
            body: JSON.stringify(scoreData)
        });
    },

    async getByEntry(entryId) {
        return await apiRequest(`/scores/entry/${entryId}`, { method: "GET" });
    },

    async getAll() {
        return await apiRequest("/scores", { method: "GET" });
    }
};

// ==========================================
// EXPLORE API
// ==========================================
const ExploreAPI = {
    async getAll(category = "", search = "") {
        const params = new URLSearchParams();
        if (category && category !== "All") params.append("category", category);
        if (search) params.append("search", search);
        const query = params.toString() ? `?${params.toString()}` : "";
        return await apiRequest(`/explore${query}`, { method: "GET" });
    },

    async create(photoData) {
        return await apiRequest("/explore", {
            method: "POST",
            body: JSON.stringify(photoData)
        });
    },

    async like(id) {
        return await apiRequest(`/explore/${id}/like`, {
            method: "PUT"
        });
    }
};

// ==========================================
// LEADERBOARD API
// ==========================================
const LeaderboardAPI = {
    async get(contestId = "") {
        const query = (contestId && contestId !== "all") ? `?contestId=${encodeURIComponent(contestId)}` : "";
        return await apiRequest(`/leaderboard${query}`, { method: "GET" });
    },

    async getResult(entryId) {
        return await apiRequest(`/leaderboard/result/${entryId}`, { method: "GET" });
    }
};

// Global compatibility objects
window.AuthAPI = AuthAPI;
window.ContestsAPI = ContestsAPI;
window.EntriesAPI = EntriesAPI;
window.ScoresAPI = ScoresAPI;
window.ExploreAPI = ExploreAPI;
window.LeaderboardAPI = LeaderboardAPI;
window.PhotoJudgeAPI = {
    getContests: (status) => ContestsAPI.getAll(status).then(r => r.data || r),
    getContest: (id) => ContestsAPI.getById(id).then(r => r.data || r),
    submitEntry: (data) => EntriesAPI.create(data).then(r => r.data || r),
    getEntries: (filters) => EntriesAPI.getAll(filters?.contestId).then(r => r.data || r),
    getMyEntries: () => EntriesAPI.getMyEntries().then(r => r.data || r),
    submitScore: (data) => ScoresAPI.submit(data).then(r => r.data || r),
    getScoresForEntry: (id) => ScoresAPI.getByEntry(id).then(r => r.data || r),
    getLeaderboard: (contestId) => LeaderboardAPI.get(contestId).then(r => r.data || r),
    getEntryResult: (id) => LeaderboardAPI.getResult(id).then(r => r.data || r)
};


