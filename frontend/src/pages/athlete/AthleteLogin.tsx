import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trophy, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AthleteLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock login - check if user exists in localStorage
    const athleteData = localStorage.getItem("athleteData");
    
    if (athleteData) {
      const athlete = JSON.parse(athleteData);
      if (athlete.email === formData.email) {
        toast({
          title: "Welcome back!",
          description: "Successfully logged in to your athlete dashboard.",
        });
        navigate("/athlete/dashboard");
        return;
      }
    }
    
    // For demo purposes, allow any email/password combination
    toast({
      title: "Login Successful!",
      description: "Welcome to your athlete dashboard.",
    });
    
    // Create mock athlete data if none exists
    if (!athleteData) {
      localStorage.setItem("athleteData", JSON.stringify({
        name: "Demo Athlete",
        email: formData.email,
        phone: "+91 9876543210",
        dateOfBirth: "2000-01-01",
        gender: "male",
        district: "Mumbai",
        id: Math.random().toString(36).substr(2, 9),
        registeredAt: new Date().toISOString(),
        testProgress: {
          heightWeight: { status: "pending", completedAt: null },
          verticalJump: { status: "pending", completedAt: null },
          sitUps: { status: "pending", completedAt: null },
          shuttleRun: { status: "pending", completedAt: null },
          enduranceRun: { status: "pending", completedAt: null }
        },
        badges: []
      }));
    }
    
    navigate("/athlete/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center">
              <Trophy className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Athlete Login</CardTitle>
          <CardDescription>
            Sign in to access your performance dashboard
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-gradient-hero hover:shadow-glow">
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Don't have an account?{" "}
              <Link to="/athlete/register" className="text-primary hover:underline">
                Register now
              </Link>
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AthleteLogin;