import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ApiOrder } from "./useOrders";

export interface AdminStats {
  totalUsers: number;
  totalChefs: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface AdminChef {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  isApproved: boolean;
  rating: number;
  college: string;
  phone?: string;
  createdAt: string;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "student" | "chef" | "admin";
  createdAt: string;
}

const fetchStats = async (token: string): Promise<AdminStats> => {
  const response = await api.get("/admin/stats", token);
  return response;
};

const fetchUsers = async (token: string): Promise<AdminUser[]> => {
  const response = await api.get("/admin/users", token);
  return response;
};

const fetchChefs = async (token: string): Promise<AdminChef[]> => {
  const response = await api.get("/admin/chefs", token);
  return response;
};

const fetchOrders = async (token: string, status?: string, payment?: string): Promise<ApiOrder[]> => {
  let url = "/admin/orders";
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (payment) params.append("paymentMethod", payment);
  if (params.toString()) url += `?${params.toString()}`;
  
  const response = await api.get(url, token);
  return response;
};

export const useAdminStats = (token: string) => {
  return useQuery<AdminStats, Error>({
    queryKey: ["admin", "stats"],
    queryFn: () => fetchStats(token),
    enabled: !!token,
  });
};

export const useAdminUsers = (token: string) => {
  return useQuery<AdminUser[], Error>({
    queryKey: ["admin", "users"],
    queryFn: () => fetchUsers(token),
    enabled: !!token,
  });
};

export const useAdminChefs = (token: string) => {
  return useQuery<AdminChef[], Error>({
    queryKey: ["admin", "chefs"],
    queryFn: () => fetchChefs(token),
    enabled: !!token,
  });
};

export const useAdminOrders = (token: string, status?: string, payment?: string) => {
  return useQuery<ApiOrder[], Error>({
    queryKey: ["admin", "orders", status, payment],
    queryFn: () => fetchOrders(token, status, payment),
    enabled: !!token,
  });
};

export const useApproveChef = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, token }: { id: string; token: string }) => {
      const response = await api.patch(`/admin/chefs/${id}/approve`, {}, token);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "chefs"] });
    },
  });
};

export const useRejectChef = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, token }: { id: string; token: string }) => {
      const response = await api.patch(`/admin/chefs/${id}/reject`, {}, token);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "chefs"] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, token }: { id: string; token: string }) => {
      const response = await api.delete(`/admin/users/${id}`, token);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};
