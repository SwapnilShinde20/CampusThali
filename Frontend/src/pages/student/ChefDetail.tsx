import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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
  ShoppingBasket,
  MessageSquare,
  User
} from "lucide-react";
import { useChef } from "@/hooks/useChefs";
import { useMenu, ApiMenuItem } from "@/hooks/useMenu";
import { api, getImageUrl } from "@/lib/api";

const navItems = [
  { label: "Browse", path: "/student-dashboard", icon: <Home className="w-4 h-4" /> },
  { label: "Orders", path: "/student-dashboard/orders", icon: <ShoppingBag className="w-4 h-4" /> },
  { label: "Cart", path: "/student-dashboard/cart", icon: <Clock className="w-4 h-4" /> },
];

interface Review {
  _id: string;
  rating: number;
  comment: string;
  image?: string;
  studentName?: string;
  studentAvatar?: string;
  createdAt: string;
}

const ChefDetail = () => {
  const { chefId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart, cart } = useApp();

  const { data: chef, isLoading: isChefLoading, isError: isChefError } = useChef(chefId!);
  const { data: menu = [], isLoading: isMenuLoading } = useMenu(chef?.userId?._id || "");
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!chef?.userId?._id) return;
      try {
        const res = await api.get(`/reviews/chef/${chef.userId._id}`);
        if (res.success) {
          setReviews(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setIsReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [chef?.userId?._id]);

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
      <div className="space-y-10 animate-fade-in relative pb-20">
        <div className="space-y-6">
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
        </div>

        {/* Menu Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2 uppercase tracking-tight italic">
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
              <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">No items available right now</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menu.map((item) => (
                <Card key={item._id} className="overflow-hidden hover:shadow-md transition-all border border-border/50 bg-gradient-to-r from-card to-card/50 group">
                  <div className="flex">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-muted relative m-3">
                      <img 
                        src={getImageUrl(item.image || "")} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
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
                          <span className="font-black text-primary">₹{item.price}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed opacity-80">{item.description}</p>
                      </div>
                      <div className="flex items-center justify-end mt-2">
                        <Button size="sm" onClick={() => handleAdd(item)} className="gradient-primary text-primary-foreground h-8 px-4 rounded-lg shadow-sm hover:translate-y-[-1px] transition-all font-bold text-[10px] uppercase tracking-wider">
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

        {/* Reviews Section */}
        <div className="space-y-6 pt-4 border-t border-border/40">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black italic uppercase tracking-tight flex items-center gap-2">
              Reviews & Ratings
              {reviews.length > 0 && (
                <div className="flex items-center gap-1.5 bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                  <Star className="w-3 h-3 text-warning fill-warning" />
                  <span className="text-xs font-black text-primary">{chef.rating > 0 ? chef.rating.toFixed(1) : "New"}</span>
                  <span className="text-[10px] font-bold text-muted-foreground opacity-60">({reviews.length})</span>
                </div>
              )}
            </h3>
          </div>

          {isReviewsLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="h-24 bg-muted/30 animate-pulse rounded-2xl border border-border/40" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 bg-muted/10 rounded-3xl border-2 border-dashed border-border/40">
               <MessageSquare className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
               <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Be the first to review this chef</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review) => (
                <Card key={review._id} className="border-none shadow-sm bg-muted/20 rounded-3xl overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 overflow-hidden">
                          {review.studentAvatar ? (
                            <img src={getImageUrl(review.studentAvatar)} alt={review.studentName} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <User className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-tight">{review.studentName || "Premium Student"}</p>
                          <div className="flex gap-0.5 mt-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-2.5 h-2.5 ${s <= review.rating ? "fill-warning text-warning" : "text-muted-foreground/20"}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-foreground/80 leading-relaxed italic line-clamp-3">
                      "{review.comment || "Great experience!"}"
                    </p>

                    {review.image && (
                      <div className="w-full h-40 rounded-2xl overflow-hidden bg-muted group">
                        <img 
                          src={getImageUrl(review.image)} 
                          alt="Review" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      </div>
                    )}
                  </CardContent>
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
