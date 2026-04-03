const BASE_URL = import.meta.env.VITE_API_URL + "/api" || "http://localhost:5000/api";

export const api = {
  get: async (path: string, token?: string) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "API error");
    return data;
  },
  post: async (path: string, body: unknown, token?: string) => {
    const isFormData = body instanceof FormData;
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        ...(!isFormData && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: isFormData ? body : JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "API error");
    return data;
  },
  put: async (path: string, body: unknown, token?: string) => {
    const isFormData = body instanceof FormData;
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "PUT",
      headers: {
        ...(!isFormData && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: isFormData ? body : JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "API error");
    return data;
  },
  delete: async (path: string, token?: string) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "DELETE",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "API error");
    return data;
  },
  patch: async (path: string, body: unknown, token?: string) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "API error");
    return data;
  },
};

export const getImageUrl = (imagePath: string) => {
  if (!imagePath) return "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400";
  if (imagePath.startsWith("http")) return imagePath;

  const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
  return `${SERVER_URL}/${imagePath}`;
};
