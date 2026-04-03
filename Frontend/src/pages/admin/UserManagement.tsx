import { useApp } from "@/contexts/AppContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdminUsers, useDeleteUser } from "@/hooks/useAdmin";
import { adminNavItems } from "@/constants/adminNav";
import { useToast } from "@/hooks/use-toast";
import { Users, Trash2, Mail, Shield, User, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const UserManagement = () => {
  const { currentUser } = useApp();
  const { toast } = useToast();
  const { data: users = [], isLoading } = useAdminUsers(currentUser?.token || "");
  const deleteMutation = useDeleteUser();
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = async (id: string) => {
    if (!currentUser?.token) return;
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await deleteMutation.mutateAsync({ id, token: currentUser.token });
      toast({ title: "User Deleted" });
    } catch (error: any) {
      toast({ 
        title: "Delete failed", 
        description: error.message || "Could not delete user", 
        variant: "destructive" 
      });
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <DashboardLayout navItems={adminNavItems} title="User Management">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={adminNavItems} title="User Management">
      <div className="space-y-6 animate-fade-in pb-20 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-black italic">Platform Users ({users.length})</h2>
          </div>
          
          <div className="relative w-full sm:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 rounded-xl border-2 focus-visible:ring-0 focus-visible:border-primary transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredUsers.map((user) => (
            <Card key={user._id} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between p-5 gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 ${
                      user.role === 'admin' ? 'bg-indigo-500/10 text-indigo-600' : 
                      user.role === 'chef' ? 'bg-amber-500/10 text-amber-600' : 'bg-primary/10 text-primary'
                    }`}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{user.name}</h3>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-[8px] font-black uppercase px-2 py-0.5 rounded-lg">
                          {user.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <Mail className="w-3 h-3" /> {user.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest hidden lg:block">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(user._id)}
                      disabled={user.role === 'admin' || deleteMutation.isPending}
                      className="text-destructive hover:bg-destructive/5 hover:text-destructive rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
