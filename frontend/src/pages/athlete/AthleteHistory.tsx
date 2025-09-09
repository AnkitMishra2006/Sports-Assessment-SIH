import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { 
  Trophy, 
  TrendingUp,
  Calendar,
  Download,
  Filter,
  Award,
  Activity,
  Target,
  BarChart3,
  History,
  CheckCircle,
  AlertTriangle,
  Clock
} from "lucide-react";
import { mockTestHistory, fitnessTests } from "@/data/mockData";

interface TestHistoryEntry {
  testId: string;
  date: string;
  result: number;
  percentile: number;
  status: "verified" | "pending" | "flagged";
}

const AthleteHistory = () => {
  const [athleteData, setAthleteData] = useState<any>(null);
  const [selectedTest, setSelectedTest] = useState("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState("3months");

  useEffect(() => {
    const data = localStorage.getItem("athleteData");
    if (data) {
      setAthleteData(JSON.parse(data));
    }
  }, []);

  if (!athleteData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md shadow-card">
          <CardContent className="text-center py-8">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Data Found</h2>
            <p className="text-muted-foreground mb-4">Please login to access your history.</p>
            <Link to="/athlete/login">
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mock history data - in a real app this would come from API
  const testHistory: TestHistoryEntry[] = (mockTestHistory[0]?.history || []).map(entry => ({
    ...entry,
    status: entry.status as "verified" | "pending" | "flagged"
  }));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified": return CheckCircle;
      case "flagged": return AlertTriangle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "success";
      case "flagged": return "warning";
      default: return "secondary";
    }
  };

  const filteredHistory = testHistory.filter(entry => {
    if (selectedTest !== "all" && entry.testId !== selectedTest) return false;
    
    const entryDate = new Date(entry.date);
    const now = new Date();
    const timeframeDays = selectedTimeframe === "1month" ? 30 : 
                         selectedTimeframe === "3months" ? 90 : 
                         selectedTimeframe === "6months" ? 180 : 365;
    
    const cutoffDate = new Date(now.getTime() - (timeframeDays * 24 * 60 * 60 * 1000));
    return entryDate >= cutoffDate;
  });

  // Prepare chart data
  const chartData = filteredHistory
    .filter(entry => selectedTest === "all" || entry.testId === selectedTest)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      percentile: entry.percentile,
      result: entry.result,
      testName: fitnessTests.find(t => t.id === entry.testId)?.name || entry.testId
    }));

  // Performance summary
  const performanceSummary = fitnessTests.map(test => {
    const testEntries = filteredHistory.filter(entry => entry.testId === test.id);
    if (testEntries.length === 0) return null;

    const latest = testEntries[testEntries.length - 1];
    const previous = testEntries.length > 1 ? testEntries[testEntries.length - 2] : null;
    const improvement = previous ? latest.percentile - previous.percentile : 0;

    return {
      testName: test.name,
      latest: latest.result,
      percentile: latest.percentile,
      improvement,
      attempts: testEntries.length
    };
  }).filter(Boolean);

  const badges = ["Top Performer", "Speed Demon", "Endurance Warrior", "Balance Master", "Strength Champion"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <History className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Performance History</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/athlete/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Link to="/athlete/profile">
              <Button variant="outline">Profile</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-8 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Select value={selectedTest} onValueChange={setSelectedTest}>
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
                <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1month">Last Month</SelectItem>
                    <SelectItem value="3months">Last 3 Months</SelectItem>
                    <SelectItem value="6months">Last 6 Months</SelectItem>
                    <SelectItem value="1year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" className="flex items-center">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Performance Summary Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {performanceSummary.map((summary, index) => (
                <Card key={index} className="shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Activity className="h-5 w-5 text-primary" />
                      <Badge variant={summary.improvement > 0 ? "default" : "secondary"}>
                        {summary.improvement > 0 ? '+' : ''}{summary.improvement}%
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{summary.testName}</h3>
                    <p className="text-2xl font-bold text-primary mb-1">{summary.latest}</p>
                    <p className="text-sm text-muted-foreground">
                      {summary.percentile}th percentile • {summary.attempts} attempts
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="shadow-card">
                <CardContent className="p-6 text-center">
                  <Target className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">{testHistory.length}</div>
                  <p className="text-sm text-muted-foreground">Total Attempts</p>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
                  <div className="text-2xl font-bold text-success">
                    {Math.round(testHistory.reduce((acc, entry) => acc + entry.percentile, 0) / testHistory.length)}
                  </div>
                  <p className="text-sm text-muted-foreground">Avg Percentile</p>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardContent className="p-6 text-center">
                  <Award className="h-8 w-8 text-accent mx-auto mb-2" />
                  <div className="text-2xl font-bold text-accent">{badges.length}</div>
                  <p className="text-sm text-muted-foreground">Badges Earned</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Performance Trends
                </CardTitle>
                <CardDescription>
                  Track your progress over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [value, name === "percentile" ? "Percentile" : "Result"]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="percentile" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Test History
                </CardTitle>
                <CardDescription>
                  Detailed history of all your test attempts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Percentile</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.map((entry, index) => {
                      const test = fitnessTests.find(t => t.id === entry.testId);
                      const StatusIcon = getStatusIcon(entry.status);
                      
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{test?.name || entry.testId}</TableCell>
                          <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                          <TableCell>{entry.result}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{entry.percentile}th</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(entry.status) as any}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {entry.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="badges" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5" />
                  Achievement Badges
                </CardTitle>
                <CardDescription>
                  Badges earned through your outstanding performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {badges.map((badge, index) => (
                    <Card key={index} className="shadow-card hover:shadow-glow transition-all duration-300">
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-4">
                          <Award className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="font-semibold mb-2">{badge}</h3>
                        <p className="text-sm text-muted-foreground">
                          Earned on {new Date().toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AthleteHistory;