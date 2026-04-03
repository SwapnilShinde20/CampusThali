import { LayoutDashboard, Users, ShoppingBag, ChefHat } from "lucide-react";
import { ReactNode } from "react";

export interface AdminNavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

export const adminNavItems: AdminNavItem[] = [
  { label: "Overview", path: "/admin-dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Chefs", path: "/admin-dashboard/chefs", icon: <ChefHat className="w-4 h-4" /> },
  { label: "Orders", path: "/admin-dashboard/orders", icon: <ShoppingBag className="w-4 h-4" /> },
  { label: "Users", path: "/admin-dashboard/users", icon: <Users className="w-4 h-4" /> },
];
