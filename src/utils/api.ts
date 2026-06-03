let resolved_url = process.env.NEXT_PUBLIC_API_URL;

if (!resolved_url) {
  if (typeof window !== "undefined") {
    const port = window.location.port;
    if (port === "3000" || port === "3001" || port === "3002") {
      resolved_url = "http://localhost:8000";
    } else {
      resolved_url = "";
    }
  } else {
    resolved_url = "http://localhost:8000";
  }
}

export const API_BASE_URL = resolved_url;

export function getAuthHeaders(contentType: string | null = "application/json"): HeadersInit {
  const headers: HeadersInit = {};
  if (contentType) {
    headers["Content-Type"] = contentType;
  }
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("hireiq_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}
