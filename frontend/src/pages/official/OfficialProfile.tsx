import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  User,
  Mail,
  Key,
  MapPin,
  Calendar,
  Settings,
  LogOut,
  Edit,
  Save,
  X
} from "lucide-react";

const OfficialProfile = () => {
  const [officialData, setOfficialData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    region: "",
    phone: ""
  });

  useEffect(() => {
    const session = localStorage.getItem("officialSession");
    if (session) {
      const data = JSON.parse(session);
      setOfficialData(data);
      setEditForm({
        name: data.name || "",
        email: data.email || "",
        region: data.region || "National",
        phone: data.phone || ""
      });
    }
  }, []);

  if (!officialData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md shadow-card">
          <CardContent className="text-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">Please login as an official to access this profile.</p>
            <Link to="/official/login">
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = () => {
    const updatedData = { ...officialData, ...editForm };
    setOfficialData(updatedData);
    localStorage.setItem("officialSession", JSON.stringify(updatedData));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      name: officialData.name || "",
      email: officialData.email || "",
      region: officialData.region || "National",
      phone: officialData.phone || ""
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("officialSession");
    window.location.href = "/official/login";
  };

  // Mock stats for the official
  const reviewStats = {
    totalReviews: 156,
    pendingReviews: 23,
    approvedSubmissions: 128,
    rejectedSubmissions: 5,
    averageReviewTime: "2.3 hours"
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <User className="h-8 w-8 text-accent" />
            <h1 className="text-2xl font-bold text-accent">Official Profile</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/official/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Link to="/official/reports">
              <Button variant="outline">Reports</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleCancel}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Enter your name"
                      />
                    ) : (
                      <p className="text-foreground mt-1">{officialData.name}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        placeholder="Enter your email"
                      />
                    ) : (
                      <p className="text-foreground mt-1">{officialData.email}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <div className="mt-1">
                      <Badge variant="default">{officialData.role}</Badge>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="region">Assigned Region</Label>
                    {isEditing ? (
                      <Input
                        id="region"
                        value={editForm.region}
                        onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                        placeholder="Enter assigned region"
                      />
                    ) : (
                      <p className="text-foreground mt-1">{editForm.region}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <p className="text-foreground mt-1">{editForm.phone || "Not provided"}</p>
                    )}
                  </div>
                  <div>
                    <Label>Member Since</Label>
                    <p className="text-foreground mt-1">January 2024</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="mr-2 h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Change Password</h4>
                    <p className="text-sm text-muted-foreground">Update your account password</p>
                  </div>
                  <Button variant="outline">Change Password</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Badge variant="secondary">Not Enabled</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Login History</h4>
                    <p className="text-sm text-muted-foreground">View recent login activity</p>
                  </div>
                  <Button variant="outline">View History</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <div className="w-20 h-20 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{officialData.name}</h3>
                <p className="text-muted-foreground text-sm mb-3">{officialData.role}</p>
                <Badge variant="outline" className="mb-4">
                  <MapPin className="mr-1 h-3 w-3" />
                  {editForm.region}
                </Badge>
                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    <Calendar className="inline mr-1 h-3 w-3" />
                    Joined January 2024
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Review Statistics */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Review Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Reviews</span>
                  <span className="font-semibold">{reviewStats.totalReviews}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <Badge variant="secondary">{reviewStats.pendingReviews}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Approved</span>
                  <Badge variant="default">{reviewStats.approvedSubmissions}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Rejected</span>
                  <Badge variant="destructive">{reviewStats.rejectedSubmissions}</Badge>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Review Time</span>
                  <span className="font-semibold text-primary">{reviewStats.averageReviewTime}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/official/dashboard">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    Review Dashboard
                  </Button>
                </Link>
                <Link to="/official/reports">
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="mr-2 h-4 w-4" />
                    View Reports
                  </Button>
                </Link>
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficialProfile;