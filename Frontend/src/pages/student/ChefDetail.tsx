import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Home, 
  ShoppingBag, 
  Clock, 
  Star, 
  ArrowLeft, 
  Plus, 
  Leaf, 
  Loader2, 
  ChefHat,
  ShoppingBasket
} from "lucide-react";
import { useChef } from "@/hooks/useChefs";
import { useMenu, ApiMenuItem } from "@/hooks/useMenu";
import { getImageUrl } from "@/lib/api";

const navItems = [
  { label: "Browse", path: "/student-dashboard", icon: <Home className="w-4 h-4" /> },
  { label: "Orders", path: "/student-dashboard/orders", icon: <ShoppingBag className="w-4 h-4" /> },
  { label: "Cart", path: "/student-dashboard/cart", icon: <Clock className="w-4 h-4" /> },
];

const ChefDetail = () => {
  const { chefId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart, cart } = useApp();

  const { data: chef, isLoading: isChefLoading, isError: isChefError } = useChef(chefId!);
  const { data: menu = [], isLoading: isMenuLoading } = useMenu(chef?.userId?._id || "");

  if (isChefLoading) {
    return (
      <DashboardLayout navItems={navItems} title="Loading...">
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-10 h-10 animate-spin mb-3 text-primary" />
          <p className="text-sm font-medium">Loading chef profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isChefError || !chef) {
    return (
      <DashboardLayout navItems={navItems} title="Error">
        <div className="text-center py-16">
          <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-40 text-destructive" />
          <p className="text-lg font-semibold text-destructive">Chef not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/student-dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Browse
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate cart summary for this specific chef
  const chefCartItems = cart.filter(item => item.chefId === chefId);
  const cartTotal = chefCartItems.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0);

  const handleAdd = (item: ApiMenuItem) => {
    // Map current ApiMenuItem to the AppContext MenuItem type (basically id vs _id)
    const mappedItem = {
      ...item,
      id: item._id
    };
    addToCart(mappedItem, chef.userId.name);
    toast({ 
      title: "Added to cart!", 
      description: `${item.name} from ${chef.userId.name} added.`,
    });
  };

  return (
    <DashboardLayout navItems={navItems} title={chef.userId.name}>
      <div className="space-y-6 animate-fade-in relative">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground hover:bg-muted/50 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>

        {/* Chef Header Card */}
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex flex-col md:flex-row">
            {/* Header Visual */}
            <div className="w-full md:w-72 h-52 bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/10 flex items-center justify-center border-b md:border-b-0 md:border-r border-border/50 overflow-hidden">
              {chef.profileImage ? (
                <img 
                  src={getImageUrl(chef.profileImage)} 
                  alt={chef.userId.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <ChefHat className="w-24 h-24 text-orange-200/80 dark:text-orange-900/30" />
              )}
            </div>
            
            <div className="flex-1 p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-extrabold tracking-tight">{chef.userId.name}</h2>
                    {chef.isApproved && <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 transition-colors">Verified Chef</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Star className="w-4 h-4 text-warning fill-warning" />
                    <span className="font-semibold text-foreground">{chef.rating > 0 ? chef.rating.toFixed(1) : "New"}</span>
                    <span>• {chef.college}</span>
                  </p>
                </div>
                
                {chef.isAvailable ? (
                  <Badge className="bg-success text-success-foreground border-0 px-3 py-1">Accepting Orders</Badge>
                ) : (
                  <Badge variant="secondary" className="px-3 py-1 text-muted-foreground">Busy</Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{chef.bio || "This chef serves delicious home-cooked meals."}</p>
              
              <div className="flex gap-6 pt-2">
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Experience</p>
                  <p className="text-sm font-medium">Home Chef</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Cuisine</p>
                  <p className="text-sm font-medium">Multi-cuisine</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Packaging</p>
                  <p className="text-sm font-medium italic">Premium</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              Menu <Badge variant="outline" className="rounded-full px-2 py-0 h-5 font-bold">{menu.length}</Badge>
            </h3>
          </div>

          {isMenuLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-muted/40 animate-pulse rounded-xl border border-border/50" />
              ))}
            </div>
          ) : menu.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border/50">
              <p className="text-muted-foreground">No items available right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menu.map((item) => (
                <Card key={item._id} className="overflow-hidden hover:shadow-md transition-all border border-border/50 bg-gradient-to-r from-card to-card/50">
                  <div className="flex">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-muted relative m-3">
                      <img 
                        src={getImageUrl(item.image || "")} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute top-1 left-1">
                         {item.isVeg ? (
                          <div className="w-3.5 h-3.5 border border-success flex items-center justify-center p-0.5 bg-white/90"><div className="w-1.5 h-1.5 rounded-full bg-success" /></div>
                        ) : (
                          <div className="w-4 h-4 border-2 border-destructive flex items-center justify-center p-0.5"><div className="w-2 h-2 rounded-full bg-destructive" /></div>
                        )}
                      </div>
                    </div>
                    <CardContent className="flex-1 p-4 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-base">{item.name}</h4>
                          <span className="font-bold text-primary">₹{item.price}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">{item.description}</p>
                      </div>
                      <div className="flex items-center justify-end mt-2">
                        <Button size="sm" onClick={() => handleAdd(item)} className="gradient-primary text-primary-foreground h-8 px-4 rounded-lg shadow-sm hover:translate-y-[-1px] transition-all">
                          <Plus className="w-3.5 h-3.5 mr-1" /> Add
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Floating Cart Summary if items exist */}
        {chefCartItems.length > 0 && (
          <div className="sticky bottom-6 mt-10 left-0 right-0 z-10 animate-slide-up">
            <div className="gradient-primary text-primary-foreground mx-auto max-w-sm rounded-full py-3 px-6 shadow-xl flex items-center justify-between border border-primary-foreground/20 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <ShoppingBasket className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-medium opacity-90">{chefCartItems.length} items added</p>
                  <p className="text-sm font-bold tracking-tight">Total: ₹{cartTotal}</p>
                </div>
              </div>
              <Button 
                variant="link" 
                onClick={() => navigate("/student-dashboard/cart")}
                className="text-white font-bold p-0 h-auto hover:no-underline flex items-center gap-1 group"
              >
                View Cart <Plus className="w-4 h-4 rotate-45 group-hover:rotate-0 transition-transform" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ChefDetail;
