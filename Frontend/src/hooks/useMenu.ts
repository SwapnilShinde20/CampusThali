import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface ApiMenuItem {
  _id: string;
  chefId: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  isVeg: boolean;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

const fetchMenu = async (chefId: string): Promise<ApiMenuItem[]> => {
  console.log(`Fetching menu for chef: ${chefId}`);
  const response = await api.get(`/menu/${chefId}`);
  console.log(`Menu API response for ${chefId}:`, response.data);
  return response.data;
};

const createMenuItem = async ({ itemData, token }: { itemData: any; token: string }) => {
  const response = await api.post("/menu", itemData, token);
  return response.data;
};

const updateMenuItem = async ({ id, itemData, token }: { id: string; itemData: any; token: string }) => {
  const response = await api.put(`/menu/${id}`, itemData, token);
  return response.data;
};

const deleteMenuItem = async ({ id, token }: { id: string; token: string }) => {
  const response = await api.delete(`/menu/${id}`, token);
  return response.data;
};

export const useMenu = (chefId: string) => {
  return useQuery<ApiMenuItem[], Error>({
    queryKey: ["menu", chefId],
    queryFn: () => fetchMenu(chefId),
    enabled: !!chefId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useCreateMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMenuItem,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["menu", variables.itemData.chefId] });
    },
  });
};

export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMenuItem,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["menu", data.chefId] });
    },
  });
};

export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
    },
  });
};
