import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { 
  BarChart3, 
  Download,
  Filter,
  MapPin,
  Users,
  TrendingUp,
  Target,
  Award,
  Calendar,
  FileText,
  Shield
} from "lucide-react";
import { mockSubmissions, statesAndDistricts, fitnessTests } from "@/data/mockData";

const OfficialReports = () => {
  const [officialData, setOfficialData] = useState<any>(null);
  const [filterState, setFilterState] = useState("all");
  const [filterTest, setFilterTest] = useState("all");
  const [filterGender, setFilterGender] = useState("all");

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
            <p className="text-muted-foreground mb-4">Please login as an official to access reports.</p>
            <Link to="/official/login">
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mock data for reports
  const districtData = [
    { district: "Mumbai", participants: 145, averageScore: 78 },
    { district: "Delhi", participants: 132, averageScore: 82 },
    { district: "Bangalore", participants: 98, averageScore: 75 },
    { district: "Pune", participants: 87, averageScore: 80 },
    { district: "Chennai", participants: 76, averageScore: 77 },
    { district: "Hyderabad", participants: 65, averageScore: 79 }
  ];

  const testPerformanceData = fitnessTests.map(test => ({
    testName: test.name.split(' ')[0],
    participants: Math.floor(Math.random() * 200) + 50,
    averagePercentile: Math.floor(Math.random() * 30) + 60
  }));

  const genderDistribution = [
    { name: "Male", value: 58, color: "hsl(var(--primary))" },
    { name: "Female", value: 42, color: "hsl(var(--accent))" }
  ];

  const monthlyTrends = [
    { month: "Oct", submissions: 45 },
    { month: "Nov", submissions: 67 },
    { month: "Dec", submissions: 89 },
    { month: "Jan", submissions: 125 }
  ];

  const topPerformers = [
    { name: "Priya Sharma", district: "Gurugram", score: 92, rank: 1 },
    { name: "Rahul Kumar", district: "Ludhiana", score: 89, rank: 2 },
    { name: "Anita Singh", district: "Mumbai", score: 87, rank: 3 },
    { name: "Arjun Patel", district: "Bangalore", score: 85, rank: 4 },
    { name: "Meera Shah", district: "Delhi", score: 83, rank: 5 }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-accent" />
            <h1 className="text-2xl font-bold text-accent">Reports & Analytics</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/official/dashboard">
              <Button variant="outline">Dashboard</Button>
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
        {/* Filters */}
        <Card className="mb-8 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Select value={filterState} onValueChange={setFilterState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {Object.keys(statesAndDistricts).map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filterTest} onValueChange={setFilterTest}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Test" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tests</SelectItem>
                    {fitnessTests.map(test => (
                      <SelectItem key={test.id} value={test.id}>{test.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filterGender} onValueChange={setFilterGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="bg-gradient-success">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Athletes</p>
                  <p className="text-2xl font-bold text-primary">1,247</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tests</p>
                  <p className="text-2xl font-bold text-accent">3,891</p>
                </div>
                <Target className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Performance</p>
                  <p className="text-2xl font-bold text-success">78.5</p>
                </div>
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Districts</p>
                  <p className="text-2xl font-bold text-warning">28</p>
                </div>
                <MapPin className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>District Participation</CardTitle>
              <CardDescription>Number of participants by district</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={districtData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="district" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="participants" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Gender Distribution</CardTitle>
              <CardDescription>Male vs Female participation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {genderDistribution.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Test Performance Overview</CardTitle>
              <CardDescription>Average percentiles by test type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={testPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="testName" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="averagePercentile" fill="hsl(var(--accent))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Monthly Submission Trends</CardTitle>
              <CardDescription>Test submissions over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="submissions" 
                      stroke="hsl(var(--success))" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--success))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performers Table */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5" />
              Top Performers
            </CardTitle>
            <CardDescription>
              Athletes with highest overall scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Overall Score</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPerformers.map((performer) => (
                  <TableRow key={performer.rank}>
                    <TableCell>
                      <Badge variant={performer.rank <= 3 ? "default" : "secondary"}>
                        #{performer.rank}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{performer.name}</TableCell>
                    <TableCell>{performer.district}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="font-bold text-primary mr-2">{performer.score}</span>
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${performer.score}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">Verified</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Export Options */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Card className="shadow-card cursor-pointer hover:shadow-glow transition-all duration-300">
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Detailed Analytics Report</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comprehensive report with all metrics and charts
              </p>
              <Button className="w-full">Download PDF</Button>
            </CardContent>
          </Card>

          <Card className="shadow-card cursor-pointer hover:shadow-glow transition-all duration-300">
            <CardContent className="p-6 text-center">
              <Download className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Raw Data Export</h3>
              <p className="text-sm text-muted-foreground mb-4">
                CSV file with all submission data
              </p>
              <Button variant="outline" className="w-full">Download CSV</Button>
            </CardContent>
          </Card>

          <Card className="shadow-card cursor-pointer hover:shadow-glow transition-all duration-300">
            <CardContent className="p-6 text-center">
              <Calendar className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Monthly Summary</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Month-wise performance summary
              </p>
              <Button variant="outline" className="w-full">Generate Report</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OfficialReports;