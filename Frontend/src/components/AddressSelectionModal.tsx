import { useState } from "react";
import { 
  MapPin, 
  Home, 
  Briefcase, 
  Plus, 
  CheckCircle2, 
  Loader2, 
  ChevronRight, 
  X
} from "lucide-react";
import { ApiAddress, useCreateAddress } from "@/hooks/useAddress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";
import LocationSearch from "./address/LocationSearch";
import AddressDetailsForm from "./address/AddressDetailsForm";

interface AddressSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  addresses: ApiAddress[];
  onSelect: (address: ApiAddress) => void;
  selectedId: string | null;
  isLoading?: boolean;
}

type FlowStep = "list" | "search" | "details";

const AddressSelectionModal = ({ 
  isOpen, 
  onClose, 
  addresses, 
  onSelect, 
  selectedId,
  isLoading 
}: AddressSelectionModalProps) => {
  const { currentUser } = useApp();
  const [step, setStep] = useState<FlowStep>("list");
  const [selectedCoords, setSelectedCoords] = useState<{lat: number, lng: number}>({ lat: 19.0760, lng: 72.8777 }); // Default Mumbai
  const [addressLine, setAddressLine] = useState("");
  const createAddressMutation = useCreateAddress();

  const getIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l === 'home') return <Home className="w-4 h-4" />;
    if (l === 'work') return <Briefcase className="w-4 h-4" />;
    return <MapPin className="w-4 h-4" />;
  };

  const handleAddNew = () => setStep("search");

  const handleSearchSelect = (lat: number, lng: number, addr: string) => {
    setSelectedCoords({ lat, lng });
    setAddressLine(addr);
    setStep("details");
  };

  const handleSaveAddress = async (formData: any) => {
    try {
      const payload = {
        ...formData,
        lat: selectedCoords.lat,
        lng: selectedCoords.lng,
        city: "Mumbai", 
        pincode: "400001", 
        isDefault: addresses.length === 0,
      };
      
      const newAddress = await createAddressMutation.mutateAsync({ 
        data: payload, 
        token: currentUser?.token || "" 
      });
      
      onSelect(newAddress);
      setStep("list");
      onClose();
    } catch (error) {
      console.error("Save failed", error);
    }
  };

  const renderContent = () => {
    switch (step) {
      case "list":
        return (
          <div className="flex flex-col h-full bg-background animate-in slide-in-from-bottom-5 duration-300">
            <div className="p-8 pb-4">
               <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-black italic tracking-tighter leading-none mb-1">Deliver to</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Choose your location</p>
                  </div>
                  <button onClick={onClose} className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center lg:hidden">
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
               </div>
               
               <button 
                onClick={handleAddNew}
                className="w-full h-14 rounded-2xl border-2 border-dashed border-primary/30 flex items-center justify-center gap-2 text-primary font-black uppercase text-xs tracking-tight hover:bg-primary/5 transition-all group"
               >
                 <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Plus className="w-4 h-4" />
                 </div>
                 Add NEW ADDRESS
               </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-24">
              {isLoading ? (
                <div className="py-20 flex flex-col items-center opacity-40 italic">
                   <Loader2 className="w-8 h-8 animate-spin mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-widest">Finding you...</p>
                </div>
              ) : addresses.length === 0 ? (
                <div className="py-12 text-center opacity-20 italic bg-muted/20 rounded-[40px] border-2 border-dashed border-border/40 m-2">
                   <MapPin className="w-10 h-10 mx-auto mb-3" />
                   <p className="text-xs font-bold uppercase tracking-tighter">No addresses saved yet</p>
                </div>
              ) : (
                addresses.map((addr) => (
                  <Card 
                    key={addr._id}
                    onClick={() => onSelect(addr)}
                    className={`cursor-pointer group relative overflow-hidden transition-all duration-300 border-2 rounded-3xl ${
                      selectedId === addr._id 
                        ? 'border-primary bg-primary/[0.03] shadow-md' 
                        : 'hover:border-primary/20 hover:bg-muted/10 border-border/40'
                    }`}
                  >
                     <CardContent className="p-5 flex items-center gap-4">
                        <div className={`p-4 rounded-2xl transition-all ${selectedId === addr._id ? 'bg-primary text-white scale-110' : 'bg-primary/5 text-primary'}`}>
                           {getIcon(addr.label)}
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-black italic uppercase tracking-tight text-sm">{addr.label}</span>
                              {addr.isDefault && <Badge className="bg-primary/10 text-primary border-none text-[8px] h-4 font-black uppercase tracking-widest">Default</Badge>}
                           </div>
                           <p className="text-xs font-bold text-foreground/70 truncate uppercase tracking-tight leading-none">{addr.addressLine}</p>
                           <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-2">{addr.receiverPhone}</p>
                        </div>
                        {selectedId === addr._id ? (
                           <CheckCircle2 className="w-5 h-5 text-primary animate-in zoom-in-50" />
                        ) : (
                           <ChevronRight className="w-4 h-4 text-muted-foreground opacity-20 group-hover:opacity-100 transition-opacity" />
                        )}
                     </CardContent>
                  </Card>
                ))
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent border-t border-border/40">
               <Button 
                onClick={onClose} 
                disabled={!selectedId}
                className="w-full h-14 rounded-2xl gradient-primary text-primary-foreground font-black italic tracking-tighter shadow-xl hover:translate-y-[-2px] transition-all text-xl"
               >
                 Confirm Selection
               </Button>
            </div>
          </div>
        );

      case "search":
        return (
          <div className="h-full animate-in slide-in-from-right-10 duration-300">
            <LocationSearch 
              onSelect={handleSearchSelect}
              onClose={() => setStep("list")}
            />
          </div>
        );

      case "details":
        return (
          <div className="h-full animate-in slide-in-from-bottom-10 duration-300">
             <AddressDetailsForm 
              initialData={{ addressLine, lat: selectedCoords.lat, lng: selectedCoords.lng }}
              onBack={() => setStep("search")}
              onSubmit={handleSaveAddress}
              isLoading={createAddressMutation.isPending}
             />
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="p-0 border-none bg-background flex flex-col overflow-hidden fixed z-[1002] transition-all duration-500
        lg:rounded-[32px] lg:max-w-xl lg:max-h-[85vh] lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2
        max-lg:w-full max-lg:h-[90vh] max-lg:bottom-0 max-lg:left-0 max-lg:rounded-t-[40px] max-lg:translate-y-0
        outline-none shadow-2xl">
        
        {/* Mobile Handle indicator */}
        <div className="lg:hidden mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted-foreground/20 my-4" />
        
        <DialogHeader className="sr-only">
            <DialogTitle>Address Selection</DialogTitle>
            <DialogDescription>Quickly find and add your delivery location</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddressSelectionModal;
