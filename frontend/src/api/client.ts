// ============================================
// API CLIENT
// ============================================
// Wrapper for making API calls to the BetSmoke backend.
// Handles base URL, headers, and token injection.
// ============================================

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// ============================================
// HELPER: Get stored auth token
// ============================================
// Retrieves the auth token from localStorage (where AuthContext stores it)

const getStoredToken = (): string | null => {
  return localStorage.getItem('betsmoke_token');
};

// ============================================
// HELPER: Make a request
// ============================================

const request = async <T = any>(
  method: HttpMethod,
  path: string,
  data: unknown = null,
  token: string | null = null
): Promise<T> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add auth token if provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
    // Prevent browser from returning cached responses (304)
    // This ensures we always get fresh data from the server
    cache: 'no-store',
  };

  // Add body for POST/PUT/PATCH requests
  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE}${path}`, config);
  const json = await response.json();

  // If response is not ok, throw error with message from API
  if (!response.ok) {
    throw new Error(json.error || 'Request failed');
  }

  return json as T;
};

// ============================================
// HELPER: Make authenticated request (auto-token)
// ============================================
// Automatically includes the stored auth token

const requestWithAuth = async <T = any>(
  method: HttpMethod,
  path: string,
  data: unknown = null
): Promise<T> => {
  const token = getStoredToken();
  return request<T>(method, path, data, token);
};

// ============================================
// API METHODS
// ============================================

export const api = {
  // GET request (public)
  get: (path: string) => request('GET', path),

  // GET request (authenticated - explicit token)
  getAuth: (path: string, token: string) => request('GET', path, null, token),

  // GET request (authenticated - auto token from localStorage)
  getWithAuth: (path: string) => requestWithAuth('GET', path),

  // POST request (public)
  post: (path: string, data: unknown) => request('POST', path, data),

  // POST request (authenticated - explicit token)
  postAuth: (path: string, data: unknown, token: string) => request('POST', path, data, token),

  // POST request (authenticated - auto token)
  postWithAuth: (path: string, data: unknown) => requestWithAuth('POST', path, data),

  // PUT request (authenticated - explicit token)
  putAuth: (path: string, data: unknown, token: string) => request('PUT', path, data, token),

  // PATCH request (authenticated - explicit token)
  patchAuth: (path: string, data: unknown, token: string) => request('PATCH', path, data, token),

  // DELETE request (authenticated - explicit token)
  deleteAuth: (path: string, token: string) => request('DELETE', path, null, token),
};

// ============================================
// AUTH API
// ============================================

export const authApi = {
  // Registration & Login
  register: (data: Record<string, unknown>) => api.post('/auth/register', data),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  
  // User Profile (protected)
  getMe: (token: string) => api.getAuth('/auth/me', token),
  
  // Preferences (protected)
  updatePreferences: (data: Record<string, unknown>, token: string) =>
    api.patchAuth('/auth/preferences', data, token),
  
  // Email Change (protected)
  changeEmail: (newEmail: string, password: string, token: string) => 
    api.patchAuth('/auth/email', { newEmail, password }, token),
  
  // Password Change (protected)
  changePassword: (currentPassword: string, newPassword: string, token: string) => 
    api.patchAuth('/auth/password', { currentPassword, newPassword }, token),
  
  // Security Question (protected)
  updateSecurityQuestion: (
    securityQuestion: string,
    securityAnswer: string,
    password: string,
    token: string
  ) => 
    api.patchAuth('/auth/security-question', { securityQuestion, securityAnswer, password }, token),
  
  // Password Recovery (public)
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),
  
  // Security Question Recovery (public)
  getSecurityQuestion: (email: string) => api.post('/auth/get-security-question', { email }),
  verifySecurityAnswer: (email: string, securityAnswer: string) => 
    api.post('/auth/verify-security-answer', { email, securityAnswer }),
};

// ============================================
// NOTES API
// ============================================

export const notesApi = {
  getAll: (token: string) => api.getAuth('/notes', token),
  getById: (id: string, token: string) => api.getAuth(`/notes/${id}`, token),
  create: (data: Record<string, unknown>, token: string) => api.postAuth('/notes', data, token),
  update: (id: string, data: Record<string, unknown>, token: string) =>
    api.putAuth(`/notes/${id}`, data, token),
  delete: (id: string, token: string) => api.deleteAuth(`/notes/${id}`, token),
};

// ============================================
// PROTECTED DATA API (SportsMonks proxy)
// ============================================
// All data endpoints require authentication.
// Token is automatically retrieved from localStorage.

export const dataApi = {
  // Teams
  searchTeams: (query: string) => api.getWithAuth(`/teams/search/${encodeURIComponent(query)}`),
  getTeam: (id: string | number) => api.getWithAuth(`/teams/${id}`),
  getTeamStats: (id: string | number) => api.getWithAuth(`/teams/${id}/stats`),
  getTeamStatsBySeason: (teamId: string | number, seasonId: string | number) =>
    api.getWithAuth(`/teams/${teamId}/stats/seasons/${seasonId}`),
  getTeamSeasons: (id: string | number) => api.getWithAuth(`/teams/${id}/seasons`),
  getHeadToHead: (team1Id: string | number, team2Id: string | number) =>
    api.getWithAuth(`/teams/h2h/${team1Id}/${team2Id}`),

  // Fixtures
  getFixturesByDate: (date: string) => api.getWithAuth(`/fixtures/date/${date}`),
  getFixturesByDateRange: (startDate: string, endDate: string) =>
    api.getWithAuth(`/fixtures/between/${startDate}/${endDate}`),
  getTeamFixturesByDateRange: (startDate: string, endDate: string, teamId: string | number) =>
    api.getWithAuth(`/fixtures/between/${startDate}/${endDate}/team/${teamId}`),
  searchFixtures: (query: string) => api.getWithAuth(`/fixtures/search/${encodeURIComponent(query)}`),
  // Get single fixture with optional includes
  // Always includes sidelined (injuries/suspensions) for betting research
  getFixture: (id: string | number, includeOdds = false) => {
    // Build includes array
    const includes = ['sidelined']; // Always include sidelined for betting research
    if (includeOdds) {
      includes.push('odds');
    }
    const params = `?include=${includes.join(',')}`;
    return api.getWithAuth(`/fixtures/${id}${params}`);
  },

  // Odds
  getOddsByFixture: (fixtureId: string | number) => api.getWithAuth(`/odds/fixtures/${fixtureId}`),
  getBookmakers: () => api.getWithAuth('/odds/bookmakers'),
  getMarkets: () => api.getWithAuth('/odds/markets'),

  // Standings
  getStandings: (seasonId: string | number) => api.getWithAuth(`/standings/seasons/${seasonId}`),

  // Leagues
  getLeagues: () => api.getWithAuth('/leagues'),
  getLeague: (id: string | number) => api.getWithAuth(`/leagues/${id}`),
  searchLeagues: (query: string) => api.getWithAuth(`/leagues/search/${encodeURIComponent(query)}`),

  // Seasons
  getSeasons: () => api.getWithAuth('/seasons'),
  getSeasonsByLeague: (leagueId: string | number) =>
    api.getWithAuth(`/seasons/leagues/${leagueId}`),

  // Live scores
  getLivescores: () => api.getWithAuth('/livescores'),
  getLivescoresInplay: () => api.getWithAuth('/livescores/inplay'),

  // Top scorers
  getTopScorers: (seasonId: string | number) => api.getWithAuth(`/topscorers/seasons/${seasonId}`),

  // Team top scorers & assists (for fixture details)
  getTeamTopStats: (teamId: string | number, seasonId: string | number) =>
    api.getWithAuth(`/teams/${teamId}/topstats/seasons/${seasonId}`),

  // Full squad with all player statistics (for team roster table)
  getTeamFullSquad: (teamId: string | number, seasonId: string | number) =>
    api.getWithAuth(`/teams/${teamId}/fullsquad/seasons/${seasonId}`),

  // Predictions
  getPredictions: (fixtureId: string | number) =>
    api.getWithAuth(`/fixtures/${fixtureId}/predictions`),

  // Prediction Model Performance (accuracy stats by league)
  // leagueId: 8 (Premier League), 24 (FA Cup), 27 (Carabao Cup)
  getPredictability: (leagueId: string | number) =>
    api.getWithAuth(`/predictions/predictability/leagues/${leagueId}`),

  // Stages (for cup competitions - fixtures organized by stage/round)
  getStagesBySeason: (seasonId: string | number) =>
    api.getWithAuth(`/fixtures/seasons/${seasonId}`),

  // Corner averages (calculated from historical fixtures, cached 12h)
  // Returns home/away/overall corner averages for a team in a season
  getTeamCornerAverages: (teamId: string | number, seasonId: string | number) =>
    api.getWithAuth(`/teams/${teamId}/corners/seasons/${seasonId}`),
};

// ============================================
// ADMIN API (requires admin privileges)
// ============================================

export const adminApi = {
  // Sync SportsMonks types from API to local database
  syncTypes: (token: string) => api.postAuth('/admin/types/sync', {}, token),
};

export default api;
