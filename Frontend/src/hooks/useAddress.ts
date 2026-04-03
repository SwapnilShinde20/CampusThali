import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface ApiAddress {
  _id: string;
  userId: string;
  label: "Home" | "Work" | "Others";
  buildingType: "Society" | "Independent house" | "Standalone" | "Office" | "Hotel" | "Others";
  addressLine: string;
  houseNo?: string;
  buildingName?: string;
  landmark?: string;
  area?: string;
  city: string;
  pincode: string;
  lat: number;
  lng: number;
  receiverName: string;
  receiverPhone: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

const fetchAddresses = async (token: string): Promise<ApiAddress[]> => {
  const response = await api.get("/address", token);
  return response.data;
};

const createAddress = async ({ data, token }: { data: any; token: string }) => {
  const response = await api.post("/address", data, token);
  return response.data;
};

const updateAddress = async ({ id, data, token }: { id: string; data: any; token: string }) => {
  const response = await api.patch(`/address/${id}`, data, token);
  return response.data;
};

const deleteAddress = async ({ id, token }: { id: string; token: string }) => {
  const response = await api.delete(`/address/${id}`, token);
  return response.data;
};

const setDefaultAddress = async ({ id, token }: { id: string; token: string }) => {
  const response = await api.patch(`/address/${id}/default`, {}, token);
  return response.data;
};

export const useAddresses = (token: string) => {
  return useQuery<ApiAddress[], Error>({
    queryKey: ["addresses"],
    queryFn: () => fetchAddresses(token),
    enabled: !!token,
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
};

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setDefaultAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
};
