import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp, UserRole } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UtensilsCrossed, GraduationCap, ChefHat, Shield } from "lucide-react";

const roles: { value: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: "student", label: "Student", icon: <GraduationCap className="w-5 h-5" />, desc: "Order home-cooked meals" },
  { value: "chef", label: "Chef", icon: <ChefHat className="w-5 h-5" />, desc: "Sell your food to students" },
];

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Role is already lowercase in the 'role' state
    const result = await register(name, email, password, role);
    
    if (result.success) {
      toast({ title: "Welcome to CampusThali!", description: "Account created." });
      navigate(role === "student" ? "/student-dashboard" : role === "chef" ? "/chef-dashboard" : "/admin-dashboard");
    } else {
      toast({ 
        title: "Registration failed", 
        description: result.message || "Registration failed. Please check your data.", 
        variant: "destructive" 
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-extrabold text-gradient-primary">CampusThali</h1>
          </div>
        </div>
        <Card className="shadow-lg border-border/50">
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Choose your role and get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {roles.map((r) => (
                  <button key={r.value} type="button" onClick={() => setRole(r.value)}
                    className={`p-3 rounded-lg border text-center transition-all ${role === r.value ? "border-primary bg-accent text-accent-foreground shadow-sm" : "border-border hover:border-primary/40"}`}>
                    <div className="flex justify-center mb-1">{r.icon}</div>
                    <p className="text-xs font-semibold">{r.label}</p>
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@campus.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full gradient-primary text-primary-foreground font-semibold">
                {isLoading ? "Creating..." : "Create Account"}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
