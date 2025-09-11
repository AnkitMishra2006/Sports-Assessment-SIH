import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  EnhancedExerciseSelector as ExerciseSelector,
  type ExerciseType,
  type AnalysisMode,
} from "@/components/Exercise/EnhancedExerciseSelector";
import { LiveAnalysisInterface } from "@/components/Exercise/LiveAnalysisInterface";
import { VideoUploadInterface } from "@/components/Exercise/VideoUploadInterface";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { useToast } from "@/hooks/use-toast";

type AppState = "selection" | "analysis" | "results";

interface AnalysisResults {
  submissionId?: string;
  exerciseType?: string;
  exercise?: ExerciseType;
  totalReps?: number;
  formQuality?: number;
  cheatingDetected?: boolean;
  averageSpeed?: number;
  duration?: number;
  stages?: string[];
  sessionTime?: number;
  metrics?: {
    repCount?: number;
    formScore?: number;
    averageSpeed?: number;
    sessionTime?: number;
    maxHeight?: number;
    consistencyScore?: number;
    formIssues?: string[];
    overallScore?: number;
  };
  analysis?: {
    strengths: string[];
    improvements: string[];
    recommendations: string[];
    overallScore: number;
  };
  videoUrl?: string;
  // Backend submission data
  submission?: {
    _id: string;
    exerciseType: string;
    result: number;
    resultUnit: string;
    percentile: number;
    analysisResults: {
      total_reps?: number;
      left_reps?: number;
      right_reps?: number;
      form_score?: number;
      consistency_score?: number;
      max_height_cm?: number;
      jump_count?: number;
      cheat_detected?: boolean;
      form_issues?: string[];
      frames_processed?: number;
      detection_quality?: number;
    };
    videoFilename?: string;
    createdAt: string;
  };
  // Legacy compatibility fields
  results?: unknown;
  maxHeight?: number;
  consistencyScore?: number;
  formIssues?: string[];
  framesProcessed?: number;
  detectionQuality?: number;
  leftReps?: number;
  rightReps?: number;
}

