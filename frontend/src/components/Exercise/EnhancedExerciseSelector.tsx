import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Upload,
  Play,
  Dumbbell,
  Activity,
  Zap,
  Info,
  Star,
  CheckCircle,
} from "lucide-react";

export type ExerciseType = "bicep-curls" | "sit-ups" | "vertical-jump";
export type AnalysisMode = "live" | "upload";

interface ExerciseSelectorProps {
  onStartAnalysis: (exercise: ExerciseType, mode: AnalysisMode) => void;
}

const exercises = [
  {
    value: "bicep-curls",
    label: "Bicep Curls",
    description: "Upper body strength assessment",
    icon: Dumbbell,
    difficulty: "Beginner",
    duration: "2-3 min",
    tips: "Keep your elbows stationary and focus on controlled movement",
    color: "from-blue-500 to-blue-600",
  },
  {
    value: "sit-ups",
    label: "Sit-ups",
    description: "Core strength and endurance",
    icon: Activity,
    difficulty: "Beginner",
    duration: "1-2 min",
    tips: "Engage your core and avoid pulling on your neck",
    color: "from-green-500 to-green-600",
  },
  {
    value: "vertical-jump",
    label: "Vertical Jump",
    description: "Lower body power measurement",
    icon: Zap,
    difficulty: "Intermediate",
    duration: "30 sec",
    tips: "Use your arms for momentum and land softly",
    color: "from-orange-500 to-orange-600",
  },
];

const analysisFeatures = [
  { name: "Real-time Rep Counting", icon: CheckCircle },
  { name: "Form Quality Analysis", icon: Star },
  { name: "Performance Metrics", icon: Activity },
  { name: "Audio Feedback", icon: Info },
];

export function EnhancedExerciseSelector({
  onStartAnalysis,
}: ExerciseSelectorProps) {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType | null>(
    null
  );
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("live");

  const handleStart = () => {
    if (!selectedExercise) return;
    onStartAnalysis(selectedExercise, analysisMode);
  };

  const selectedExerciseData = exercises.find(
    (e) => e.value === selectedExercise
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">AI Exercise Analysis</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Get real-time feedback on your exercise form and performance using
          advanced computer vision
        </p>
      </div>

      {/* Exercise Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Choose Your Exercise</CardTitle>
          <p className="text-muted-foreground">
            Select an exercise to begin your AI-powered assessment
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exercises.map((exercise) => (
              <Card
                key={exercise.value}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedExercise === exercise.value
                    ? "ring-2 ring-primary shadow-lg"
                    : "hover:shadow-md"
                }`}
                onClick={() =>
                  setSelectedExercise(exercise.value as ExerciseType)
                }
              >
                <CardContent className="p-6">
                  <div
                    className={`w-full h-24 bg-gradient-to-r ${exercise.color} rounded-lg mb-4 flex items-center justify-center`}
                  >
                    <exercise.icon className="h-10 w-10 text-white" />
                  </div>

                  <h3 className="font-semibold text-lg mb-2">
                    {exercise.label}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {exercise.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary">{exercise.difficulty}</Badge>
                    <Badge variant="outline">{exercise.duration}</Badge>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <Info className="h-3 w-3 inline mr-1" />
                    {exercise.tips}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Mode Selection */}
      {selectedExercise && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              Choose Your Analysis Method
            </CardTitle>
            <p className="text-muted-foreground">
              Both live camera and video upload options are available - you can
              switch between them anytime!
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card
                className={`cursor-pointer transition-all duration-200 ${
                  analysisMode === "live"
                    ? "ring-2 ring-primary bg-primary/5"
                    : "hover:shadow-md"
                }`}
                onClick={() => setAnalysisMode("live")}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="h-8 w-8 text-white" />
                  </div>

                  <h3 className="font-semibold text-lg mb-2">
                    📹 Live Camera Analysis
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get real-time feedback using your camera
                  </p>

                  <div className="space-y-2 text-xs text-left">
                    {analysisFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <feature.icon className="h-3 w-3 text-green-600" />
                        <span>{feature.name}</span>
                      </div>
                    ))}
                  </div>

                  <Badge className="mt-4 bg-green-100 text-green-800 hover:bg-green-100">
                    Real-time feedback
                  </Badge>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all duration-200 ${
                  analysisMode === "upload"
                    ? "ring-2 ring-primary bg-primary/5"
                    : "hover:shadow-md"
                }`}
                onClick={() => setAnalysisMode("upload")}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-8 w-8 text-white" />
                  </div>

                  <h3 className="font-semibold text-lg mb-2">
                    📁 Video Upload Analysis
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a pre-recorded video for detailed analysis
                  </p>

                  <div className="space-y-2 text-xs text-left">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-blue-600" />
                      <span>Detailed Frame Analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-3 w-3 text-blue-600" />
                      <span>Comprehensive Report</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-3 w-3 text-blue-600" />
                      <span>Performance Insights</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Info className="h-3 w-3 text-blue-600" />
                      <span>Supports up to 100MB</span>
                    </div>
                  </div>

                  <Badge className="mt-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
                    Detailed analysis
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-center text-muted-foreground">
                💡 <strong>Tip:</strong> You can switch between camera and
                upload modes anytime during analysis!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Exercise Summary & Start Button */}
      {selectedExercise && selectedExerciseData && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${selectedExerciseData.color} rounded-lg flex items-center justify-center`}
                >
                  <selectedExerciseData.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedExerciseData.label}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {analysisMode === "live"
                      ? "📹 Live Camera Analysis"
                      : "📁 Video Upload Analysis"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You can switch modes anytime during analysis
                  </p>
                </div>
              </div>

              <Button onClick={handleStart} size="lg" className="h-12 px-8">
                <Play className="h-5 w-5 mr-2" />
                Start {analysisMode === "live" ? "Live" : "Upload"} Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
