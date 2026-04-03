import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UtensilsCrossed } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, currentUser } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  if (currentUser) {
    const path = currentUser.role === "student" ? "/student-dashboard" : currentUser.role === "chef" ? "/chef-dashboard" : "/admin-dashboard";
    navigate(path, { replace: true });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      toast({ title: "Welcome back!", description: "Logged in successfully." });
    } else {
      toast({ 
        title: "Login failed", 
        description: result.message || "Invalid credentials. Please try again.", 
        variant: "destructive" 
      });
    }
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
          <p className="text-muted-foreground">Ghar ka khana, campus pe.</p>
        </div>
        <Card className="shadow-lg border-border/50">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your email to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@campus.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold">Sign In</Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Don't have an account? <Link to="/register" className="text-primary font-medium hover:underline">Register</Link>
            </p>
            <div className="mt-4 p-3 rounded-lg bg-muted text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Demo accounts (any password):</p>
              <p>Student: rahul@campus.edu</p>
              <p>Chef: anita@chef.com</p>
              <p>Admin: admin@campusthali.com</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
