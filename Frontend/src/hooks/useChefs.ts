import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface ApiChef {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
  bio: string;
  college: string;
  rating: number;
  profileImage?: string;
  isApproved: boolean;
  isAvailable: boolean;
  isProfileComplete?: boolean;
  createdAt: string;
  updatedAt: string;
}

const fetchChefs = async (college?: string): Promise<ApiChef[]> => {
  const query = college ? `?college=${encodeURIComponent(college)}` : "";
  const response = await api.get(`/chefs${query}`);
  return response.data;
};

const fetchChef = async (id: string): Promise<ApiChef> => {
  const response = await api.get(`/chefs/${id}`);
  return response.data;
};

const fetchChefMe = async (token: string): Promise<ApiChef> => {
  console.log("Fetching chef profile for logged in user...");
  const response = await api.get(`/chefs/me`, token);
  console.log("Chef profile API response:", response.data);
  return response.data;
};

export const useChefs = (college?: string) => {
  return useQuery<ApiChef[], Error>({
    queryKey: ["chefs", college],
    queryFn: () => fetchChefs(college),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useChef = (id: string) => {
  return useQuery<ApiChef, Error>({
    queryKey: ["chef", id],
    queryFn: () => fetchChef(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useChefProfileMe = (token: string) => {
  return useQuery<ApiChef, Error>({
    queryKey: ["chef-me"],
    queryFn: () => fetchChefMe(token),
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
