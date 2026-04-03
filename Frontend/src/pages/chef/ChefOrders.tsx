import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ShoppingBag, 
  Package, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  ChefHat,
  MapPin,
  Calendar,
  IndianRupee,
  Phone,
  FileDown,
  User
} from "lucide-react";
import { useChefOrders, useUpdateOrderStatus, ApiOrder } from "@/hooks/useOrders";
import { BASE_URL } from "@/lib/api";

const navItems = [
  { label: "Dashboard", path: "/chef-dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Menu", path: "/chef-dashboard/menu", icon: <UtensilsCrossed className="w-4 h-4" /> },
  { label: "Orders", path: "/chef-dashboard/orders", icon: <ShoppingBag className="w-4 h-4" /> },
  { label: "Profile", path: "/chef/profile-setup", icon: <User className="w-4 h-4" /> },
];

const statusStyles: Record<string, { bg: string; text: string; icon: any }> = {
  pending: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", icon: Clock },
  accepted: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", icon: CheckCircle2 },
  preparing: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-400", icon: ChefHat },
  delivered: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", icon: Package },
};

const getNextStatus = (current: string) => {
  switch (current) {
    case "pending": return { status: "accepted", label: "Accept Order" };
    case "accepted": return { status: "preparing", label: "Start Preparing" };
    case "preparing": return { status: "delivered", label: "Mark Delivered" };
    default: return null;
  }
};

const ChefOrders = () => {
  const { currentUser } = useApp();
  const { toast } = useToast();
  
  const { data: orders = [], isLoading, isError } = useChefOrders(currentUser?.token || "");
  const updateStatusMutation = useUpdateOrderStatus();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadInvoice = async (orderId: string) => {
    if (!currentUser?.token) return;
    
    setDownloadingId(orderId);
    try {
      const response = await fetch(`${BASE_URL}/orders/${orderId}/invoice`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to generate invoice");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice_${orderId.slice(-8).toUpperCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({ title: "Invoice downloaded" });
    } catch (error: any) {
      console.error("Chef Invoice Download Error:", error);
      toast({ 
        title: "Download failed", 
        description: error.message || "Could not generate invoice. Please try again.",
        variant: "destructive" 
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        orderId,
        status,
        token: currentUser?.token || "",
      });
      toast({ 
        title: `Order ${status}!`,
        description: `Order status has been updated to ${status}.`,
      });
    } catch (error) {
      toast({ 
        title: "Update failed", 
        description: "Could not update order status.", 
        variant: "destructive" 
      });
    }
  };

  // Sort by latest first
  const sortedOrders = [...orders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <DashboardLayout navItems={navItems} title="Order Management">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Active Orders</h2>
          <Badge variant="outline" className="px-3 py-1 font-semibold rounded-full border-primary/20 text-primary">
            {orders.length} Total Orders
          </Badge>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 4].map(i => (
              <div key={i} className="h-64 bg-card/50 rounded-2xl border border-border/50 animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20 bg-destructive/5 rounded-2xl border border-dashed border-destructive/20 text-destructive">
            <p className="font-semibold">Failed to load orders. Please refresh.</p>
          </div>
        ) : sortedOrders.length === 0 ? (
          <div className="text-center py-24 bg-muted/20 rounded-2xl border border-dashed border-border/50">
            <div className="w-16 h-16 bg-muted/40 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-bold mb-1">No active orders</h3>
            <p className="text-sm text-muted-foreground">When students order your food, they'll appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedOrders.map((order) => {
              const next = getNextStatus(order.status);
              const SIcon = statusStyles[order.status]?.icon || Clock;
              const sStyle = statusStyles[order.status] || statusStyles.pending;

              return (
                <Card key={order._id} className="overflow-hidden hover:shadow-lg transition-all border border-border/50 group">
                  <CardContent className="p-0">
                    {/* Header */}
                    <div className={`p-4 flex items-center justify-between border-b border-border/30 ${sStyle.bg}`}>
                      <div className="flex items-center gap-2">
                        <SIcon className={`w-4 h-4 ${sStyle.text}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${sStyle.text}`}>
                          {order.status}
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="p-5 space-y-4">
                      {/* Student Info */}
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-tight">Student</p>
                          <h4 className="font-bold text-lg">{order.studentId?.name || "Premium Student"}</h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {order.addressSnapshot?.label || "Home"} - {order.addressSnapshot?.addressLine || "Saved Address"}
                          </p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1 font-black uppercase tracking-widest">
                            <Phone className="w-2.5 h-2.5 opacity-60" /> {order.addressSnapshot?.receiverPhone || "No contact info"}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-widest px-2 py-1">#{order._id.slice(-6).toUpperCase()}</Badge>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="bg-muted/30 rounded-xl p-3 space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Order Items</p>
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="font-medium text-foreground/80">{item.name} <span className="text-muted-foreground ml-1">×{item.quantity}</span></span>
                            <span className="font-bold">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="pt-2 flex flex-col gap-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex flex-col text-right">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">My Earning</p>
                              <p className="text-xl font-black text-emerald-600 flex items-center justify-end gap-1">
                                <IndianRupee className="w-4 h-4" />
                                {order.chefEarning ? order.chefEarning.toFixed(0) : (order.totalAmount * 0.85).toFixed(0)}
                              </p>
                          </div>
                          
                          {next ? (
                            <Button 
                              className="gradient-primary text-primary-foreground font-bold shadow-md hover:translate-y-[-1px] transition-all px-6"
                              onClick={() => handleUpdateStatus(order._id, next.status)}
                              disabled={updateStatusMutation.isPending}
                            >
                              {updateStatusMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : null}
                              {next.label}
                            </Button>
                          ) : (
                            <div className="flex items-center gap-1 text-success font-bold text-sm">
                              <CheckCircle2 className="w-4 h-4" /> Done
                            </div>
                          )}
                        </div>

                        {order.status === "delivered" && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDownloadInvoice(order._id)}
                            disabled={downloadingId === order._id}
                            className="w-full font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-primary/5 hover:text-primary rounded-xl h-10 gap-2 border-dashed border-border/60"
                          >
                            {downloadingId === order._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <FileDown className="w-4 h-4" />
                            )}
                            {downloadingId === order._id ? "Generating..." : "Download Invoice"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ChefOrders;
