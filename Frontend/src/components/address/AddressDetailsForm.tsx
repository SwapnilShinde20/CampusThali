import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, Briefcase, MapPin, Building2, Building, Hotel, Warehouse, Loader2 } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const addressFormSchema = z.object({
  label: z.enum(["Home", "Work", "Others"]),
  buildingType: z.enum(["Society", "Independent house", "Standalone", "Office", "Hotel", "Others"]),
  addressLine: z.string().min(5, "Complete address is required"),
  houseNo: z.string().min(1, "House / Flat / Room No is required"),
  buildingName: z.string().optional(),
  landmark: z.string().optional(),
  receiverName: z.string().min(2, "Receiver name is required"),
  receiverPhone: z.string().min(10, "Valid phone is required"),
});

type AddressFormValues = z.infer<typeof addressFormSchema>;

import MiniMapPreview from "./MiniMapPreview";

interface AddressDetailsFormProps {
  initialData: Partial<AddressFormValues> & { lat?: number; lng?: number };
  onSubmit: (data: AddressFormValues) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const AddressDetailsForm = ({ initialData, onSubmit, onBack, isLoading }: AddressDetailsFormProps) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      label: "Home",
      buildingType: "Society",
      ...initialData,
    },
  });

  const selectedLabel = watch("label");
  const selectedBuildingType = watch("buildingType");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full bg-background overflow-hidden">
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8 h-full scrollbar-thin">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
             <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div>
             <h3 className="font-black italic tracking-tighter text-xl leading-none">Add Address Details</h3>
             <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Fine-tune your location</p>
          </div>
        </div>

        {/* Mini Map Preview */}
        {initialData.lat && initialData.lng && (
          <div className="animate-in fade-in zoom-in-95 duration-700 ease-out">
             <MiniMapPreview lat={initialData.lat} lng={initialData.lng} />
          </div>
        )}

        {/* Selected Location Summary - High Fidelity Snapshot */}
        <div className="p-5 rounded-[28px] bg-muted/30 border border-border/10 flex justify-between items-center transition-all hover:bg-muted/40 shadow-sm">
           <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-1.5 mb-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                 <p className="font-black italic text-[9px] tracking-[0.1em] uppercase leading-none opacity-50">Delivery Point</p>
              </div>
              <p className="text-[13px] font-black text-foreground italic leading-tight uppercase tracking-tight line-clamp-2">
                {initialData.addressLine}
              </p>
           </div>
           <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={onBack} 
            className="text-primary font-black text-[10px] uppercase h-10 px-4 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors shrink-0"
           >
             Change
           </Button>
        </div>

        {/* Save Address As */}
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Save Address as</Label>
          <ToggleGroup 
            type="single" 
            value={selectedLabel} 
            onValueChange={(v) => v && setValue("label", v as any)}
            className="justify-start gap-2"
          >
            <ToggleGroupItem value="Home" className="px-5 h-10 rounded-xl gap-2 font-bold text-xs data-[state=on]:bg-primary/10 data-[state=on]:text-primary border-border/50">
              <Home className="w-3.5 h-3.5" /> Home
            </ToggleGroupItem>
            <ToggleGroupItem value="Work" className="px-5 h-10 rounded-xl gap-2 font-bold text-xs data-[state=on]:bg-primary/10 data-[state=on]:text-primary border-border/50">
              <Briefcase className="w-3.5 h-3.5" /> Work
            </ToggleGroupItem>
            <ToggleGroupItem value="Others" className="px-5 h-10 rounded-xl gap-2 font-bold text-xs data-[state=on]:bg-primary/10 data-[state=on]:text-primary border-border/50">
              <MapPin className="w-3.5 h-3.5" /> Others
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Building Type */}
        <div className="space-y-4">
          <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 px-1">Building Category</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { id: "Society", name: "Society", icon: <Building2 className="w-4 h-4" /> },
              { id: "Independent house", name: "House", icon: <Home className="w-4 h-4" /> },
              { id: "Standalone", name: "Standalone", icon: <Building className="w-4 h-4" /> },
              { id: "Office", name: "Office", icon: <Briefcase className="w-4 h-4" /> },
              { id: "Hotel", name: "Hotel", icon: <Hotel className="w-4 h-4" /> },
              { id: "Others", name: "Others", icon: <Warehouse className="w-4 h-4" /> },
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setValue("buildingType", type.id as any)}
                className={`flex items-center gap-3 px-4 h-14 rounded-2xl border transition-all text-left group ${
                  selectedBuildingType === type.id 
                  ? 'border-primary bg-primary/[0.04] text-primary font-black shadow-md' 
                  : 'border-border/30 text-muted-foreground hover:border-primary/20 hover:bg-muted/10'
                }`}
              >
                <div className={`transition-transform group-hover:scale-110 ${selectedBuildingType === type.id ? 'text-primary' : 'opacity-40'}`}>
                  {type.icon}
                </div>
                <span className="text-[11px] font-bold leading-none tracking-tight uppercase truncate">{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Address Inputs */}
        <div className="space-y-4">
          <div className="space-y-1">
            <Input 
              {...register("addressLine")}
              placeholder="Complete Address *" 
              className={`h-14 rounded-2xl bg-muted/10 border-border/40 focus:ring-primary/20 ${errors.addressLine ? 'border-destructive' : ''}`}
            />
            {errors.addressLine && <p className="text-[10px] font-bold text-destructive px-2 leading-none">{errors.addressLine.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Input 
                {...register("houseNo")}
                placeholder="House / Flat / Room No *" 
                className={`h-14 rounded-2xl bg-muted/10 border-border/40 focus:ring-primary/20 ${errors.houseNo ? 'border-destructive' : ''}`}
              />
              {errors.houseNo && <p className="text-[10px] font-bold text-destructive px-2 leading-none">{errors.houseNo.message}</p>}
            </div>
            <Input 
              {...register("buildingName")}
              placeholder="Building name" 
              className="h-14 rounded-2xl bg-muted/10 border-border/40 focus:ring-primary/20"
            />
          </div>

          <Input 
            {...register("landmark")}
            placeholder="Landmark (Optional e.g. Near Apollo Hospital)" 
            className="h-14 rounded-2xl bg-muted/10 border-border/40 focus:ring-primary/20"
          />
        </div>

        {/* Receiver Details */}
        <div className="space-y-4 pt-4">
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 border-t border-border/30 pt-6">Contact Information</p>
           <div className="space-y-3">
              <div className="space-y-1">
                <Input 
                  {...register("receiverName")}
                  placeholder="Receiver Name" 
                  className={`h-14 rounded-2xl bg-muted/10 border-border/40 focus:ring-primary/20 ${errors.receiverName ? 'border-destructive' : ''}`}
                />
                {errors.receiverName && <p className="text-[10px] font-bold text-destructive px-2 leading-none">{errors.receiverName.message}</p>}
              </div>
              <div className="space-y-1">
                <div className="relative group">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground group-focus-within:text-primary tracking-tighter opacity-70">+91</span>
                   <Input 
                    {...register("receiverPhone")}
                    placeholder="Receiver Number" 
                    className={`h-14 rounded-2xl bg-muted/10 border-border/40 pl-14 focus:ring-primary/20 ${errors.receiverPhone ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.receiverPhone && <p className="text-[10px] font-bold text-destructive px-2 leading-none">{errors.receiverPhone.message}</p>}
              </div>
            </div>
         </div>
         
         {/* Extra spacing for mobile sticky button */}
         <div className="h-24 lg:hidden" />
      </div>

      <div className="p-6 bg-background border-t border-border/40 shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full h-14 rounded-2xl gradient-primary text-primary-foreground font-black italic tracking-tighter shadow-xl hover:translate-y-[-2px] transition-all disabled:opacity-50 text-xl"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
               <Loader2 className="w-5 h-5 animate-spin" /> Saving...
            </div>
          ) : "Save Address"}
        </Button>
      </div>
    </form>
  );
};

export default AddressDetailsForm;
