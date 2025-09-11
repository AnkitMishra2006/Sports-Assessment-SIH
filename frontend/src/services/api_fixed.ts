// API service for exercise analysis platform
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Auth token management
let authToken: string | null = localStorage.getItem("auth_token");

export const setAuthToken = (token: string) => {
  authToken = token;
  localStorage.setItem("auth_token", token);
};

export const getAuthToken = (): string | null => {
  return authToken;
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem("auth_token");
};

// Test connection to backend
export const testConnection = async () => {
  try {
    console.log(`Testing connection to: ${API_BASE_URL}`);
    const response = await fetch(`${API_BASE_URL}/../health`, {
      method: "GET",
      mode: "cors",
    });
    console.log(`Health check response: ${response.status}`);
    return response.ok;
  } catch (error) {
    console.error("Connection test failed:", error);
    return false;
  }
};

// API request wrapper with auth
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Only set Content-Type if not uploading files
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  console.log(`Making API request to: ${url}`);
  console.log(`Headers:`, headers);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log(`Response status: ${response.status}`);

    if (response.status === 401) {
      clearAuthToken();
      window.location.href = "/athlete/login";
      throw new Error("Authentication required");
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error Response:`, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    // Handle both JSON and non-JSON responses
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      console.log(`Response data:`, data);
      return data;
    }
    return response.text();
  } catch (error) {
    console.error(`API Request failed:`, error);
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Network error - Unable to connect to server. Please check if the backend is running."
      );
    }
    throw error;
  }
};

// Authentication API
export const authAPI = {
  login: async (
    email: string,
    password: string,
    role: "athlete" | "official"
  ) => {
    return apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    });
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    district: string;
    state: string;
    sport?: string;
    height?: number;
    weight?: number;
  }) => {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ ...userData, role: "athlete" }),
    });
  },

  logout: async () => {
    clearAuthToken();
    return Promise.resolve({ success: true });
  },

  getCurrentUser: async () => {
    return apiRequest("/auth/me");
  },
};

// Athlete API
export const athleteAPI = {
  getProfile: async () => {
    return apiRequest("/athletes/profile");
  },

  updateProfile: async (profileData: {
    personalInfo?: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      dateOfBirth?: string;
      gender?: "male" | "female" | "other";
    };
    physicalAttributes?: {
      height?: number;
      weight?: number;
      dominantHand?: "left" | "right" | "ambidextrous";
      fitnessLevel?: "beginner" | "intermediate" | "advanced";
    };
    medicalHistory?: {
      previousInjuries?: string[];
      currentMedications?: string[];
      allergies?: string[];
      chronicConditions?: string[];
      fitnessRestrictions?: string[];
      lastPhysicalExam?: string;
    };
  }) => {
    return apiRequest("/athletes/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  },

  getSubmissions: async (page = 1, limit = 20) => {
    return apiRequest(`/athletes/submissions?page=${page}&limit=${limit}`);
  },

  getSubmissionById: async (submissionId: string) => {
    return apiRequest(`/athletes/submissions/${submissionId}`);
  },

  getProgressTracking: async (exerciseType?: string) => {
    const query = exerciseType ? `?exerciseType=${exerciseType}` : "";
    return apiRequest(`/athletes/progress${query}`);
  },
};

// Exercise Analysis API - Updated to match backend
export const analysisAPI = {
  analyzeVideo: async (
    exerciseType: string,
    videoFile: File,
    onProgress?: (progress: number) => void
  ) => {
    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("exerciseType", exerciseType);

    console.log(
      `Starting video upload for ${exerciseType}, file size: ${videoFile.size} bytes`
    );

    // Create XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          console.log(`Upload progress: ${Math.round(progress)}%`);
          onProgress(Math.round(progress));
        }
      });

      xhr.addEventListener("load", () => {
        console.log(`Upload completed with status: ${xhr.status}`);
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log(`Upload successful:`, response);
            resolve(response);
          } catch (e) {
            console.error("Failed to parse response:", xhr.responseText);
            reject(new Error("Invalid JSON response from server"));
          }
        } else {
          console.error(
            `Upload failed with status ${xhr.status}:`,
            xhr.responseText
          );
          reject(
            new Error(
              `HTTP ${xhr.status}: ${xhr.statusText || "Upload failed"}`
            )
          );
        }
      });

      xhr.addEventListener("error", (event) => {
        console.error("Network error during upload:", event);
        reject(
          new Error(
            "Network error occurred during upload. Please check your internet connection and try again."
          )
        );
      });

      xhr.addEventListener("timeout", () => {
        console.error("Upload timeout");
        reject(
          new Error("Upload timeout - please try again with a smaller file")
        );
      });

      xhr.timeout = 120000; // 2 minute timeout
      xhr.open("POST", `${API_BASE_URL}/analysis/analyze-video`);

      // Add auth header if available
      if (authToken) {
        xhr.setRequestHeader("Authorization", `Bearer ${authToken}`);
      }

      console.log(`Starting upload to: ${API_BASE_URL}/analysis/analyze-video`);
      xhr.send(formData);
    });
  },

  getAnalysisResults: async (submissionId: string) => {
    return apiRequest(`/analysis/results/${submissionId}`);
  },

  getSessionHistory: async (page = 1, limit = 20) => {
    return apiRequest(`/analysis/history?page=${page}&limit=${limit}`);
  },

  getVideoUrl: (filename: string) => {
    return `${API_BASE_URL}/analysis/video/${filename}`;
  },

  // Submit analysis results to backend
  submitAnalysis: async (analysisData: {
    exerciseType: string;
    result: number;
    resultUnit: string;
    percentile?: number;
    attempts: number;
    bestScore: number;
    videoFilename?: string;
    analysisResults?: {
      total_reps?: number;
      left_reps?: number;
      right_reps?: number;
      form_score?: number;
      consistency_score?: number;
      max_height_cm?: number;
      jump_count?: number;
      cheat_detected?: boolean;
      form_issues?: string[];
      frames_processed?: number;
      detection_quality?: number;
    };
  }) => {
    return apiRequest("/analysis/submit", {
      method: "POST",
      body: JSON.stringify(analysisData),
    });
  },
};

// Official API
export const officialAPI = {
  getProfile: async () => {
    return apiRequest("/officials/profile");
  },

  getAllSubmissions: async (
    page = 1,
    limit = 20,
    filters?: {
      status?: string;
      exerciseType?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ) => {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters &&
        Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined)
        )),
    }).toString();

    return apiRequest(`/officials/submissions?${query}`);
  },

  updateSubmissionStatus: async (
    submissionId: string,
    status: "pending" | "approved" | "rejected" | "flagged",
    notes?: string
  ) => {
    return apiRequest(`/officials/submissions/${submissionId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, notes }),
    });
  },

  getAnalytics: async (dateFrom?: string, dateTo?: string) => {
    const query = new URLSearchParams({
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
    }).toString();

    return apiRequest(`/officials/analytics${query ? `?${query}` : ""}`);
  },

  generateReport: async (
    exerciseType?: string,
    dateFrom?: string,
    dateTo?: string
  ) => {
    const query = new URLSearchParams({
      ...(exerciseType && { exerciseType }),
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
    }).toString();

    return apiRequest(`/officials/reports${query ? `?${query}` : ""}`);
  },
};

export default {
  authAPI,
  athleteAPI,
  analysisAPI,
  officialAPI,
  setAuthToken,
  getAuthToken,
  clearAuthToken,
  testConnection,
};
