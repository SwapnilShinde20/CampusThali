import { ReactNode } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, LogOut, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/lib/api";

interface NavItem { label: string; path: string; icon: ReactNode; }

interface Props {
  children: ReactNode;
  navItems: NavItem[];
  title: string;
}

const DashboardLayout = ({ children, navItems, title }: Props) => {
  const { currentUser, chefProfile, logout, cart } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col shrink-0 hidden md:flex">
        <div className="p-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">CampusThali</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"}`}>
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              {currentUser?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser?.name}</p>
              <p className="text-xs text-sidebar-foreground/50 capitalize">{currentUser?.role}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b flex items-center justify-between px-4 md:px-6 bg-card">
          <h1 className="text-lg font-bold">{title}</h1>
          <div className="flex items-center gap-3">
            {currentUser?.role === "student" && (
              <div className="flex items-center gap-4">
                <Link to="/student-dashboard/profile" className="flex items-center gap-2 text-sm font-bold hover:text-primary transition-colors">
                   <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xs overflow-hidden">
                    {currentUser?.avatar ? (
                      <img src={getImageUrl(currentUser.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      currentUser?.name?.charAt(0)
                    )}
                  </div>
                  <span className="hidden sm:inline">Profile</span>
                </Link>
                <Link to="/student-dashboard/cart" className="relative p-2 rounded-full hover:bg-accent transition-colors">
                  <ShoppingCart className="w-5 h-5 text-muted-foreground" />
                  {cart.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] gradient-primary text-primary-foreground border-0 shadow-sm">{cart.length}</Badge>
                  )}
                </Link>
              </div>
            )}
            
            {currentUser?.role === "chef" && (
              <Link to="/chef/profile-setup" className="flex items-center gap-2 text-sm font-bold hover:text-primary transition-colors">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xs overflow-hidden">
                  {chefProfile?.profileImage ? (
                    <img src={getImageUrl(chefProfile.profileImage)} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    currentUser?.name?.charAt(0)
                  )}
                </div>
                <span className="hidden sm:inline">Profile</span>
              </Link>
            )}

            {/* Mobile menu */}
            <div className="md:hidden flex items-center gap-2">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}
                  className={`p-2 rounded-lg ${location.pathname === item.path ? "bg-accent text-primary" : "text-muted-foreground"}`}>
                  {item.icon}
                </Link>
              ))}
              <Button variant="ghost" size="icon" onClick={handleLogout}><LogOut className="w-4 h-4" /></Button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
