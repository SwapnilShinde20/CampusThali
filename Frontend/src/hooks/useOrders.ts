import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface ApiOrder {
  _id: string;
  studentId: any;
  chefId: any;
  items: Array<{
    menuId: any;
    name: string;
    quantity: number;
    price: number;
  }>;
  itemsTotal: number;
  deliveryFee: number;
  platformFee: number;
  totalAmount: number;
  commission: number;
  chefEarning: number;
  addressId: string;
  addressSnapshot: {
    label: string;
    receiverPhone: string;
    addressLine: string;
    city: string;
    pincode: string;
  };
  status: string;
  paymentMethod: "cod" | "online";
  paymentStatus: "pending" | "paid" | "failed";
  createdAt: string;
}

const fetchMyOrders = async (token: string): Promise<ApiOrder[]> => {
  const response = await api.get("/orders/my", token);
  return response.data;
};

const fetchChefOrders = async (token: string): Promise<ApiOrder[]> => {
  const response = await api.get("/orders/chef", token);
  return response.data;
};

const placeOrder = async ({ orderData, token }: { orderData: any; token: string }) => {
  const response = await api.post("/orders", orderData, token);
  return response.data;
};

const updateOrderStatus = async ({ orderId, status, token }: { orderId: string; status: string; token: string }) => {
  const response = await api.put(`/orders/${orderId}/status`, { status }, token);
  return response.data;
};

export const useMyOrders = (token: string) => {
  return useQuery<ApiOrder[], Error>({
    queryKey: ["orders", "my"],
    queryFn: () => fetchMyOrders(token),
    enabled: !!token,
  });
};

export const useChefOrders = (token: string) => {
  return useQuery<ApiOrder[], Error>({
    queryKey: ["orders", "chef"],
    queryFn: () => fetchChefOrders(token),
    enabled: !!token,
    refetchInterval: 5000,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: placeOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
