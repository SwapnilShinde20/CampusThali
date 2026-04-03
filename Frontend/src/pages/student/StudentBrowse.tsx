import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, ShoppingBag, Clock, Search, Star, MapPin, ChefHat, Loader2, User } from "lucide-react";
import { useChefs } from "@/hooks/useChefs";
import { getImageUrl } from "@/lib/api";
import { useApp } from "@/contexts/AppContext";

const navItems = [
  { label: "Browse", path: "/student-dashboard", icon: <Home className="w-4 h-4" /> },
  { label: "Orders", path: "/student-dashboard/orders", icon: <ShoppingBag className="w-4 h-4" /> },
  { label: "Cart", path: "/student-dashboard/cart", icon: <Clock className="w-4 h-4" /> },
  { label: "Addresses", path: "/student-dashboard/addresses", icon: <MapPin className="w-4 h-4" /> },
  { label: "Profile", path: "/student-dashboard/profile", icon: <User className="w-4 h-4" /> },
];

const StudentBrowse = () => {
  const [search, setSearch] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");
  const { currentUser } = useApp();

  // Fetch from the real backend; debounce with controlled input value
  const { data: chefs = [], isLoading, isError, error } = useChefs(collegeFilter || undefined);

  // Client-side filter by name/bio on top of server-side college filter
  const filtered = chefs.filter((c) => {
    const name = c.userId?.name?.toLowerCase() ?? "";
    const bio = c.bio?.toLowerCase() ?? "";
    const term = search.toLowerCase();
    return name.includes(term) || bio.includes(term);
  });

  return (
    <DashboardLayout navItems={navItems} title="Browse Chefs">
      <div className="space-y-6 animate-fade-in">
        {/* Hero */}
        <div className="gradient-primary rounded-2xl p-6 md:p-8 text-primary-foreground">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Hungry? 🍛</h2>
          <p className="opacity-90 mb-4">Order ghar ka khana from home chefs near your campus</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
            {/* College filter */}
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Filter by college (e.g. IIT Delhi)..."
                className="pl-10 bg-card text-foreground border-0"
                value={collegeFilter}
                onChange={(e) => setCollegeFilter(e.target.value)}
              />
            </div>
            {/* Name / bio search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by chef name or bio..."
                className="pl-10 bg-card text-foreground border-0"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-10 h-10 animate-spin mb-3 text-primary" />
            <p className="text-sm font-medium">Finding chefs near you...</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="text-center py-16">
            <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-40 text-destructive" />
            <p className="text-lg font-semibold text-destructive">Could not load chefs</p>
            <p className="text-sm text-muted-foreground mt-1">{(error as Error)?.message}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No chefs found</p>
            <p className="text-sm">Try a different college or search term</p>
          </div>
        )}

        {/* Chef Grid */}
        {!isLoading && !isError && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((chef) => (
              <Card
                key={chef._id}
                className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 group border border-border/60"
              >
                {/* Card Header - Avatar/icon area */}
                <div className="h-36 overflow-hidden relative bg-muted flex items-center justify-center group">
                  {chef.profileImage ? (
                    <img 
                      src={getImageUrl(chef.profileImage)} 
                      alt={chef.userId?.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  ) : (
                    <ChefHat className="w-16 h-16 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-300" />
                  )}
                  {/* Online / Offline badge */}
                  <div className="absolute top-3 right-3 flex gap-1">
                    {chef.isAvailable ? (
                      <Badge className="bg-success text-success-foreground border-0 text-xs">Available</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Unavailable</Badge>
                    )}
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  {/* Name */}
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{chef.userId?.name ?? "Chef"}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {chef.college}
                    </p>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-muted-foreground line-clamp-2">{chef.bio || "No bio available."}</p>

                  {/* Rating + Action Row */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-warning fill-warning" />
                      <span className="text-sm font-semibold">
                        {chef.rating > 0 ? chef.rating.toFixed(1) : "New"}
                      </span>
                    </div>
                    <Link to={`/student-dashboard/chef/${chef._id}`} className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      View Menu
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentBrowse;
