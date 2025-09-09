import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, 
  Users, 
  CheckCircle, 
  XCircle,
  Clock,
  Filter,
  Download,
  TrendingUp,
  BarChart3,
  MapPin,
  Eye,
  AlertTriangle
} from "lucide-react";

interface OfficialSession {
  email: string;
  role: string;
  name: string;
}

interface Submission {
  id: string;
  athleteName: string;
  age: number;
  gender: string;
  district: string;
  testType: string;
  result: number;
  percentile: number;
  submittedAt: string;
  status: "pending" | "approved" | "rejected" | "flagged";
  flags: string[];
}

const OfficialDashboard = () => {
  const [officialData, setOfficialData] = useState<OfficialSession | null>(null);
  const [activeTab, setActiveTab] = useState("submissions");
  const [filterDistrict, setFilterDistrict] = useState("all");
  const [filterTest, setFilterTest] = useState("all");

  // Mock submissions data
  const [submissions] = useState<Submission[]>([
    {
      id: "sub_001",
      athleteName: "Rahul Kumar",
      age: 19,
      gender: "male",
      district: "Mumbai",
      testType: "Vertical Jump",
      result: 42,
      percentile: 85,
      submittedAt: "2024-01-15T10:30:00Z",
      status: "pending",
      flags: []
    },
    {
      id: "sub_002", 
      athleteName: "Priya Sharma",
      age: 17,
      gender: "female",
      district: "Delhi",
      testType: "Vertical Jump",
      result: 38,
      percentile: 92,
      submittedAt: "2024-01-15T09:15:00Z",
      status: "approved",
      flags: []
    },
    {
      id: "sub_003",
      athleteName: "Arjun Singh",
      age: 20,
      gender: "male", 
      district: "Pune",
      testType: "Vertical Jump",
      result: 35,
      percentile: 65,
      submittedAt: "2024-01-15T08:45:00Z",
      status: "flagged",
      flags: ["Frame anomaly detected", "Inconsistent measurements"]
    },
    {
      id: "sub_004",
      athleteName: "Meera Patel",
      age: 18,
      gender: "female",
      district: "Bangalore",
      testType: "Sit-ups",
      result: 45,
      percentile: 78,
      submittedAt: "2024-01-15T07:20:00Z",
      status: "approved",
      flags: []
    }
  ]);

  useEffect(() => {
    const session = localStorage.getItem("officialSession");
    if (session) {
      setOfficialData(JSON.parse(session));
    }
  }, []);

  if (!officialData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md shadow-card">
          <CardContent className="text-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">Please login as an official to access this dashboard.</p>
            <Link to="/official/login">
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "success";
      case "rejected": return "destructive";
      case "flagged": return "warning";
      default: return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return CheckCircle;
      case "rejected": return XCircle;
      case "flagged": return AlertTriangle;
      default: return Clock;
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (filterDistrict !== "all" && sub.district !== filterDistrict) return false;
    if (filterTest !== "all" && sub.testType !== filterTest) return false;
    return true;
  });

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === "pending").length,
    approved: submissions.filter(s => s.status === "approved").length,
    flagged: submissions.filter(s => s.status === "flagged").length,
    rejected: submissions.filter(s => s.status === "rejected").length
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-accent" />
            <h1 className="text-2xl font-bold text-accent">SAI Official Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Welcome, {officialData.name}</span>
            <Link to="/official/reports">
              <Button variant="outline">Reports</Button>
            </Link>
            <Link to="/official/profile">
              <Button variant="outline">Profile</Button>
            </Link>
            <Button variant="outline" onClick={() => {
              localStorage.removeItem("officialSession");
              window.location.href = "/";
            }}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold text-warning">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-success">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Flagged</p>
                  <p className="text-2xl font-bold text-destructive">{stats.flagged}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="submissions" className="space-y-6">
            {/* Filters */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="mr-2 h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Select value={filterDistrict} onValueChange={setFilterDistrict}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by District" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Districts</SelectItem>
                        <SelectItem value="Mumbai">Mumbai</SelectItem>
                        <SelectItem value="Delhi">Delhi</SelectItem>
                        <SelectItem value="Pune">Pune</SelectItem>
                        <SelectItem value="Bangalore">Bangalore</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Select value={filterTest} onValueChange={setFilterTest}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by Test Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tests</SelectItem>
                        <SelectItem value="Vertical Jump">Vertical Jump</SelectItem>
                        <SelectItem value="Sit-ups">Sit-ups</SelectItem>
                        <SelectItem value="Shuttle Run">Shuttle Run</SelectItem>
                        <SelectItem value="Endurance Run">Endurance Run</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submissions List */}
            <div className="space-y-4">
              {filteredSubmissions.map((submission) => {
                const StatusIcon = getStatusIcon(submission.status);
                return (
                  <Card key={submission.id} className="shadow-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{submission.athleteName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {submission.age} years • {submission.gender} • {submission.district}
                            </p>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(submission.status) as any}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {submission.status}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Test Type</p>
                          <p className="font-medium">{submission.testType}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Result</p>
                          <p className="font-medium">{submission.result} cm</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Percentile</p>
                          <p className="font-medium text-primary">{submission.percentile}th</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Submitted</p>
                          <p className="font-medium">{new Date(submission.submittedAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {submission.flags.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-destructive mb-2">Flags:</p>
                          <div className="flex flex-wrap gap-2">
                            {submission.flags.map((flag, index) => (
                              <Badge key={index} variant="destructive" className="text-xs">
                                {flag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Link to={`/official/review/${submission.id}`}>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="mr-2 h-4 w-4" />
                            Review Video
                          </Button>
                        </Link>
                        <Button size="sm" className="flex-1 bg-gradient-success">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive" className="flex-1">
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    District Participation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["Mumbai", "Delhi", "Pune", "Bangalore"].map((district) => {
                      const count = submissions.filter(s => s.district === district).length;
                      const percentage = (count / submissions.length) * 100;
                      return (
                        <div key={district} className="flex items-center justify-between">
                          <span className="font-medium">{district}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Performance Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">38.5 cm</div>
                      <p className="text-sm text-muted-foreground">Average Jump Height</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-xl font-bold text-success">42 cm</div>
                        <p className="text-xs text-muted-foreground">Top Performance</p>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-warning">38 cm</div>
                        <p className="text-xs text-muted-foreground">Median</p>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-muted-foreground">35 cm</div>
                        <p className="text-xs text-muted-foreground">Minimum</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="mr-2 h-5 w-5" />
                  Export Reports
                </CardTitle>
                <CardDescription>
                  Generate and download performance reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Button className="h-20 flex-col">
                    <Download className="h-6 w-6 mb-2" />
                    <span>Athlete Performance Report</span>
                    <span className="text-xs text-muted-foreground">CSV Format</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <MapPin className="h-6 w-6 mb-2" />
                    <span>District Analysis Report</span>
                    <span className="text-xs text-muted-foreground">PDF Format</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OfficialDashboard;