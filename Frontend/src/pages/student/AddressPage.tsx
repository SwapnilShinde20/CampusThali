import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Home, 
  ShoppingBag, 
  Clock, 
  MapPin, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Phone, 
  Building2, 
  Briefcase,
  Loader2,
  MoreVertical,
  Pencil,
  Camera,
  User
} from "lucide-react";
import { 
  useAddresses, 
  useCreateAddress, 
  useUpdateAddress, 
  useDeleteAddress, 
  useSetDefaultAddress,
  ApiAddress
} from "@/hooks/useAddress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LocationSearch from "../../components/address/LocationSearch";
import AddressDetailsForm from "../../components/address/AddressDetailsForm";

const navItems = [
  { label: "Browse", path: "/student-dashboard", icon: <Home className="w-4 h-4" /> },
  { label: "Orders", path: "/student-dashboard/orders", icon: <ShoppingBag className="w-4 h-4" /> },
  { label: "Cart", path: "/student-dashboard/cart", icon: <Clock className="w-4 h-4" /> },
  { label: "Addresses", path: "/student-dashboard/addresses", icon: <MapPin className="w-4 h-4" /> },
  { label: "Profile", path: "/student-dashboard/profile", icon: <User className="w-4 h-4" /> },
];

const AddressPage = () => {
  const { currentUser } = useApp();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ApiAddress | null>(null);
  const [step, setStep] = useState<"search" | "details">("search");
  const [selectedCoords, setSelectedCoords] = useState<{lat: number, lng: number}>({ lat: 19.0760, lng: 72.8777 });
  const [initialAddressLine, setInitialAddressLine] = useState("");

  const { data: addresses = [], isLoading } = useAddresses(currentUser?.token || "");
  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress();
  const deleteMutation = useDeleteAddress();
  const setDefaultMutation = useSetDefaultAddress();

  const handleOpenModal = (address?: ApiAddress) => {
    if (address) {
      setEditingAddress(address);
      setSelectedCoords({ lat: address.lat || 19.0760, lng: address.lng || 72.8777 });
      setInitialAddressLine(address.addressLine);
      setStep("details");
    } else {
      setEditingAddress(null);
      setInitialAddressLine("");
      setStep("search");
    }
    setIsModalOpen(true);
  };

  const handleSearchSelect = (lat: number, lng: number, addr: string) => {
    setSelectedCoords({ lat, lng });
    setInitialAddressLine(addr);
    setStep("details");
  };

  const handleSaveAddress = async (formData: any) => {
    if (!currentUser?.token) return;

    try {
      const payload = {
        ...formData,
        lat: selectedCoords.lat,
        lng: selectedCoords.lng,
        city: formData.city || "Mumbai", 
        pincode: formData.pincode || "400001",
        isDefault: addresses.length === 0,
      };

      if (editingAddress) {
        await updateMutation.mutateAsync({
          id: editingAddress._id,
          data: payload,
          token: currentUser.token,
        });
        toast({ title: "Address updated", description: "Your changes have been saved." });
      } else {
        await createMutation.mutateAsync({
          data: payload,
          token: currentUser.token,
        });
        toast({ title: "Address added", description: "New delivery location saved." });
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Something went wrong", 
        variant: "destructive" 
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!currentUser?.token) return;
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      await deleteMutation.mutateAsync({ id, token: currentUser.token });
      toast({ title: "Address deleted" });
    } catch (error) {
      toast({ title: "Error", description: "Could not delete address", variant: "destructive" });
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!currentUser?.token) return;
    try {
      await setDefaultMutation.mutateAsync({ id, token: currentUser.token });
      toast({ title: "Default set", description: "Default delivery address updated." });
    } catch (error) {
      toast({ title: "Error", description: "Could not update default", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="My Addresses">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Delivery Addresses</h2>
            <p className="text-muted-foreground text-sm font-medium italic">Manage where you want your meals delivered</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="gradient-primary text-primary-foreground font-bold shadow-md hover:scale-105 transition-all">
            <Plus className="w-4 h-4 mr-2" /> Add New Address
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
            <p className="text-sm font-bold tracking-widest uppercase">Loading addresses...</p>
          </div>
        ) : addresses.length === 0 ? (
          <Card className="border-2 border-dashed border-border/60 bg-muted/20 rounded-3xl overflow-hidden">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <MapPin className="w-10 h-10 text-primary opacity-40 shadow-sm" />
              </div>
              <div className="space-y-1">
                 <h3 className="text-xl font-black italic tracking-tight">No addresses found</h3>
                 <p className="text-muted-foreground text-sm max-w-[250px]">Add your hostel or home address to start ordering delicioso food!</p>
              </div>
              <Button onClick={() => handleOpenModal()} variant="outline" className="font-bold rounded-xl border-2 px-8">
                Add My First Address
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <Card key={address._id} className={`group relative overflow-hidden transition-all duration-300 border-2 ${address.isDefault ? 'border-primary/40 bg-primary/[0.02] shadow-md' : 'hover:border-primary/20 hover:shadow-sm'}`}>
                <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-primary/5">
                        {address.label === 'Home' ? <Home className="w-5 h-5 text-primary" /> : 
                         address.label === 'Work' ? <Briefcase className="w-5 h-5 text-primary" /> :
                         <MapPin className="w-5 h-5 text-primary" />}
                    </div>
                    <div>
                      <CardTitle className="text-base font-black uppercase tracking-tight italic">{address.label}</CardTitle>
                      {address.isDefault && <Badge className="bg-primary hover:bg-primary text-[10px] h-5 font-black uppercase tracking-widest px-2 mt-0.5">Default</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleOpenModal(address)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive" onClick={() => handleDelete(address._id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-1">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground/80 leading-snug">{address.addressLine}</p>
                    <p className="text-xs font-semibold text-muted-foreground">{address.city}, {address.pincode}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-widest pb-2">
                    <Phone className="w-3 h-3 text-primary/60" /> {address.receiverPhone}
                  </div>

                  {!address.isDefault && (
                    <Button 
                      variant="link" 
                      onClick={() => handleSetDefault(address._id)}
                      className="p-0 h-auto text-xs font-black text-primary uppercase tracking-widest hover:no-underline group/btn"
                    >
                      Set as Default Address <CheckCircle2 className="w-3 h-3 ml-1 opacity-0 group-hover/btn:opacity-100 transition-all" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="p-0 border-none bg-background flex flex-col overflow-hidden fixed z-[1002] transition-all duration-500
            lg:rounded-[32px] lg:max-w-xl lg:max-h-[90vh] lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2
            max-lg:w-full max-lg:h-[90vh] max-lg:bottom-0 max-lg:left-0 max-lg:rounded-t-[40px] max-lg:translate-y-0
            outline-none shadow-2xl">
            
            {/* Mobile Handle indicator */}
            <div className="lg:hidden mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted-foreground/20 my-4" />
            
            <DialogHeader className="sr-only">
              <DialogTitle>{editingAddress ? "Edit Address" : "Add Address"}</DialogTitle>
              <DialogDescription>Quickly find and add your delivery location</DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto">
              {step === "search" ? (
                <LocationSearch 
                  onSelect={handleSearchSelect}
                  onClose={() => setIsModalOpen(false)}
                />
              ) : (
                <AddressDetailsForm 
                  initialData={{ 
                    addressLine: initialAddressLine, 
                    lat: selectedCoords.lat, 
                    lng: selectedCoords.lng,
                    label: editingAddress ? editingAddress.label as any : "Home",
                    houseNo: editingAddress ? (editingAddress as any).houseNo : "",
                    buildingName: editingAddress ? (editingAddress as any).buildingName : "",
                    landmark: editingAddress ? (editingAddress as any).landmark : "",
                    receiverName: editingAddress ? (editingAddress as any).receiverName : currentUser?.name,
                    receiverPhone: editingAddress ? (editingAddress as any).receiverPhone : "",
                    buildingType: editingAddress ? (editingAddress as any).buildingType : "Society"
                  }}
                  onBack={() => setStep("search")}
                  onSubmit={handleSaveAddress}
                  isLoading={createMutation.isPending || updateMutation.isPending}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AddressPage;
