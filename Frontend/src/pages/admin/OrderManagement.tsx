import { useApp } from "@/contexts/AppContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAdminOrders } from "@/hooks/useAdmin";
import { adminNavItems } from "@/constants/adminNav";
import { ShoppingBag, Loader2, Filter, Search, CreditCard, Banknote } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const OrderManagement = () => {
  const { currentUser } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  
  const { data: orders = [], isLoading } = useAdminOrders(
    currentUser?.token || "",
    statusFilter === "all" ? undefined : statusFilter,
    paymentFilter === "all" ? undefined : paymentFilter
  );

  if (isLoading) {
    return (
      <DashboardLayout navItems={adminNavItems} title="Order Management">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 shadow-none",
    accepted: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0 shadow-none",
    preparing: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-0 shadow-none",
    delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 shadow-none font-bold",
  };

  return (
    <DashboardLayout navItems={adminNavItems} title="Order Management">
      <div className="space-y-6 animate-fade-in pb-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-black italic">Platform Orders ({orders.length})</h2>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex-1 md:w-40">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 rounded-xl border-2 focus:ring-0 focus:border-primary transition-all">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 shadow-xl">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 md:w-40">
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="h-10 rounded-xl border-2 focus:ring-0 focus:border-primary transition-all">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 shadow-xl">
                  <SelectItem value="all">All Payment</SelectItem>
                  <SelectItem value="cod">Cash on Delivery</SelectItem>
                  <SelectItem value="online">Online Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {orders.map((order) => (
            <Card key={order._id} className="border-none shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-0">
                <div className="p-6 grid grid-cols-1 md:grid-cols-4 items-center gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Order ID</p>
                    <p className="font-bold text-sm">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                       {new Date(order.createdAt).toLocaleDateString()} · {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Transaction</p>
                    <h3 className="text-xl font-black text-primary tracking-tighter">₹{order.totalAmount}</h3>
                    <div className="flex items-center gap-1.5 pt-1">
                       {order.paymentMethod === 'online' ? <CreditCard className="w-3 h-3 text-emerald-500" /> : <Banknote className="w-3 h-3 text-amber-500" />}
                       <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">{order.paymentMethod === 'online' ? 'Online Paid' : 'Cash on Delivery'}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                       <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-[10px] text-primary">S</div>
                       <p className="text-xs font-bold text-foreground/80 truncate">{order.studentId?.name || "Student"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center font-bold text-[10px] text-amber-600">C</div>
                       <p className="text-xs font-bold text-foreground/80 truncate">{order.chefId?.name || "Premium Chef"}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge className={`${statusColors[order.status] || "bg-muted"} capitalize px-4 py-1.5 rounded-full font-black text-[10px] tracking-wider shadow-sm`}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrderManagement;
