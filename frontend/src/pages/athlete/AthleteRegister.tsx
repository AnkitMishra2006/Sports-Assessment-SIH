import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trophy, ArrowLeft, User, MapPin, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { statesAndDistricts, sportsCategories } from "@/data/mockData";

const AthleteRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    state: "",
    district: "",
    height: "",
    weight: "",
    sport: "",
    experience: "",
    previousAchievements: "",
    parentName: "",
    parentPhone: "",
    schoolCollege: "",
    emergencyContact: "",
    medicalConditions: "",
    consent: false
  });
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleStateChange = (state: string) => {
    setFormData({ ...formData, state, district: "" });
    setAvailableDistricts(statesAndDistricts[state] || []);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.consent) {
      toast({
        title: "Consent Required",
        description: "Please agree to share your performance data with SAI.",
        variant: "destructive",
      });
      return;
    }

    // Mock registration - store in localStorage
    const athleteData = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      registeredAt: new Date().toISOString(),
      testProgress: {
        "height-weight": { status: "pending", completedAt: null },
        "vertical-jump": { status: "pending", completedAt: null },
        "sit-ups": { status: "pending", completedAt: null },
        "shuttle-run": { status: "pending", completedAt: null },
        "endurance-run": { status: "pending", completedAt: null }
      },
      badges: [],
      profileCompletion: 100
    };
    
    localStorage.setItem("athleteData", JSON.stringify(athleteData));

    toast({
      title: "Registration Successful!",
      description: "Welcome to SAI Talent Assessment Platform.",
    });

    navigate("/athlete/dashboard");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center">
              <Trophy className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Athlete Registration</h1>
          <p className="text-muted-foreground">
            Join the SAI Talent Assessment Platform and discover your potential
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </CardTitle>
              <CardDescription>Basic details about yourself</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="dob">Date of Birth *</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="170"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="65"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Location Information
              </CardTitle>
              <CardDescription>Your current location details</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state">State *</Label>
                <Select value={formData.state} onValueChange={handleStateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(statesAndDistricts).map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="district">District *</Label>
                <Select 
                  value={formData.district} 
                  onValueChange={(value) => setFormData({ ...formData, district: value })}
                  disabled={!formData.state}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.state ? "Select your district" : "Select state first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDistricts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="schoolCollege">School/College</Label>
                <Input
                  id="schoolCollege"
                  type="text"
                  value={formData.schoolCollege}
                  onChange={(e) => setFormData({ ...formData, schoolCollege: e.target.value })}
                  placeholder="Your institution name"
                />
              </div>
            </CardContent>
          </Card>

          {/* Sports Information */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Sports Information
              </CardTitle>
              <CardDescription>Tell us about your sports background</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sport">Primary Sport *</Label>
                <Select value={formData.sport} onValueChange={(value) => setFormData({ ...formData, sport: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your primary sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {sportsCategories.map((sport) => (
                      <SelectItem key={sport} value={sport}>
                        {sport}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="experience">Experience Level</Label>
                <Select value={formData.experience} onValueChange={(value) => setFormData({ ...formData, experience: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                    <SelectItem value="advanced">Advanced (3-5 years)</SelectItem>
                    <SelectItem value="expert">Expert (5+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="achievements">Previous Achievements</Label>
                <Textarea
                  id="achievements"
                  value={formData.previousAchievements}
                  onChange={(e) => setFormData({ ...formData, previousAchievements: e.target.value })}
                  placeholder="List any medals, competitions, or recognitions you've received..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Emergency Contact & Medical Information</CardTitle>
              <CardDescription>For safety and emergency purposes</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parentName">Parent/Guardian Name</Label>
                <Input
                  id="parentName"
                  type="text"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="parentPhone">Parent/Guardian Phone</Label>
                <Input
                  id="parentPhone"
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  type="tel"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  placeholder="Alternative emergency contact"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="medical">Medical Conditions (if any)</Label>
                <Textarea
                  id="medical"
                  value={formData.medicalConditions}
                  onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
                  placeholder="Any medical conditions, allergies, or injuries we should know about..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Consent */}
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consent"
                    checked={formData.consent}
                    onCheckedChange={(checked) => setFormData({ ...formData, consent: checked as boolean })}
                    className="mt-1"
                  />
                  <div className="space-y-2">
                    <Label htmlFor="consent" className="text-sm leading-relaxed">
                      I agree to share my performance data with SAI for talent identification purposes. 
                      I understand that this data will be used to assess my athletic potential and may 
                      be shared with authorized SAI officials for selection into sports development programs.
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      By checking this box, you consent to data processing as per SAI's privacy policy.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="submit"
              className="flex-1 bg-gradient-hero hover:shadow-glow"
              disabled={!formData.consent}
            >
              <Trophy className="w-4 h-4 mr-2" />
              Create My Athlete Profile
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/athlete/login" className="text-primary hover:underline font-medium">
              Sign in here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AthleteRegister;