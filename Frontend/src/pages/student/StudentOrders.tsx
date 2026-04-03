import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, ShoppingBag, Clock, Package, Loader2, AlertCircle, FileDown, MapPin, User } from "lucide-react";
import { useMyOrders } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { BASE_URL } from "@/lib/api";

const navItems = [
  { label: "Browse", path: "/student-dashboard", icon: <Home className="w-4 h-4" /> },
  { label: "Orders", path: "/student-dashboard/orders", icon: <ShoppingBag className="w-4 h-4" /> },
  { label: "Cart", path: "/student-dashboard/cart", icon: <Clock className="w-4 h-4" /> },
  { label: "Addresses", path: "/student-dashboard/addresses", icon: <MapPin className="w-4 h-4" /> },
  { label: "Profile", path: "/student-dashboard/profile", icon: <User className="w-4 h-4" /> },
];

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 shadow-none",
  accepted: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0 shadow-none",
  preparing: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-0 shadow-none",
  delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 shadow-none font-bold",
};

const StudentOrders = () => {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: orders = [], isLoading, isError } = useMyOrders(currentUser?.token || "");
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
      
      toast({ title: "Invoice downloaded", description: "PDF has been saved to your device." });
    } catch (error: any) {
      console.error("Invoice Download Error:", error);
      toast({ 
        title: "Download failed", 
        description: error.message || "Could not generate your invoice. Please try again later.",
        variant: "destructive" 
      });
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout navItems={navItems} title="My Orders">
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
          <p className="font-medium">Fetching your order history...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout navItems={navItems} title="My Orders">
        <div className="text-center py-20 px-6 max-w-sm mx-auto">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive opacity-40" />
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">Could not load your orders. Let's try again.</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
            Refresh Page
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="My Orders">
      <div className="max-w-2xl mx-auto space-y-4 animate-fade-in pb-10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold tracking-tight">Recent Orders</h2>
          <Badge variant="secondary" className="font-bold opacity-70">{orders.length} Total</Badge>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-24 bg-card/40 rounded-3xl border-2 border-dashed border-border/50">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30 animate-pulse" />
            <h2 className="text-2xl font-black mb-2 italic">Hungry? 🥘</h2>
            <p className="text-muted-foreground mb-8 max-w-xs mx-auto">Your order history will appear here once you place your first order.</p>
            <Button onClick={() => navigate("/student-dashboard")} className="gradient-primary text-primary-foreground font-bold px-8 h-12 shadow-md">
              Order Now
            </Button>
          </div>
        ) : (
          orders.map((order) => (
            <Card key={order._id} className="animate-slide-up group hover:shadow-lg hover:border-primary/20 transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-border/40">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-black text-base group-hover:text-primary transition-colors uppercase tracking-tight">Order #{order._id.slice(-6).toUpperCase()}</p>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{new Date(order.createdAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}</p>
                    </div>
                  </div>
                  <Badge className={`${statusColors[order.status] || "bg-muted"} capitalize px-4 py-1.5 rounded-full font-black text-[10px] tracking-wider shadow-sm`}>
                    {order.status}
                  </Badge>
                </div>

                <div className="space-y-4">
                   <div className="flex flex-col gap-1">
                      <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Ordered From</p>
                      <p className="font-bold text-sm leading-none">{order.chefId?.name || "Premium Chef"}</p>
                   </div>

                  <div className="bg-muted/30 p-4 rounded-2xl space-y-2 border border-border/30">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-sm font-medium">
                        <span className="flex items-center gap-1.5 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                          {item.name} <span className="text-muted-foreground font-bold text-xs">×{item.quantity}</span>
                        </span>
                        <span className="font-black text-foreground">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-end pt-2">
                    <div className="space-y-0.5 min-w-0 flex-1 mr-4">
                       <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest leading-none">Deliver To</p>
                       <span className="text-xs font-bold text-muted-foreground/80 line-clamp-1 truncate">
                        {order.addressSnapshot ? `${order.addressSnapshot.label} - ${order.addressSnapshot.addressLine}` : "Saved Address"}
                       </span>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                       <span className="text-2xl font-black text-primary tracking-tighter leading-none">₹{order.totalAmount}</span>
                       <div className="flex items-center gap-2">
                         {order.paymentMethod === "cod" && order.paymentStatus === "pending" ? (
                           <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 shadow-none font-black text-[8px] px-2 py-0.5 rounded-lg tracking-widest">PAY ON DELIVERY</Badge>
                         ) : (
                           <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 shadow-none font-black text-[8px] px-2 py-0.5 rounded-lg tracking-widest">PAID</Badge>
                         )}
                         <span className="text-[10px] font-bold text-muted-foreground opacity-50">₹{order.itemsTotal} + Fees</span>
                       </div>
                    </div>
                  </div>

                  {order.status === "delivered" && (
                    <div className="pt-2">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => handleDownloadInvoice(order._id)}
                        disabled={downloadingId === order._id}
                        className="w-full font-black text-[10px] uppercase tracking-widest rounded-xl h-12 gap-2 shadow-sm"
                      >
                        {downloadingId === order._id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        ) : (
                          <FileDown className="w-4 h-4 text-primary" />
                        )}
                        {downloadingId === order._id ? "Generating Invoice..." : "Download Invoice"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentOrders;
