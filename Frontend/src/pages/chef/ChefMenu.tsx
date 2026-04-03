import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ShoppingBag, 
  Plus, 
  Pencil, 
  Trash2, 
  Leaf, 
  Loader2, 
  ChefHat,
  Package,
  Badge,
  User
} from "lucide-react";
import { 
  useMenu, 
  useCreateMenuItem, 
  useUpdateMenuItem, 
  useDeleteMenuItem, 
  ApiMenuItem 
} from "@/hooks/useMenu";
import { useChefProfileMe } from "@/hooks/useChefs";
import { getImageUrl } from "@/lib/api";

const navItems = [
  { label: "Dashboard", path: "/chef-dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Menu", path: "/chef-dashboard/menu", icon: <UtensilsCrossed className="w-4 h-4" /> },
  { label: "Orders", path: "/chef-dashboard/orders", icon: <ShoppingBag className="w-4 h-4" /> },
  { label: "Profile", path: "/chef/profile-setup", icon: <User className="w-4 h-4" /> },
];

const ChefMenu = () => {
  const { currentUser } = useApp();
  const { toast } = useToast();
  
  // Real Data Hooks
  const { data: chef, isLoading: profileLoading } = useChefProfileMe(currentUser?.token || "");
  const { data: myMenu = [], isLoading: menuLoading, isError: menuError } = useMenu(currentUser?.id || "");
  
  // Mutations
  const createMutation = useCreateMenuItem();
  const updateMutation = useUpdateMenuItem();
  const deleteMutation = useDeleteMenuItem();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ 
    name: "", 
    description: "", 
    price: "", 
    category: "", 
    isVeg: true 
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    console.log("ChefMenu Debug:", {
      userId: currentUser?.id,
      chefIdFromProfile: chef?._id,
      menuItemCount: myMenu.length
    });
  }, [currentUser, chef, myMenu]);

  const resetForm = () => { 
    setForm({ name: "", description: "", price: "", category: "", isVeg: true }); 
    setImageFile(null);
    setImagePreview(null);
    setEditId(null); 
  };

  const openEdit = (item: ApiMenuItem) => {
    setEditId(item._id);
    setForm({ 
      name: item.name, 
      description: item.description, 
      price: String(item.price), 
      category: item.category, 
      isVeg: item.isVeg 
    });
    setImagePreview(getImageUrl(item.image || ""));
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !currentUser) return;
    
    const formData = new FormData();
    formData.append("chefId", currentUser.id);
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("category", form.category);
    formData.append("isVeg", String(form.isVeg));
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      if (editId) {
        await updateMutation.mutateAsync({ 
          id: editId, 
          itemData: formData, 
          token: currentUser.token 
        });
        toast({ title: "Item updated!", description: `${form.name} was successfully modified.` });
      } else {
        await createMutation.mutateAsync({ 
          itemData: formData, 
          token: currentUser.token 
        });
        toast({ title: "Item added!", description: `${form.name} is now on your menu.` });
      }
      setOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ 
        title: "Save failed", 
        description: error.message || "Something went wrong while saving the item.", 
        variant: "destructive" 
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!currentUser) return;
    try {
      await deleteMutation.mutateAsync({ id, token: currentUser.token });
      toast({ title: "Item deleted.", description: "The dish has been removed from your menu." });
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.message || "Failed to save profile.", variant: "destructive" });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout navItems={navItems} title="Menu Management">
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center bg-card p-4 rounded-2xl border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
               <ChefHat className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Your Kitchen Menu</h2>
              <p className="text-xs text-muted-foreground">{myMenu.length} dishes published</p>
            </div>
          </div>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground font-bold shadow-lg">
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">{editId ? "Edit Dish" : "New Dish"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Dish Name</Label>
                  <Input 
                    placeholder="e.g., Paneer Butter Masala" 
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                    className="h-12 text-lg font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description</Label>
                  <Input 
                    placeholder="Briefly describe what makes this dish special" 
                    value={form.description} 
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Price (₹)</Label>
                    <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Category</Label>
                    <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Main Course" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Dish Image (JPG/PNG, Max 10MB)</Label>
                  <div className="flex items-center gap-4">
                    {imagePreview && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-border shadow-sm">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <Input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setImageFile(file);
                            setImagePreview(URL.createObjectURL(file));
                          }
                        }}
                        className="cursor-pointer file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-primary/10 file:text-primary hover:file:bg-primary/20" 
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-muted/30 p-4 rounded-2xl border border-border/50">
                  <div className="flex items-center gap-2">
                    <Switch checked={form.isVeg} onCheckedChange={(v) => setForm({ ...form, isVeg: v })} />
                    <Label className="font-bold flex items-center gap-1">
                      Vegetarian {form.isVeg && <Leaf className="w-3 h-3 text-success" />}
                    </Label>
                  </div>
                </div>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="w-full h-14 gradient-primary text-primary-foreground font-black text-lg py-6"
                >
                  {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : editId ? "Update Dish" : "Publish Dish"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {menuLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-card/50 rounded-2xl border border-border/50 animate-pulse" />
            ))}
          </div>
        ) : myMenu.length === 0 ? (
          <div className="text-center py-24 bg-muted/10 rounded-3xl border-2 border-dashed border-border/50">
             <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-muted-foreground/30" />
             </div>
             <h3 className="text-2xl font-black mb-2 italic">Nothing cooking yet?</h3>
             <p className="text-muted-foreground max-w-sm mx-auto font-medium">Add your first dish to start receiving orders from thirsty and hungry students!</p>
             <Button 
                onClick={() => setOpen(true)} 
                variant="outline" 
                className="mt-6 border-primary/20 hover:bg-primary/5 text-primary font-bold"
              >
                Add Your First Item
              </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myMenu.map((item) => (
              <Card key={item._id} className="overflow-hidden hover:shadow-xl transition-all group border border-border/40">
                <CardContent className="p-0">
                  <div className="flex h-32">
                    <div className="w-1/3 relative overflow-hidden">
                      <img src={getImageUrl(item.image || "")} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute top-2 left-2">
                        <Badge className={`${item.isVeg ? "bg-success" : "bg-destructive"} text-[8px] px-1 py-0 h-4 border-0`}>
                          {item.isVeg ? "VEG" : "NON-VEG"}
                        </Badge>
                      </div>
                    </div>
                    <div className="w-2/3 p-4 flex flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{item.name}</h4>
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mt-0.5">{item.category}</p>
                        </div>
                        <p className="text-xl font-black text-primary">₹{item.price}</p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-border/30">
                        <p className="text-[10px] text-muted-foreground italic truncate max-w-[120px]">
                          {item.description || "Freshly cooked to order."}
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            variant="secondary" 
                            size="icon" 
                            className="h-8 w-8 rounded-full shadow-sm hover:bg-primary/10 hover:text-primary transition-all" 
                            onClick={() => openEdit(item)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="h-8 w-8 rounded-full shadow-sm bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all" 
                            onClick={() => handleDelete(item._id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
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

export default ChefMenu;
