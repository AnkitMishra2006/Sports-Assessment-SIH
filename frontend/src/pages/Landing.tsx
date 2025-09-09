import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Activity, Award, Users, BarChart3, Play, Star, CheckCircle, TrendingUp, Medal, Camera } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">SAI Talent Assessment</h1>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline" asChild>
              <Link to="/athlete/login">Athlete Login</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/official/login">Official Login</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-success/5 -z-10" />
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-center mb-6">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
              <Star className="w-4 h-4 mr-2 text-accent" />
              Trusted by 10,000+ Athletes Nationwide
            </Badge>
          </div>
          <h1 className="text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent leading-tight">
            Discover Your Athletic Potential
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Advanced AI-powered sports talent assessment platform by Sports Authority of India. 
            Take standardized fitness tests with video guidance and get instant feedback on your athletic performance.
          </p>
          
          {/* Achievement Highlights */}
          <div className="flex justify-center items-center space-x-8 mb-8 text-sm text-muted-foreground">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-success" />
              Video-guided tests
            </div>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-accent" />
              Instant analytics
            </div>
            <div className="flex items-center">
              <Medal className="w-4 h-4 mr-2 text-primary" />
              Official recognition
            </div>
          </div>

          <div className="flex justify-center space-x-4 mb-12">
            <Button size="lg" className="bg-gradient-hero hover:shadow-glow text-lg px-8 py-3" asChild>
              <Link to="/athlete/register">
                <Trophy className="mr-2 h-5 w-5" />
                Start Your Assessment
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">5</div>
              <div className="text-sm text-muted-foreground">Fitness Tests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">95%</div>
              <div className="text-sm text-muted-foreground">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">500+</div>
              <div className="text-sm text-muted-foreground">Talents Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Complete Assessment Process
          </Badge>
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple, accurate, and comprehensive sports talent assessment with video guidance and real-time feedback
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="shadow-card hover:shadow-glow transition-all duration-300 relative group">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Camera className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-xl">Record Your Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center leading-relaxed">
                Follow video instructions to perform 5 standardized fitness tests including vertical jump, 
                sit-ups, shuttle run, and endurance tests with precise AI-powered analysis.
              </CardDescription>
              <div className="mt-4 flex justify-center">
                <Badge variant="secondary" className="text-xs">
                  5 Tests Available
                </Badge>
              </div>
            </CardContent>
            <div className="absolute top-4 right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
              1
            </div>
          </Card>

          <Card className="shadow-card hover:shadow-glow transition-all duration-300 relative group">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-xl">Get Instant Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center leading-relaxed">
                Receive immediate performance metrics, percentile rankings, progress tracking,
                and personalized recommendations to improve your athletic abilities.
              </CardDescription>
              <div className="mt-4 flex justify-center">
                <Badge variant="secondary" className="text-xs">
                  Real-time Results
                </Badge>
              </div>
            </CardContent>
            <div className="absolute top-4 right-4 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold">
              2
            </div>
          </Card>

          <Card className="shadow-card hover:shadow-glow transition-all duration-300 relative group">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-gradient-success rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Award className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-xl">Get Discovered</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center leading-relaxed">
                Outstanding performers are reviewed by SAI officials for potential 
                inclusion in national sports development programs and talent identification.
              </CardDescription>
              <div className="mt-4 flex justify-center">
                <Badge variant="secondary" className="text-xs">
                  Official Recognition
                </Badge>
              </div>
            </CardContent>
            <div className="absolute top-4 right-4 w-8 h-8 bg-success rounded-full flex items-center justify-center text-white font-bold">
              3
            </div>
          </Card>
        </div>

        {/* Test Categories */}
        <div className="bg-muted/30 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Available Fitness Tests</h3>
            <p className="text-muted-foreground">Comprehensive assessment covering all aspects of athletic performance</p>
          </div>
          <div className="grid md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-card rounded-lg shadow-sm">
              <Activity className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="font-medium text-sm">Vertical Jump</div>
              <div className="text-xs text-muted-foreground">Explosive Power</div>
            </div>
            <div className="text-center p-4 bg-card rounded-lg shadow-sm">
              <Target className="w-8 h-8 mx-auto mb-2 text-accent" />
              <div className="font-medium text-sm">Sit-ups Test</div>
              <div className="text-xs text-muted-foreground">Core Strength</div>
            </div>
            <div className="text-center p-4 bg-card rounded-lg shadow-sm">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-success" />
              <div className="font-medium text-sm">Shuttle Run</div>
              <div className="text-xs text-muted-foreground">Agility & Speed</div>
            </div>
            <div className="text-center p-4 bg-card rounded-lg shadow-sm">
              <Medal className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="font-medium text-sm">Endurance Run</div>
              <div className="text-xs text-muted-foreground">Cardiovascular</div>
            </div>
            <div className="text-center p-4 bg-card rounded-lg shadow-sm">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-accent" />
              <div className="font-medium text-sm">Height & Weight</div>
              <div className="text-xs text-muted-foreground">Anthropometric</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-success/10 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              Platform Statistics
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Proven Track Record</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of athletes who have discovered their potential through our comprehensive assessment platform
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="bg-card p-6 rounded-lg shadow-card">
              <div className="flex justify-center mb-4">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-4xl font-bold text-primary mb-2">10,247</h3>
              <p className="text-muted-foreground font-medium">Athletes Assessed</p>
              <p className="text-xs text-muted-foreground mt-1">Across all states</p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-card">
              <div className="flex justify-center mb-4">
                <BarChart3 className="h-12 w-12 text-accent" />
              </div>
              <h3 className="text-4xl font-bold text-accent mb-2">95.2%</h3>
              <p className="text-muted-foreground font-medium">Accuracy Rate</p>
              <p className="text-xs text-muted-foreground mt-1">AI-powered analysis</p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-card">
              <div className="flex justify-center mb-4">
                <Award className="h-12 w-12 text-success" />
              </div>
              <h3 className="text-4xl font-bold text-success mb-2">532</h3>
              <p className="text-muted-foreground font-medium">Talents Discovered</p>
              <p className="text-xs text-muted-foreground mt-1">Selected for programs</p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-card">
              <div className="flex justify-center mb-4">
                <Trophy className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-4xl font-bold text-primary mb-2">28</h3>
              <p className="text-muted-foreground font-medium">States Covered</p>
              <p className="text-xs text-muted-foreground mt-1">Pan-India presence</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 Sports Authority of India. All rights reserved.</p>
          <p className="mt-2">Empowering athletes through technology and innovation.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;