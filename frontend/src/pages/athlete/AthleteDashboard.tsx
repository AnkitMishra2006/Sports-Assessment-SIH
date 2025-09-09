import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  User, 
  Activity, 
  TrendingUp,
  Target,
  Timer,
  Zap,
  Award,
  CheckCircle,
  Clock
} from "lucide-react";

interface AthleteData {
  name: string;
  email: string;
  district: string;
  dateOfBirth: string;
  gender: string;
  testProgress: {
    heightWeight: { status: string; completedAt: string | null };
    verticalJump: { status: string; completedAt: string | null };
    sitUps: { status: string; completedAt: string | null };
    shuttleRun: { status: string; completedAt: string | null };
    enduranceRun: { status: string; completedAt: string | null };
  };
  badges: string[];
}

const AthleteDashboard = () => {
  const [athleteData, setAthleteData] = useState<AthleteData | null>(null);

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
            <p className="text-muted-foreground mb-4">Please login or register to access your dashboard.</p>
            <Link to="/athlete/login">
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tests = [
    {
      id: "verticalJump",
      title: "Vertical Jump",
      description: "Explosive power assessment",
      icon: TrendingUp,
      status: athleteData.testProgress.verticalJump?.status || "pending",
      route: "/athlete/test/vertical-jump"
    },
    {
      id: "sitUps",
      title: "Sit-ups",
      description: "Core strength endurance test",
      icon: Activity,
      status: athleteData.testProgress.sitUps?.status || "pending",
      route: "/athlete/test/sit-ups"
    },
    {
      id: "shuttleRun",
      title: "Shuttle Run",
      description: "Agility and speed assessment",
      icon: Zap,
      status: athleteData.testProgress.shuttleRun?.status || "pending",
      route: "/athlete/test/shuttle-run"
    },
    {
      id: "enduranceRun",
      title: "Endurance Run",
      description: "Cardiovascular fitness test",
      icon: Timer,
      status: athleteData.testProgress.enduranceRun?.status || "pending",
      route: "/athlete/test/endurance-run"
    },
    {
      id: "pushUps",
      title: "Push-ups",
      description: "Upper body strength test",
      icon: Activity,
      status: athleteData.testProgress.pushUps?.status || "pending",
      route: "/athlete/test/push-ups"
    },
    {
      id: "flexibility",
      title: "Flexibility",
      description: "Sit and reach test",
      icon: User,
      status: athleteData.testProgress.flexibility?.status || "pending",
      route: "/athlete/test/flexibility"
    },
    {
      id: "balance",
      title: "Balance",
      description: "Single leg balance test",
      icon: Target,
      status: athleteData.testProgress.balance?.status || "pending",
      route: "/athlete/test/balance"
    },
    {
      id: "broadJump",
      title: "Broad Jump",
      description: "Standing broad jump test",
      icon: TrendingUp,
      status: athleteData.testProgress.broadJump?.status || "pending",
      route: "/athlete/test/broad-jump"
    }
  ];

  const completedTests = tests.filter(test => test.status === "completed").length;
  const progressPercentage = (completedTests / tests.length) * 100;

  const getAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">SAI Talent Assessment</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline">{athleteData.district}</Badge>
            <Link to="/athlete/history">
              <Button variant="outline">History</Button>
            </Link>
            <Link to="/athlete/profile">
              <Button variant="outline">Profile</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {athleteData.name}!</h1>
          <p className="text-muted-foreground">
            Age: {getAge(athleteData.dateOfBirth)} • {athleteData.gender} • {athleteData.district}
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5" />
              Test Progress
            </CardTitle>
            <CardDescription>
              Complete all fitness tests to get your comprehensive assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{completedTests}/{tests.length} tests completed</span>
            </div>
            <Progress value={progressPercentage} className="mb-4" />
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-primary">{Math.round(progressPercentage)}%</span>
              {progressPercentage === 100 && (
                <Badge className="bg-gradient-success">
                  <Award className="mr-1 h-4 w-4" />
                  All Tests Complete!
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {tests.map((test) => {
            const IconComponent = test.icon;
            const isCompleted = test.status === "completed";
            
            return (
              <Card key={test.id} className="shadow-card hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-gradient-success' : 'bg-gradient-hero'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6 text-white" />
                      ) : (
                        <IconComponent className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <Badge variant={isCompleted ? "default" : "secondary"}>
                      {isCompleted ? "Completed" : "Pending"}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{test.title}</CardTitle>
                  <CardDescription>{test.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    variant={isCompleted ? "outline" : "default"}
                    asChild
                  >
                    <Link to={test.route}>
                      {isCompleted ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          View Results
                        </>
                      ) : (
                        <>
                          <Clock className="mr-2 h-4 w-4" />
                          Start Test
                        </>
                      )}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Badges Section */}
        {athleteData.badges.length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5" />
                Your Badges
              </CardTitle>
              <CardDescription>
                Achievements earned through your performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {athleteData.badges.map((badge, index) => (
                  <Badge key={index} className="bg-gradient-accent">
                    {badge}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AthleteDashboard;