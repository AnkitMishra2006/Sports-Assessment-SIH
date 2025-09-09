import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Camera, 
  Play, 
  Square,
  ArrowLeft,
  CheckCircle,
  Trophy,
  Target,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const VerticalJumpTest = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [results, setResults] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const steps = [
    "Instructions",
    "Camera Setup", 
    "Recording",
    "Results"
  ];

  useEffect(() => {
    if (currentStep === 1) {
      startCamera();
    }
  }, [currentStep]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 },
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const startCountdown = () => {
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startRecording = () => {
    setIsRecording(true);
    toast({
      title: "Recording Started",
      description: "Perform your vertical jumps now!",
    });

    // Simulate 10-second recording
    setTimeout(() => {
      setIsRecording(false);
      generateResults();
    }, 10000);
  };

  const generateResults = () => {
    // Mock AI analysis results
    const mockResults = {
      jumpHeight: Math.floor(Math.random() * 20) + 25, // 25-45 cm
      attempts: 3,
      bestJump: Math.floor(Math.random() * 20) + 30,
      averageJump: Math.floor(Math.random() * 15) + 22,
      percentile: Math.floor(Math.random() * 40) + 60, // 60-100%
      feedback: [
        "Great explosive power in takeoff phase",
        "Good arm coordination during jump",
        "Consider improving landing technique"
      ],
      badge: Math.random() > 0.5 ? "Jump Master" : null
    };

    setResults(mockResults);
    setCurrentStep(3);

    toast({
      title: "Analysis Complete!",
      description: "Your vertical jump has been analyzed successfully.",
    });
  };

  const submitResults = () => {
    // Save results to localStorage
    const athleteData = JSON.parse(localStorage.getItem("athleteData") || "{}");
    athleteData.testProgress.verticalJump = {
      status: "completed",
      completedAt: new Date().toISOString(),
      results: results
    };

    if (results.badge && !athleteData.badges.includes(results.badge)) {
      athleteData.badges.push(results.badge);
    }

    localStorage.setItem("athleteData", JSON.stringify(athleteData));

    toast({
      title: "Results Submitted!",
      description: "Your test has been submitted to SAI for review.",
    });

    navigate("/athlete/dashboard");
  };

  const renderInstructions = () => (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="mr-2 h-5 w-5" />
          Vertical Jump Test Instructions
        </CardTitle>
        <CardDescription>
          Follow these steps to perform an accurate vertical jump assessment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3 flex items-center">
              <Target className="mr-2 h-4 w-4 text-primary" />
              Setup Requirements
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Stand 2-3 feet away from camera</li>
              <li>• Position yourself side-on to the camera</li>
              <li>• Ensure good lighting in the room</li>
              <li>• Clear space above and around you</li>
              <li>• Remove any obstacles from the area</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3 flex items-center">
              <Zap className="mr-2 h-4 w-4 text-accent" />
              Test Procedure
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• You will perform 3 vertical jumps</li>
              <li>• Jump as high as possible each time</li>
              <li>• Land softly on both feet</li>
              <li>• Allow 2-3 seconds between jumps</li>
              <li>• AI will analyze your best attempt</li>
            </ul>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Tips for Best Performance:</h4>
          <p className="text-sm text-muted-foreground">
            Use your arms to generate momentum, bend your knees deeply before takeoff, 
            and focus on exploding upward with maximum force. Keep your body straight during the jump.
          </p>
        </div>

        <Button onClick={() => setCurrentStep(1)} className="w-full bg-gradient-hero">
          <Camera className="mr-2 h-4 w-4" />
          Start Camera Setup
        </Button>
      </CardContent>
    </Card>
  );

  const renderCameraSetup = () => (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Camera Setup</CardTitle>
        <CardDescription>
          Position yourself correctly and check your camera view
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Overlay guides */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-primary border-dashed w-32 h-48 rounded-lg">
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-primary bg-background px-2 py-1 rounded">
                Stand Here
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={() => setCurrentStep(0)} variant="outline" className="flex-1">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Instructions
          </Button>
          <Button onClick={() => setCurrentStep(2)} className="flex-1 bg-gradient-hero">
            <Play className="mr-2 h-4 w-4" />
            I'm Ready to Start
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderRecording = () => (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Recording in Progress</CardTitle>
        <CardDescription>
          {countdown > 0 ? `Get ready! Starting in ${countdown}...` : 
           isRecording ? "Perform your vertical jumps now!" : "Analyzing your performance..."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Recording indicator */}
          {isRecording && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
              ● REC
            </div>
          )}
          
          {/* Countdown overlay */}
          {countdown > 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-6xl font-bold text-white animate-pulse">
                {countdown}
              </div>
            </div>
          )}
        </div>

        {!isRecording && countdown === 0 && (
          <div className="text-center">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-primary rounded-full mb-4"></div>
            <p className="text-muted-foreground">Analyzing your vertical jump performance...</p>
          </div>
        )}

        {countdown === 0 && !isRecording && !results && (
          <Button onClick={startCountdown} className="w-full bg-gradient-hero" disabled={isRecording}>
            <Play className="mr-2 h-4 w-4" />
            Start Recording
          </Button>
        )}
      </CardContent>
    </Card>
  );

  const renderResults = () => (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-accent" />
            Your Vertical Jump Results
          </CardTitle>
          <CardDescription>
            AI-powered analysis of your jumping performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{results.bestJump} cm</div>
              <p className="text-sm text-muted-foreground">Best Jump</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">{results.averageJump} cm</div>
              <p className="text-sm text-muted-foreground">Average</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success mb-2">{results.percentile}th</div>
              <p className="text-sm text-muted-foreground">Percentile</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Performance Ranking</span>
              <span className="text-sm text-muted-foreground">Top {100 - results.percentile}%</span>
            </div>
            <Progress value={results.percentile} className="h-3" />
          </div>

          {results.badge && (
            <div className="text-center mb-6">
              <Badge className="bg-gradient-accent text-lg py-2 px-4">
                <Trophy className="mr-2 h-5 w-5" />
                {results.badge} Unlocked!
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Performance Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {results.feedback.map((item: string, index: number) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-success mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => setCurrentStep(2)} variant="outline" className="flex-1">
          Retake Test
        </Button>
        <Button onClick={submitResults} className="flex-1 bg-gradient-success">
          <Trophy className="mr-2 h-4 w-4" />
          Submit to SAI
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/athlete/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Vertical Jump Test</h1>
          </div>
          <Badge variant="outline">Step {currentStep + 1} of {steps.length}</Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
                <span className={`ml-2 text-sm ${
                  index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / (steps.length - 1)) * 100} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 0 && renderInstructions()}
          {currentStep === 1 && renderCameraSetup()}
          {currentStep === 2 && renderRecording()}
          {currentStep === 3 && renderResults()}
        </div>
      </div>
    </div>
  );
};

export default VerticalJumpTest;