import { useApp } from "@/contexts/AppContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdminChefs, useApproveChef, useRejectChef } from "@/hooks/useAdmin";
import { adminNavItems } from "@/constants/adminNav";
import { useToast } from "@/hooks/use-toast";
import { ChefHat, CheckCircle, XCircle, Star, Loader2, Mail, School, Phone } from "lucide-react";

const ChefManagement = () => {
  const { currentUser } = useApp();
  const { toast } = useToast();
  const { data: chefs = [], isLoading } = useAdminChefs(currentUser?.token || "");
  const approveMutation = useApproveChef();
  const rejectMutation = useRejectChef();

  const handleApprove = async (id: string) => {
    if (!currentUser?.token) return;
    try {
      await approveMutation.mutateAsync({ id, token: currentUser.token });
      toast({ title: "Chef Approved", description: "The chef is now active on the platform." });
    } catch (error) {
      toast({ title: "Approval failed", variant: "destructive" });
    }
  };

  const handleReject = async (id: string) => {
    if (!currentUser?.token) return;
    try {
      await rejectMutation.mutateAsync({ id, token: currentUser.token });
      toast({ title: "Chef Rejected/Suspended", description: "The chef has been moved to pending status." });
    } catch (error) {
      toast({ title: "Rejection failed", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout navItems={adminNavItems} title="Chef Management">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={adminNavItems} title="Chef Management">
      <div className="space-y-6 animate-fade-in pb-20">
        <div className="flex items-center gap-2 mb-2">
          <ChefHat className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-black italic">Platform Chefs ({chefs.length})</h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {chefs.map((chef) => (
            <Card key={chef._id} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                  <div className="flex items-start gap-5">
                    <div className="w-16 h-16 rounded-3xl bg-amber-500/10 flex items-center justify-center text-amber-600 font-black text-2xl shrink-0">
                      {chef.userId?.name?.charAt(0)}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black tracking-tight">{chef.userId?.name}</h3>
                        <Badge className={`${chef.isApproved ? "bg-emerald-500 text-white border-0" : "bg-amber-500 text-white border-0"} text-[9px] font-black uppercase px-2 py-0.5 rounded-lg ml-2`}>
                          {chef.isApproved ? "Approved" : "Pending"}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-1 text-muted-foreground">
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest leading-none">
                          <Mail className="w-3 h-3" /> {chef.userId?.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest leading-none">
                          <School className="w-3 h-3" /> {chef.college}
                        </div>
                        {chef.phone && (
                          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest leading-none text-primary">
                            <Phone className="w-3 h-3" /> {chef.phone}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-black">
                        <Star className="w-4 h-4 fill-current" /> {chef.rating.toFixed(1)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {!chef.isApproved ? (
                      <Button 
                        size="sm" 
                        onClick={() => handleApprove(chef._id)} 
                        disabled={approveMutation.isPending}
                        className="gradient-primary text-primary-foreground font-bold rounded-xl h-10 px-6 gap-2"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleReject(chef._id)} 
                        disabled={rejectMutation.isPending}
                        className="font-bold border-2 rounded-xl h-10 px-6 gap-2 text-destructive hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </Button>
                    )}
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

export default ChefManagement;
