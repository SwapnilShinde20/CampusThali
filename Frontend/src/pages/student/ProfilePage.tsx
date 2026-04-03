import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User, Phone, School, Mail, Loader2, Save, ShoppingBag, MapPin, Camera, Clock, Home } from "lucide-react";
import { api, getImageUrl } from "@/lib/api";

const navItems = [
  { label: "Browse", path: "/student-dashboard", icon: <Home className="w-4 h-4" /> },
  { label: "Orders", path: "/student-dashboard/orders", icon: <ShoppingBag className="w-4 h-4" /> },
  { label: "Cart", path: "/student-dashboard/cart", icon: <Clock className="w-4 h-4" /> },
  { label: "Addresses", path: "/student-dashboard/addresses", icon: <MapPin className="w-4 h-4" /> },
  { label: "Profile", path: "/student-dashboard/profile", icon: <User className="w-4 h-4" /> },
];

const ProfilePage = () => {
  const { currentUser, updateProfile } = useApp();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    college: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        college: currentUser.college || ""
      });
      if (currentUser.avatar) {
        setImagePreview(getImageUrl(currentUser.avatar));
      }
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("phone", formData.phone);
    data.append("college", formData.college);
    if (imageFile) {
      data.append("image", imageFile);
    }

    try {
      const response = await api.put("/user/profile", data, currentUser?.token);
      if (response) {
        // Update local context
        updateProfile(response);
        toast({ title: "Profile Updated", description: "Your personal details have been saved." });
      }
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.message || "Failed to save profile.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout title="My Profile" navItems={navItems}>
      <div className="max-w-2xl mx-auto animate-fade-in pb-20">
        <Card className="border-none shadow-sm">
          <CardHeader className="text-center pb-2">
            <div className="relative w-24 h-24 mx-auto mb-4 group cursor-pointer overflow-hidden rounded-3xl border-4 border-white shadow-lg shadow-primary/20">
              {imagePreview ? (
                <img src={imagePreview} alt="Avatar" className="w-full h-full object-cover transition-opacity group-hover:opacity-80" />
              ) : (
                <div className="w-full h-full gradient-primary flex items-center justify-center text-primary-foreground text-3xl font-black">
                  {currentUser?.name?.charAt(0)}
                </div>
              )}
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
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-foreground italic">Personal Profile</h1>
            <p className="text-muted-foreground font-medium text-sm">Update your contact details for better service (Optional for ordering)</p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                    <User className="w-3 h-3" /> Full Name
                  </Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12 px-4 rounded-xl border-2 focus-visible:ring-primary font-bold"
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2 opacity-60">
                  <Label htmlFor="email" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                    <Mail className="w-3 h-3" /> Email Address
                  </Label>
                  <Input 
                    id="email" 
                    value={formData.email} 
                    disabled 
                    className="h-12 px-4 rounded-xl border-2 bg-muted font-bold cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                    <Phone className="w-3 h-3" /> Phone Number
                  </Label>
                  <Input 
                    id="phone" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-12 px-4 rounded-xl border-2 focus-visible:ring-primary font-bold"
                    placeholder="+91 00000 00000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="college" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                    <School className="w-3 h-3" /> College / University
                  </Label>
                  <Input 
                    id="college" 
                    value={formData.college} 
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    className="h-12 px-4 rounded-xl border-2 focus-visible:ring-primary font-bold"
                    placeholder="e.g. IIT Bombay"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-12 gradient-primary text-primary-foreground font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
