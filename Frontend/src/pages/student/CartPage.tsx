import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Home, 
  ShoppingBag, 
  Clock, 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingCart, 
  MapPin, 
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Loader2,
  User
} from "lucide-react";
import { useAddresses, ApiAddress } from "@/hooks/useAddress";
import AddressSelectionModal from "@/components/AddressSelectionModal";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/lib/api";

const navItems = [
  { label: "Browse", path: "/student-dashboard", icon: <Home className="w-4 h-4" /> },
  { label: "Orders", path: "/student-dashboard/orders", icon: <ShoppingBag className="w-4 h-4" /> },
  { label: "Cart", path: "/student-dashboard/cart", icon: <Clock className="w-4 h-4" /> },
  { label: "Addresses", path: "/student-dashboard/addresses", icon: <MapPin className="w-4 h-4" /> },
  { label: "Profile", path: "/student-dashboard/profile", icon: <User className="w-4 h-4" /> },
];

const CartPage = () => {
  const { cart, updateCartQuantity, removeFromCart, clearCart, placeOrder, currentUser } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<ApiAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");

  const { data: addresses = [], isLoading: isAddressesLoading } = useAddresses(currentUser?.token || "");

  // Set default address when loaded
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const def = addresses.find(a => a.isDefault) || addresses[0];
      setSelectedAddress(def);
    }
  }, [addresses, selectedAddress]);

  const total = cart.reduce((s, c) => s + c.menuItem.price * c.quantity, 0);

  const handleCheckoutClick = () => {
    if (addresses.length === 0) {
      toast({ 
        title: "No address found", 
        description: "Please add a delivery address to continue.",
        variant: "destructive"
      });
      navigate("/student-dashboard/addresses");
      return;
    }
    setIsAddressModalOpen(true);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setIsAddressModalOpen(true);
      return;
    }
    
    setIsPlacingOrder(true);
    try {
      await placeOrder(selectedAddress._id, paymentMethod);
      toast({ 
        title: "Order placed successfully! 🎉", 
        description: `Delivering to ${selectedAddress.label}.` 
      });
      navigate("/student-dashboard/orders");
    } catch (error: any) {
      toast({ 
        title: "Order failed", 
        description: error.message || "Something went wrong. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsPlacingOrder(false);
      setIsAddressModalOpen(false);
    }
  };

  if (cart.length === 0) {
    return (
      <DashboardLayout navItems={navItems} title="Cart">
        <div className="text-center py-32 animate-fade-in grayscale opacity-40">
          <ShoppingCart className="w-20 h-20 mx-auto mb-6 text-primary" />
          <h2 className="text-3xl font-black italic tracking-tighter mb-2 italic uppercase">Your cart is empty</h2>
          <p className="text-sm font-bold tracking-widest uppercase mb-8">Fuel up with some campus thali magic!</p>
          <Button onClick={() => navigate("/student-dashboard")} className="gradient-primary text-primary-foreground font-black italic tracking-tighter px-10 h-14 rounded-2xl shadow-xl">Browse Chefs</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Review Order">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in pb-16">
        
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
             <h3 className="text-xl font-black italic tracking-tight uppercase">My Items ({cart.length})</h3>
             <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive font-black text-[10px] uppercase tracking-widest hover:bg-destructive/5 hover:text-destructive">
               <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear ALL
             </Button>
          </div>
          
          <div className="space-y-4">
            {cart.map((item) => (
              <Card key={item.menuItem.id} className="overflow-hidden hover:shadow-md transition-all border-border/40 group">
                <CardContent className="p-0">
                  <div className="flex items-stretch">
                    <div className="w-28 sm:w-36 h-32 bg-muted relative">
                      <img src={getImageUrl(item.menuItem.image || "")} alt={item.menuItem.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-2 left-2">
                         {item.menuItem.isVeg ? (
                          <div className="w-4 h-4 border-2 border-emerald-500 bg-white flex items-center justify-center p-0.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /></div>
                        ) : (
                          <div className="w-4 h-4 border-2 border-red-500 bg-white flex items-center justify-center p-0.5"><div className="w-2 h-2 rounded-full bg-red-500" /></div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                           <h4 className="font-bold text-base truncate shrink-1">{item.menuItem.name}</h4>
                           <span className="font-black text-primary shrink-0">₹{item.menuItem.price * item.quantity}</span>
                        </div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground italic">By {item.chefName}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center bg-muted/40 rounded-xl p-1 border border-border/20">
                           <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-white/50" onClick={() => updateCartQuantity(item.menuItem.id, item.quantity - 1)}>
                             <Minus className="w-3 h-3" />
                           </Button>
                           <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                           <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-white/50" onClick={() => updateCartQuantity(item.menuItem.id, item.quantity + 1)}>
                             <Plus className="w-3 h-3" />
                           </Button>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 rounded-full" onClick={() => removeFromCart(item.menuItem.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card className="rounded-3xl border-none shadow-xl shadow-primary/5 bg-muted/20 overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <h3 className="text-xl font-black italic tracking-tighter uppercase">Bill Details</h3>
              
              <div className="space-y-3 font-medium text-sm">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Item Total</span>
                  <span className="font-bold text-foreground">₹{total}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Platform Fee</span>
                  <span className="font-bold text-foreground">₹12</span>
                </div>
                <div className="h-px bg-border/40 my-2" />
                <div className="flex justify-between items-center pt-2">
                  <span className="font-black italic uppercase tracking-tighter text-lg">GRAND TOTAL</span>
                  <span className="text-2xl font-black text-primary tracking-tighter">₹{total + 12}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border/40">
                 <div className="bg-white/50 dark:bg-black/20 rounded-2xl p-4 border border-border/30 mb-6">
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-2">Delivering To</p>
                    {selectedAddress ? (
                      <div className="flex items-center justify-between group cursor-pointer" onClick={() => setIsAddressModalOpen(true)}>
                         <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary uppercase text-[10px] font-black h-8 w-8 flex items-center justify-center shrink-0">
                               {selectedAddress.label[0]}
                            </div>
                            <div className="min-w-0">
                               <p className="font-bold text-xs truncate leading-none mb-1">{selectedAddress.label}</p>
                               <p className="text-[10px] font-medium text-muted-foreground truncate opacity-70 italic">{selectedAddress.addressLine}</p>
                            </div>
                         </div>
                         <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </div>
                    ) : (
                      <Button variant="outline" onClick={handleCheckoutClick} className="w-full h-10 rounded-xl border-dashed border-2 font-bold text-xs">
                        <MapPin className="w-3 h-3 mr-2" /> Select Address
                      </Button>
                    )}
                 </div>

                 {/* Payment Method Selection */}
                 <div className="bg-white/50 dark:bg-black/20 rounded-2xl p-4 border border-border/30 mb-6">
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-4">Payment Method</p>
                    <div className="space-y-3">
                       <div 
                          onClick={() => setPaymentMethod("cod")}
                          className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "cod" ? "border-primary bg-primary/5 shadow-sm" : "border-transparent bg-muted/30 hover:bg-muted/50"}`}
                       >
                          <div className="flex items-center gap-3">
                             <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "cod" ? "border-primary" : "border-muted-foreground/30"}`}>
                                {paymentMethod === "cod" && <div className="w-2 h-2 rounded-full bg-primary" />}
                             </div>
                             <div>
                                <p className="font-bold text-xs">Pay on Delivery</p>
                                <p className="text-[9px] text-muted-foreground font-medium">Cash or UPI at your door</p>
                             </div>
                          </div>
                          <CreditCard className={`w-4 h-4 ${paymentMethod === "cod" ? "text-primary" : "text-muted-foreground/40"}`} />
                       </div>

                       <div 
                          onClick={() => setPaymentMethod("online")}
                          className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "online" ? "border-primary bg-primary/5 shadow-sm" : "border-transparent bg-muted/30 hover:bg-muted/50"}`}
                       >
                          <div className="flex items-center gap-3">
                             <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "online" ? "border-primary" : "border-muted-foreground/30"}`}>
                                {paymentMethod === "online" && <div className="w-2 h-2 rounded-full bg-primary" />}
                             </div>
                             <div>
                                <p className="font-bold text-xs">Pay Now (Razorpay)</p>
                                <p className="text-[9px] text-muted-foreground font-medium">Cards, Netbanking, UPI</p>
                             </div>
                          </div>
                          <ShieldCheck className={`w-4 h-4 ${paymentMethod === "online" ? "text-primary" : "text-muted-foreground/40"}`} />
                       </div>
                    </div>
                 </div>

                 <Button 
                    onClick={handlePlaceOrder} 
                    disabled={isPlacingOrder || isAddressesLoading} 
                    className="w-full gradient-primary text-primary-foreground font-black italic tracking-tighter text-lg h-14 rounded-2xl shadow-xl hover:translate-y-[-2px] transition-all disabled:opacity-50"
                 >
                    {isPlacingOrder ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        PROCESSING...
                      </>
                    ) : (
                      <>
                        PLACE ORDER <ChevronRight className="w-5 h-5 ml-1" />
                      </>
                    )}
                 </Button>

                 <div className="flex items-center justify-center gap-6 mt-6 opacity-40">
                    <div className="text-[8px] font-black tracking-widest uppercase flex flex-col items-center gap-1 shrink-0">
                       <ShieldCheck className="w-4 h-4" /> 100% SECURE
                    </div>
                    <div className="text-[8px] font-black tracking-widest uppercase flex flex-col items-center gap-1 shrink-0">
                       <CreditCard className="w-4 h-4" /> PAY ON DELIVERY
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddressSelectionModal 
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        addresses={addresses}
        onSelect={(addr) => setSelectedAddress(addr)}
        selectedId={selectedAddress?._id || null}
        isLoading={isAddressesLoading}
      />
    </DashboardLayout>
  );
};

export default CartPage;

