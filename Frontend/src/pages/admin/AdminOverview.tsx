import { useApp } from "@/contexts/AppContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingBag, 
  TrendingUp, 
  ChefHat,
  ArrowUpRight,
  Clock,
  Users
} from "lucide-react";
import { useAdminStats, useAdminOrders, useAdminChefs } from "@/hooks/useAdmin";
import { adminNavItems } from "@/constants/adminNav";
import { Loader2 } from "lucide-react";

const AdminOverview = () => {
  const { currentUser } = useApp();
  const { data: stats, isLoading: statsLoading } = useAdminStats(currentUser?.token || "");
  const { data: orders = [], isLoading: ordersLoading } = useAdminOrders(currentUser?.token || "");
  const { data: chefs = [], isLoading: chefsLoading } = useAdminChefs(currentUser?.token || "");

  if (statsLoading || ordersLoading || chefsLoading) {
    return (
      <DashboardLayout navItems={adminNavItems} title="Admin Overview">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const statCards = [
    { label: "Total Revenue", value: `₹${(stats?.totalRevenue || 0).toFixed(2)}`, icon: <TrendingUp className="w-5 h-5 text-emerald-500" />, color: "bg-emerald-500/10" },
    { label: "Total Orders", value: stats?.totalOrders || 0, icon: <ShoppingBag className="w-5 h-5 text-blue-500" />, color: "bg-blue-500/10" },
    { label: "Total Chefs", value: stats?.totalChefs || 0, icon: <ChefHat className="w-5 h-5 text-amber-500" />, color: "bg-amber-500/10" },
    { label: "Total Users", value: stats?.totalUsers || 0, icon: <Users className="w-5 h-5 text-indigo-500" />, color: "bg-indigo-500/10" },
  ];

  return (
    <DashboardLayout navItems={adminNavItems} title="Admin Overview">
      <div className="space-y-8 animate-fade-in pb-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <h3 className="text-2xl font-black mt-1">{stat.value}</h3>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-black italic flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Recent Orders
              </CardTitle>
              <Badge variant="outline" className="font-bold">{orders.slice(0, 5).length} New</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                        {order.studentId?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{order.studentId?.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black">₹{order.totalAmount} · {order.status}</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground/30" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* New Chefs */}
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-black italic flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-primary" /> New Chefs
              </CardTitle>
              <Badge variant="outline" className="font-bold">{chefs.filter(c => !c.isApproved).length} Pending</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chefs.slice(0, 5).map((chef) => (
                  <div key={chef._id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center font-bold text-xs text-amber-600">
                        {chef.userId?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{chef.userId?.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black">{chef.college}</p>
                      </div>
                    </div>
                    <Badge className={`${chef.isApproved ? "bg-emerald-500 text-white border-0" : "bg-secondary text-secondary-foreground"} text-[9px] font-black uppercase px-2 py-0.5 rounded-lg`}>
                      {chef.isApproved ? "Active" : "Under Review"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminOverview;
