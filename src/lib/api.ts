// User interface matching backend response
export interface User {
  id: string;
  display_name: string;
  course: string;
  year_of_study: number;
  interests: string[];
  avatar_url: string;
  is_online: boolean;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  locationZone?: string;
  creator?: {
    displayName: string;
    vitEmail: string;
  };
}

export interface AuthResponse {
  message: string;
  userId: string;
  token: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  vitEmail: string;
  course: string | null;
  yearOfStudy: number | null;
  hostelBlock: string | null;
  interests: string[];
  avatar_url: string;
  is_online: boolean;
  recent_events?: Event[];
}

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api`;

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('vybe_token');
  }
  return null;
};

// Helper function for authenticated requests
const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, { ...options, headers });
};

// Auth APIs
export const signup = async (
  email: string,
  name: string,
  password: string
): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Signup failed');
  }

  return response.json();
};

export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  return response.json();
};

export const getCurrentUser = async (): Promise<UserProfile> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/auth/me`);

  if (!response.ok) {
    throw new Error('Failed to fetch current user');
  }

  return response.json();
};

export const setupProfile = async (
  course: string,
  year_of_study: number,
  hostel_block: string,
  interests: string[]
): Promise<{ message: string; user: UserProfile }> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/auth/setup`, {
    method: 'POST',
    body: JSON.stringify({
      course,
      year_of_study,
      hostel_block,
      interests,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Profile setup failed');
  }

  return response.json();
};

// User APIs
export const fetchUsers = async (
  department?: string,
  year?: number
): Promise<User[]> => {
  const params = new URLSearchParams();
  if (department) params.append('department', department);
  if (year) params.append('year', year.toString());

  const queryString = params.toString();
  const url = queryString
    ? `${API_BASE_URL}/users?${queryString}`
    : `${API_BASE_URL}/users`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json();
};

export const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return response.json();
};

export const setUserOnline = async (userId: string): Promise<{ status: string }> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/users/${userId}/online`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to set user online');
  }

  return response.json();
};

export const setUserOffline = async (userId: string): Promise<{ status: string }> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/users/${userId}/offline`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to set user offline');
  }

  return response.json();
};

// Event APIs
export const fetchEvents = async (): Promise<Event[]> => {
  const response = await fetch(`${API_BASE_URL}/events`);

  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }

  return response.json();
};

export const createEvent = async (
  title: string,
  description: string,
  startTime: string,
  locationZone: string
): Promise<Event> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/events`, {
    method: 'POST',
    body: JSON.stringify({
      title,
      description,
      startTime,
      locationZone,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create event');
  }

  return response.json();
};
