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
  Download,
  Weight,
  Ruler
} from "lucide-react";
import { athleteAPI } from "@/services/api";

// Backend athlete data interface
interface AthleteData {
  _id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: "male" | "female" | "other";
  };
  physicalAttributes: {
    height: number;
    weight: number;
    dominantHand: "left" | "right" | "ambidextrous";
    fitnessLevel: "beginner" | "intermediate" | "advanced";
  };
  medicalHistory: {
    previousInjuries?: string[];
    currentMedications?: string[];
    allergies?: string[];
    chronicConditions?: string[];
    fitnessRestrictions?: string[];
    lastPhysicalExam?: string;
  };
  performanceData: {
    overallFitnessScore: number;
    testHistory: Array<{
      testId: string;
      date: string;
      score: number;
      percentile: number;
    }>;
    progressTracking: {
      monthlyScores: number[];
      improvementAreas: string[];
      strengths: string[];
    };
  };
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

const AthleteProfile = () => {
  const [athleteData, setAthleteData] = useState<AthleteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAthleteData = async () => {
      try {
        setIsLoading(true);
        const response = await athleteAPI.getProfile();
        setAthleteData(response.athlete);
      } catch (err) {
        console.error("Failed to fetch athlete data:", err);
        setError("Failed to load profile data");
        
        // Fallback to localStorage for development
        const storedData = localStorage.getItem("athleteData");
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          // Convert legacy format to backend format
          const mockAthleteData: AthleteData = {
            _id: parsedData.id || "mock-id",
            personalInfo: {
              firstName: parsedData.name?.split(' ')[0] || parsedData.firstName || "John",
              lastName: parsedData.name?.split(' ')[1] || parsedData.lastName || "Doe", 
              email: parsedData.email || "athlete@example.com",
              phone: parsedData.phone || "+1234567890",
              dateOfBirth: parsedData.dateOfBirth || "1990-01-01",
              gender: parsedData.gender || "male"
            },
            physicalAttributes: {
              height: parsedData.height || 175,
              weight: parsedData.weight || 70,
              dominantHand: "right",
              fitnessLevel: parsedData.fitnessLevel || "intermediate"
            },
            medicalHistory: {
              previousInjuries: [],
              currentMedications: [],
              allergies: [],
              chronicConditions: [],
              fitnessRestrictions: []
            },
            performanceData: {
              overallFitnessScore: parsedData.overallScore || 75,
              testHistory: parsedData.testHistory || [],
              progressTracking: {
                monthlyScores: [60, 65, 70, 75],
                improvementAreas: ["Flexibility", "Endurance"],
                strengths: ["Strength", "Coordination"]
              }
            },
            profileImage: parsedData.profileImage,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setAthleteData(mockAthleteData);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAthleteData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Loading profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !athleteData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4">
              {error || "No athlete profile found"}
            </p>
            <Button asChild>
              <Link to="/athlete/register">Register Now</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  const testHistory = athleteData.performanceData.testHistory;
  const overallScore = athleteData.performanceData.overallFitnessScore;
  const completedTests = testHistory.length;
  const totalTests = 5; // Assuming 5 total tests

  const getBadges = () => {
    const badges = [];
    if (overallScore >= 90) badges.push({ name: "Elite Performer", color: "bg-gradient-to-r from-yellow-400 to-orange-500", icon: Trophy });
    if (overallScore >= 80) badges.push({ name: "Top Athlete", color: "bg-gradient-to-r from-blue-400 to-purple-500", icon: Award });
    if (completedTests >= totalTests) badges.push({ name: "Test Completion", color: "bg-gradient-to-r from-green-400 to-blue-500", icon: CheckCircle });
    if (testHistory.length >= 10) badges.push({ name: "Dedicated Trainee", color: "bg-gradient-to-r from-purple-400 to-pink-500", icon: Star });
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
            <Card className="shadow-lg">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage src={athleteData.profileImage} />
                    <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      {athleteData.personalInfo.firstName[0]}{athleteData.personalInfo.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-bold mb-2">
                    {athleteData.personalInfo.firstName} {athleteData.personalInfo.lastName}
                  </h2>
                  <p className="text-muted-foreground mb-4">{athleteData.personalInfo.email}</p>
                  
                  <div className="space-y-3 w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        Age
                      </div>
                      <span className="font-medium">{calculateAge(athleteData.personalInfo.dateOfBirth)} years</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="w-4 h-4 mr-2" />
                        Gender
                      </div>
                      <span className="font-medium capitalize">{athleteData.personalInfo.gender}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Ruler className="w-4 h-4 mr-2" />
                        Height
                      </div>
                      <span className="font-medium">{athleteData.physicalAttributes.height} cm</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Weight className="w-4 h-4 mr-2" />
                        Weight
                      </div>
                      <span className="font-medium">{athleteData.physicalAttributes.weight} kg</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Target className="w-4 h-4 mr-2" />
                        Fitness Level
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {athleteData.physicalAttributes.fitnessLevel}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Medal className="w-5 h-5 mr-2" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getBadges().map((badge, index) => (
                    <div key={index} className={`flex items-center p-3 rounded-lg ${badge.color} text-white`}>
                      <badge.icon className="w-5 h-5 mr-3" />
                      <span className="font-medium">{badge.name}</span>
                    </div>
                  ))}
                  {getBadges().length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Complete tests to earn achievements!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Overall Score Card */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Overall Performance Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-6">
                      <div className="text-6xl font-bold text-primary mb-2">{overallScore}</div>
                      <div className="text-muted-foreground">out of 100</div>
                    </div>
                    <Progress value={overallScore} className="mb-4" />
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">{completedTests}</div>
                        <div className="text-sm text-muted-foreground">Tests Completed</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {testHistory.length > 0 
                            ? Math.round(testHistory.reduce((sum, test) => sum + test.percentile, 0) / testHistory.length)
                            : 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Avg Percentile</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Progress Tracking */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Progress Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center text-green-600">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Strengths
                        </h4>
                        <ul className="space-y-2">
                          {athleteData.performanceData.progressTracking.strengths.map((strength, index) => (
                            <li key={index} className="flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center text-orange-600">
                          <Target className="w-4 h-4 mr-2" />
                          Improvement Areas
                        </h4>
                        <ul className="space-y-2">
                          {athleteData.performanceData.progressTracking.improvementAreas.map((area, index) => (
                            <li key={index} className="flex items-center">
                              <div className="w-2 h-2 bg-orange-500 rounded-full mr-3" />
                              {area}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Performance Analytics</CardTitle>
                    <CardDescription>
                      Detailed analysis of your fitness performance across different metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center py-8 text-muted-foreground">
                        <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Performance analytics will be available after completing more tests.</p>
                        <Button asChild className="mt-4">
                          <Link to="/athlete/dashboard">Take a Test</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Test History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {testHistory.length > 0 ? (
                      <div className="space-y-4">
                        {testHistory.map((test, index) => (
                          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <div className="font-medium capitalize">
                                {test.testId.replace('-', ' ')} Test
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(test.date).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">{test.score}</div>
                              <div className="text-sm text-muted-foreground">
                                {test.percentile}th percentile
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No test history available yet.</p>
                        <Button asChild className="mt-4">
                          <Link to="/athlete/dashboard">Take Your First Test</Link>
                        </Button>
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
