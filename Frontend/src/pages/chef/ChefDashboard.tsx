import { useApp } from "@/contexts/AppContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ShoppingBag, 
  IndianRupee, 
  TrendingUp, 
  Package,
  Activity,
  AlertCircle,
  User
} from "lucide-react";
import { useChefProfileMe } from "@/hooks/useChefs";
import { useChefOrders } from "@/hooks/useOrders";
import { useMenu } from "@/hooks/useMenu";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", path: "/chef-dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Menu", path: "/chef-dashboard/menu", icon: <UtensilsCrossed className="w-4 h-4" /> },
  { label: "Orders", path: "/chef-dashboard/orders", icon: <ShoppingBag className="w-4 h-4" /> },
  { label: "Profile", path: "/chef/profile-setup", icon: <User className="w-4 h-4" /> },
];

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  accepted: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  preparing: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const ChefDashboard = () => {
  const { currentUser } = useApp();
  
  // Real Data Hooks
  const { data: chef, isLoading: profileLoading, isError: profileError } = useChefProfileMe(currentUser?.token || "");
  const { data: orders = [], isLoading: ordersLoading } = useChefOrders(currentUser?.token || "");
  const { data: menu = [], isLoading: menuLoading } = useMenu(currentUser?.id || "");

  console.log("Chef Dashboard Debug:", {
    userId: currentUser?.id,
    chefProfileId: chef?._id,
    orderCount: orders.length,
    menuCount: menu.length
  });

  const activeOrders = orders.filter((o) => o.status !== "delivered").length;
  const totalEarnings = orders
    .filter(o => o.status === "delivered")
    .reduce((sum, o) => sum + (o.chefEarning || 0), 0);

  if (profileLoading || ordersLoading || menuLoading) {
    return (
      <DashboardLayout navItems={navItems} title="Chef Dashboard">
        <div className="flex items-center justify-center h-64">
          <Activity className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (profileError || !chef) {
    return (
      <DashboardLayout navItems={navItems} title="Chef Dashboard">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-8 text-center space-y-3">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <h3 className="text-lg font-bold">Chef Profile Missing</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              We couldn't find your chef profile. Please contact support to verify your account status.
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Chef Dashboard">
      <div className="space-y-6 animate-fade-in">
        {/* Profile Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-primary/5 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-black">
                  {currentUser?.name[0]}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{currentUser?.name}</h2>
                  <p className="text-muted-foreground">{chef.bio || "Welcome to your kitchen dashboard!"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-background p-3 rounded-2xl border border-border/50 shadow-sm">
                <Badge className={chef.isAvailable ? "bg-emerald-500 hover:bg-emerald-600" : "bg-muted"}>
                  {chef.isAvailable ? "Online" : "Offline"}
                </Badge>
                <div className="h-4 w-[1px] bg-border/50" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{chef.college}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-all">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-tight">Earnings</p>
                <p className="text-2xl font-black">₹{totalEarnings.toFixed(0)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-all">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-tight">Menu Items</p>
                <p className="text-2xl font-black">{menu.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-all">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-tight">Active Orders</p>
                <p className="text-2xl font-black">{activeOrders}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders Snippet */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Recent Activity</h3>
            <Button variant="ghost" size="sm" className="text-primary font-bold">View History</Button>
          </div>
          {orders.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center text-muted-foreground">
                No orders yet. They will appear here once students start ordering.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {orders.slice(0, 3).map((order) => (
                <Card key={order._id} className="hover:border-primary/20 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-xs uppercase">
                        {order.studentId?.name?.[0] || 'S'}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{order.studentId?.name || "Student"}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-primary">₹{order.totalAmount}</span>
                      <Badge className={`${statusColors[order.status] || "bg-muted"} capitalize border-0 font-bold px-3`}>
                        {order.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChefDashboard;
