import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  School, 
  Loader2, 
  Save, 
  Camera, 
  UtensilsCrossed, 
  Phone,
  LayoutDashboard,
  ShoppingBag
} from "lucide-react";
import { api, getImageUrl } from "@/lib/api";
import { useNavigate } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/chef-dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Menu", path: "/chef-dashboard/menu", icon: <UtensilsCrossed className="w-4 h-4" /> },
  { label: "Orders", path: "/chef-dashboard/orders", icon: <ShoppingBag className="w-4 h-4" /> },
  { label: "Profile", path: "/chef/profile-setup", icon: <User className="w-4 h-4" /> },
];

const ChefProfileSetup = () => {
  const { currentUser, chefProfile, setChefProfile } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    college: "",
    phone: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    // If user is already set, fetch current chef profile if exists
    const fetchChefData = async () => {
      try {
        const response = await api.get("/chefs/me", currentUser?.token);
        if (response) {
          setFormData({
            bio: response.data.bio || "",
            college: response.data.college || "",
            phone: response.data.phone || "",
          });
          if (response.data.profileImage) {
            setImagePreview(getImageUrl(response.data.profileImage));
          }
        }
      } catch (error) {
        // No profile yet, that's fine
      }
    };
    if (currentUser) fetchChefData();
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bio || !formData.college) {
      toast({ title: "Incomplete Profile", description: "Please fill in all fields (bio and college) to start selling.", variant: "destructive" });
      return;
    }

    const data = new FormData();
    data.append("bio", formData.bio);
    data.append("college", formData.college);
    data.append("phone", formData.phone);
    if (imageFile) {
      data.append("image", imageFile);
    }
    setIsLoading(true);
    try {
      const response = await api.put("/chefs/profile", data, currentUser?.token);
      if (response) {
        setChefProfile(response.data);
        toast({ title: "Profile Saved!", description: "Your kitchen bio and picture have been updated." });
        navigate("/chef-dashboard");
      }
    } catch (error: any) {
      toast({ title: "Setup Failed", description: error.message || "Failed to save profile.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="Kitchen Profile Settings">
      <div className="max-w-3xl mx-auto py-6 animate-slide-up">
        <div className="flex flex-col items-center mb-8">
           <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground mb-4 shadow-lg shadow-primary/20">
             <UtensilsCrossed className="w-8 h-8" />
           </div>
           <h2 className="text-2xl font-black text-foreground italic uppercase tracking-tight">Kitchen Profile Settings</h2>
           <p className="text-muted-foreground font-medium">Manage your kitchen details and campus presence</p>
        </div>

        <Card className="border-none shadow-xl shadow-primary/5 rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-primary/5 text-center py-8">
            <div className="relative w-32 h-32 mx-auto mb-4 group cursor-pointer">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Profile" 
                  className="w-full h-full object-cover rounded-[2.5rem] border-4 border-white shadow-md group-hover:opacity-80 transition-opacity"
                />
              ) : (
                <div className="w-full h-full bg-white rounded-[2.5rem] flex flex-col items-center justify-center border-4 border-dashed border-primary/20 text-muted-foreground group-hover:border-primary/40 transition-colors">
                  <Camera className="w-8 h-8 mb-1" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Add Photo</span>
                </div>
              )}
            </div>
            <CardTitle className="text-xl font-black uppercase tracking-tight">Chef Branding</CardTitle>
            {chefProfile?.isProfileComplete && !chefProfile?.isApproved && (
              <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl animate-pulse">
                <p className="text-amber-600 text-xs font-black uppercase tracking-widest">
                  Waiting for Admin Approval
                </p>
                <p className="text-amber-700/70 text-[10px] font-bold mt-1">
                  Your profile is complete! Our team is reviewing your application.
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="image" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                  <Camera className="w-3 h-3" /> Profile Picture (JPG/PNG, Max 10MB)
                </Label>
                <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors bg-white/50">
                   <Input 
                    id="image" 
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="py-4 flex flex-center flex-col items-center justify-center text-muted-foreground">
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {imageFile ? imageFile.name : "Select or Drop Image"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="college" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                    <School className="w-3 h-3" /> Designated Campus
                  </Label>
                  <Input 
                    id="college" 
                    value={formData.college} 
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    className="h-14 px-6 rounded-2xl border-2 focus-visible:ring-primary font-bold"
                    placeholder="e.g. IIT Bombay / VJTI"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                    <Phone className="w-3 h-3" /> Mobile Number
                  </Label>
                  <Input 
                    id="phone" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-14 px-6 rounded-2xl border-2 focus-visible:ring-primary font-bold"
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                  <User className="w-3 h-3" /> Short Bio / Kitchen Story
                </Label>
                <Textarea 
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="min-h-[120px] px-6 py-4 rounded-2xl border-2 focus-visible:ring-primary font-bold resize-none"
                  placeholder="e.g. Cooking home-style Maharashtrian meals with love..."
                />
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-14 gradient-primary text-primary-foreground font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all gap-3"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ChefProfileSetup;
