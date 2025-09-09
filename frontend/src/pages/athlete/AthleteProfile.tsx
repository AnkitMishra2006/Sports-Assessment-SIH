import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Trophy, 
  User, 
  Calendar, 
  MapPin, 
  Award, 
  TrendingUp, 
  Target,
  Activity,
  Medal,
  Star,
  BarChart3,
  Clock,
  CheckCircle,
  ArrowLeft,
  Edit,
  Download
} from "lucide-react";
import { fitnessTests, calculateOverallScore, getPercentileRank } from "@/data/mockData";

const AthleteProfile = () => {
  const [athleteData, setAthleteData] = useState<any>(null);
  const [testHistory, setTestHistory] = useState<any[]>([]);

  useEffect(() => {
    // Load athlete data from localStorage
    const storedData = localStorage.getItem("athleteData");
    if (storedData) {
      const data = JSON.parse(storedData);
      setAthleteData(data);
      
      // Load test history from localStorage
      const historyKey = `testHistory_${data.id}`;
      const history = localStorage.getItem(historyKey);
      if (history) {
        setTestHistory(JSON.parse(history));
      }
    }
  }, []);

  if (!athleteData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4">No athlete profile found</p>
            <Button asChild>
              <Link to="/athlete/register">Register Now</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getTestStatus = (testId: string) => {
    const testData = athleteData.testProgress?.[testId];
    if (!testData) return "pending";
    return testData.status || "pending";
  };

  const getTestScore = (testId: string) => {
    const history = testHistory.filter(h => h.testId === testId);
    if (history.length === 0) return null;
    return history.reduce((best, current) => 
      current.percentile > best.percentile ? current : best
    );
  };

  const completedTests = fitnessTests.filter(test => getTestStatus(test.id) === "completed").length;
  const totalTests = fitnessTests.length;
  const progressPercentage = (completedTests / totalTests) * 100;

  const overallScore = calculateOverallScore(
    fitnessTests.reduce((acc, test) => {
      const score = getTestScore(test.id);
      if (score) {
        acc[test.id] = { percentile: score.percentile };
      }
      return acc;
    }, {} as Record<string, any>)
  );

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getBadges = () => {
    const badges = [];
    if (overallScore >= 90) badges.push({ name: "Elite Performer", color: "bg-gradient-hero", icon: Trophy });
    if (overallScore >= 80) badges.push({ name: "Top Athlete", color: "bg-gradient-accent", icon: Award });
    if (completedTests === totalTests) badges.push({ name: "Test Completion", color: "bg-gradient-success", icon: CheckCircle });
    if (testHistory.length >= 10) badges.push({ name: "Dedicated Trainee", color: "bg-gradient-hero", icon: Star });
    return badges;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/athlete/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Athlete Profile</h1>
              <p className="text-muted-foreground">Complete performance overview</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Info */}
            <Card className="shadow-card">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-2xl bg-gradient-hero text-white">
                      {athleteData.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-bold mb-2">{athleteData.name}</h2>
                  <p className="text-muted-foreground mb-4">{athleteData.email}</p>
                  
                  <div className="space-y-2 w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        Age
                      </div>
                      <span className="font-medium">{calculateAge(athleteData.dateOfBirth)} years</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="w-4 h-4 mr-2" />
                        Gender
                      </div>
                      <span className="font-medium capitalize">{athleteData.gender}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        Location
                      </div>
                      <span className="font-medium">{athleteData.district}, {athleteData.state}</span>
                    </div>
                    {athleteData.sport && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Trophy className="w-4 h-4 mr-2" />
                          Sport
                        </div>
                        <span className="font-medium">{athleteData.sport}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overall Performance */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Overall Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-primary mb-2">{overallScore}</div>
                  <div className="text-sm text-muted-foreground">Overall Score</div>
                </div>
                <Progress value={overallScore} className="mb-4" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {completedTests} of {totalTests} tests completed
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getBadges().map((badge, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${badge.color} rounded-full flex items-center justify-center`}>
                        <badge.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium">{badge.name}</div>
                        <div className="text-xs text-muted-foreground">Achievement unlocked</div>
                      </div>
                    </div>
                  ))}
                  {getBadges().length === 0 && (
                    <p className="text-muted-foreground text-sm">Complete tests to earn badges</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="tests" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tests">Fitness Tests</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="history">Test History</TabsTrigger>
              </TabsList>

              <TabsContent value="tests" className="space-y-6">
                <div className="grid gap-4">
                  {fitnessTests.map((test) => {
                    const status = getTestStatus(test.id);
                    const bestScore = getTestScore(test.id);
                    
                    return (
                      <Card key={test.id} className="shadow-card">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="flex items-center">
                                <Activity className="w-5 h-5 mr-2" />
                                {test.name}
                              </CardTitle>
                              <CardDescription>{test.description}</CardDescription>
                            </div>
                            <Badge variant={status === "completed" ? "default" : "secondary"}>
                              {status === "completed" ? "Completed" : "Pending"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {bestScore ? (
                            <div className="grid md:grid-cols-3 gap-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-primary">{bestScore.best}</div>
                                <div className="text-sm text-muted-foreground">Best Performance</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-accent">{bestScore.percentile}%</div>
                                <div className="text-sm text-muted-foreground">Percentile Rank</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-success">{bestScore.attempts}</div>
                                <div className="text-sm text-muted-foreground">Attempts</div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-muted-foreground mb-4">No test data available</p>
                              <Button asChild>
                                <Link to={`/athlete/test/${test.id}`}>
                                  Take Test
                                </Link>
                              </Button>
                            </div>
                          )}
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
                      <CardTitle>Performance Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {fitnessTests.map((test) => {
                          const bestScore = getTestScore(test.id);
                          return (
                            <div key={test.id} className="flex items-center justify-between">
                              <span className="text-sm">{test.name}</span>
                              <div className="flex items-center space-x-2">
                                <Progress 
                                  value={bestScore?.percentile || 0} 
                                  className="w-20" 
                                />
                                <span className="text-sm font-medium w-12 text-right">
                                  {bestScore?.percentile || 0}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle>Strengths & Areas for Improvement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-success mb-2">Strengths</h4>
                          <div className="space-y-1">
                            {fitnessTests
                              .filter(test => {
                                const score = getTestScore(test.id);
                                return score && score.percentile >= 80;
                              })
                              .map(test => (
                                <div key={test.id} className="text-sm text-muted-foreground">
                                  • {test.name}
                                </div>
                              ))}
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h4 className="font-medium text-warning mb-2">Areas for Improvement</h4>
                          <div className="space-y-1">
                            {fitnessTests
                              .filter(test => {
                                const score = getTestScore(test.id);
                                return score && score.percentile < 60;
                              })
                              .map(test => (
                                <div key={test.id} className="text-sm text-muted-foreground">
                                  • {test.name}
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>Test History</CardTitle>
                    <CardDescription>
                      Complete record of all your test attempts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {testHistory.length > 0 ? (
                      <div className="space-y-4">
                        {testHistory
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((test, index) => {
                            const testInfo = fitnessTests.find(t => t.id === test.testId);
                            return (
                              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center space-x-4">
                                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    <Activity className="w-5 h-5 text-primary" />
                                  </div>
                                  <div>
                                    <div className="font-medium">{testInfo?.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {new Date(test.date).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">{test.best}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {test.percentile}th percentile
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No test history available</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Complete fitness tests to see your progress here
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AthleteProfile;