export default function ExerciseAnalysis() {
  const [searchParams] = useSearchParams();
  const [appState, setAppState] = useState<AppState>("selection");
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType | null>(
    null
  );
  const [selectedMode, setSelectedMode] = useState<AnalysisMode>("live");
  const [analysisResults, setAnalysisResults] =
    useState<AnalysisResults | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check for URL parameters to pre-select exercise
  useEffect(() => {
    const exerciseParam = searchParams.get("exercise");
    const modeParam = searchParams.get("mode");

    if (exerciseParam) {
      // Map URL parameters to valid exercise types
      const exerciseMap: Record<string, ExerciseType> = {
        "vertical-jump": "vertical-jump",
        "sit-ups": "sit-ups",
        "bicep-curls": "bicep-curls",
        "push-ups": "bicep-curls", // Map push-ups to bicep-curls for now
      };

      const mappedExercise =
        exerciseMap[exerciseParam] || (exerciseParam as ExerciseType);
      if (
        ["bicep-curls", "sit-ups", "vertical-jump"].includes(mappedExercise)
      ) {
        setSelectedExercise(mappedExercise);
        setSelectedMode((modeParam as AnalysisMode) || "upload"); // Default to upload for MVP
        setAppState("analysis");
      }
    }
  }, [searchParams]);

  const handleStartAnalysis = (exercise: ExerciseType, mode: AnalysisMode) => {
    setSelectedExercise(exercise);
    setSelectedMode(mode);
    setAppState("analysis");
  };

  const handleAnalysisComplete = (results: unknown) => {
    // Cast to access properties
    const r = results as Record<string, unknown>;

    // Normalize the results format
    const normalizedResults: AnalysisResults = {
      exercise: (r.exercise ||
        r.exerciseType ||
        selectedExercise ||
        "bicep-curls") as ExerciseType,
      totalReps: Number(
        r.totalReps || (r.metrics as Record<string, unknown>)?.repCount || 0
      ),
      formQuality: Number(
        r.formQuality || (r.metrics as Record<string, unknown>)?.formScore || 0
      ),
      averageSpeed: Number(
        r.averageSpeed ||
          (r.metrics as Record<string, unknown>)?.averageSpeed ||
          0
      ),
      duration: Number(
        r.duration || (r.metrics as Record<string, unknown>)?.sessionTime || 0
      ),
      cheatingDetected: Boolean(r.cheatingDetected || false),
      stages: (r.stages as string[]) || [],
    };

    setAnalysisResults(normalizedResults);
    setAppState("results");
    toast({
      title: "Analysis Complete",
      description: `Your ${(normalizedResults.exercise || "exercise").replace(
        "-",
        " "
      )} assessment has been completed.`,
    });
  };

  const handleSaveResults = () => {
    if (!analysisResults) return;

    // Save to localStorage (mock backend)
    const existingData = JSON.parse(
      localStorage.getItem("athlete_data") || "{}"
    );
    const exerciseHistory = existingData.exerciseHistory || [];

    const newEntry = {
      id: Date.now().toString(),
      exercise: analysisResults.exercise,
      date: new Date().toISOString(),
      reps: analysisResults.totalReps,
      formQuality: analysisResults.formQuality,
      duration: analysisResults.duration,
      cheatingDetected: analysisResults.cheatingDetected,
      mode: selectedMode,
    };

    exerciseHistory.push(newEntry);
    existingData.exerciseHistory = exerciseHistory;
    localStorage.setItem("athlete_data", JSON.stringify(existingData));

    toast({
      title: "Results Saved",
      description: "Your analysis results have been saved to your profile.",
    });
  };

  const handleNewAnalysis = () => {
    setAppState("selection");
    setSelectedExercise(null);
    setAnalysisResults(null);
  };

  const handleBack = () => {
    if (appState === "analysis") {
      setAppState("selection");
    } else if (appState === "results") {
      setAppState("analysis");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 p-4">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">AI Exercise Analysis</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get real-time feedback on your exercise form and performance using
            advanced AI analysis
          </p>
        </div>

        {appState === "selection" && (
          <ExerciseSelector onStartAnalysis={handleStartAnalysis} />
        )}

        {appState === "analysis" && selectedExercise && (
          <div className="space-y-6">
            {/* Analysis Method Toggle */}
            <div className="flex justify-center">
              <div className="bg-muted p-1 rounded-lg">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => setSelectedMode("live")}
                    className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
                      selectedMode === "live"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    📹 Live Camera
                  </button>
                  <button
                    onClick={() => setSelectedMode("upload")}
                    className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
                      selectedMode === "upload"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    📁 Upload Video
                  </button>
                </div>
              </div>
            </div>

            {selectedMode === "live" ? (
              <LiveAnalysisInterface
                exerciseType={selectedExercise}
                onComplete={handleAnalysisComplete}
                onBack={handleBack}
              />
            ) : (
              <VideoUploadInterface
                exerciseType={selectedExercise}
                onComplete={handleAnalysisComplete}
                onBack={handleBack}
              />
            )}
          </div>
        )}

        {appState === "results" &&
          analysisResults &&
          analysisResults.exercise && (
            <ResultsDashboard
              results={{
                exercise: analysisResults.exercise,
                totalReps: analysisResults.totalReps || 0,
                formQuality: analysisResults.formQuality || 0,
                cheatingDetected: analysisResults.cheatingDetected || false,
                averageSpeed: analysisResults.averageSpeed || 0,
                duration: analysisResults.duration || 0,
                stages: analysisResults.stages || [],
              }}
              onNewAnalysis={handleNewAnalysis}
              onSaveResults={handleSaveResults}
            />
          )}
      </div>
    </div>
  );
}
